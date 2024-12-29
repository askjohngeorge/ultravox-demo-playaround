import { NextResponse, NextRequest } from 'next/server';
import { CallConfig } from '@/lib/types';
import twilio from 'twilio';

// Initialize Twilio client if credentials are available
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body: CallConfig = await request.json();
    console.log('Attempting to call Ultravox API...');

    // Validate Twilio configuration if it's a Twilio call
    if (body.medium?.type === 'twilio') {
      if (!twilioClient) {
        throw new Error('Twilio credentials not configured');
      }
      if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('Twilio phone number not configured');
      }
      if (!body.medium.config?.phoneNumber) {
        throw new Error('Destination phone number not provided');
      }
    }

    // Prepare Ultravox configuration
    const ultravoxConfig = {
      ...body,
      firstSpeaker: 'FIRST_SPEAKER_USER',
      medium: body.medium?.type === 'twilio' ? { twilio: {} } : undefined
    };
    console.log('Sending Ultravox config:', JSON.stringify(ultravoxConfig, null, 2));

    // Create Ultravox call
    const response = await fetch('https://api.ultravox.ai/api/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': `${process.env.ULTRAVOX_API_KEY}`,
      },
      body: JSON.stringify(ultravoxConfig),
    });

    console.log('Ultravox API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ultravox API error:', errorText);
      throw new Error(`Ultravox API error: ${response.status}, ${errorText}`);
    }

    const ultravoxData = await response.json();
    console.log('Ultravox joinUrl:', ultravoxData.joinUrl);
    console.log('Full Ultravox response:', JSON.stringify(ultravoxData, null, 2));

    // If this is a Twilio call, initiate the outbound call
    if (body.medium?.type === 'twilio' && body.medium.config?.phoneNumber) {
      try {
        console.log('Initiating Twilio call...');
        
        const twiml = `<Response><Connect><Stream url="${ultravoxData.joinUrl}"/></Connect></Response>`;
        console.log('Creating Twilio call with TwiML:', twiml);

        const call = await twilioClient!.calls.create({
          twiml,
          to: body.medium.config.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER!,
        });

        console.log('Twilio call initiated:', call.sid);
        
        return NextResponse.json({
          ...ultravoxData,
          twilioCallSid: call.sid,
          twilioStatus: call.status
        });
      } catch (twilioError) {
        console.error('Twilio call error:', twilioError);
        throw new Error(`Failed to initiate Twilio call: ${twilioError instanceof Error ? twilioError.message : String(twilioError)}`);
      }
    }

    return NextResponse.json(ultravoxData);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Error processing call request', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}