# My Play Around with Ultravox Demo Template (Vercel)

This is my personal play around with the Ultravox demo template, forked from https://github.com/fixie-ai/ultravox-demo-template-vercel. It supports both web-based and phone-based interactions using Twilio.

## Features

- Web-based voice interactions using the browser's microphone
- Phone-based interactions using Twilio
- Real-time transcription display (web calls only)
- Easy toggle between web and phone call modes
- Support for custom system prompts and tools
- Configurable voice model and parameters

## Prerequisites

1. Node.js and npm installed
2. An Ultravox API key
3. Twilio account credentials (for phone calls)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
ULTRAVOX_API_KEY=your_ultravox_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Web Calls
1. Select "Web" mode using the toggle
2. Click "Start Web Call"
3. Allow microphone access when prompted
4. Speak with the AI agent
5. Use the mute button to control your microphone
6. Click "End Call" when finished

### Phone Calls
1. Select "Phone" mode using the toggle
2. Enter a phone number in E.164 format (e.g., +1234567890)
3. Click "Start Phone Call"
4. Answer the incoming call on your phone
5. Speak with the AI agent
6. Hang up when finished

## Configuration

The demo can be configured by modifying the following files:

- `app/demo-config.ts`: System prompt, model settings, and tools
- `lib/types.ts`: Type definitions and interfaces
- `app/page.tsx`: UI components and layout
- `app/api/ultravox/route.ts`: API route handling

## Customization

1. System Prompt: Update the prompt in `app/demo-config.ts`
2. Voice Model: Change the model in `app/demo-config.ts`
3. UI: Modify the components in `app/page.tsx`
4. Tools: Add or modify tools in `lib/clientTools.ts`

## Development

The main components are:

- Frontend (`app/page.tsx`): Handles UI and user interactions
- API Route (`app/api/ultravox/route.ts`): Manages Ultravox and Twilio integration
- Call Functions (`lib/callFunctions.ts`): Core call management logic
- Types (`lib/types.ts`): TypeScript type definitions
- Demo Config (`app/demo-config.ts`): Configuration settings

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Security Notes

- Keep your API keys secure
- Never commit `.env` files
- Use environment variables for sensitive data
- Validate phone numbers before making calls
- Implement rate limiting for production use

## Support

For issues and questions:
- Ultravox API: [Contact Ultravox Support](https://ultravox.ai)
- Template: Open an issue on GitHub
- Twilio: [Twilio Support](https://www.twilio.com/support)
