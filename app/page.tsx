'use client';

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { startCall, endCall } from '@/lib/callFunctions'
import { CallConfig, SelectedTool, CallMediumType } from '@/lib/types'
import demoConfig from './demo-config';
import { Role, Transcript, UltravoxExperimentalMessageEvent, UltravoxSessionStatus } from 'ultravox-client';
import BorderedImage from '@/app/components/BorderedImage';
import UVLogo from '@/public/UVMark-White.svg';
import CallStatus from './components/CallStatus';
import DebugMessages from '@/app/components/DebugMessages';
import MicToggleButton from './components/MicToggleButton';
import { PhoneOffIcon, PhoneIcon, MicIcon } from 'lucide-react';
import OrderDetails from './components/OrderDetails';

type SearchParamsProps = {
  showMuteSpeakerButton: boolean;
  modelOverride: string | undefined;
  showDebugMessages: boolean;
  showUserTranscripts: boolean;
};

type SearchParamsHandlerProps = {
  children: (props: SearchParamsProps) => React.ReactNode;
};

function SearchParamsHandler({ children }: SearchParamsHandlerProps) {
  // Process query params to see if we want to change the behavior for showing speaker mute button or changing the model
  const searchParams = useSearchParams();
  const showMuteSpeakerButton = searchParams.get('showSpeakerMute') === 'true';
  const showDebugMessages = searchParams.get('showDebugMessages') === 'true';
  const showUserTranscripts = searchParams.get('showUserTranscripts') === 'true';
  let modelOverride: string | undefined;
  
  if (searchParams.get('model')) {
    modelOverride = "fixie-ai/" + searchParams.get('model');
  }

  return children({ showMuteSpeakerButton, modelOverride, showDebugMessages, showUserTranscripts });
}

export default function Home() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('off');
  const [callTranscript, setCallTranscript] = useState<Transcript[] | null>([]);
  const [callDebugMessages, setCallDebugMessages] = useState<UltravoxExperimentalMessageEvent[]>([]);
  const [customerProfileKey, setCustomerProfileKey] = useState<string | null>(null);
  const [callType, setCallType] = useState<CallMediumType>('web');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [callTranscript]);

  const handleStatusChange = useCallback((status: UltravoxSessionStatus | string | undefined) => {
    if(status) {
      setAgentStatus(status);
    } else {
      setAgentStatus('off');
    }
    
  }, []);

  const handleTranscriptChange = useCallback((transcripts: Transcript[] | undefined) => {
    if(transcripts) {
      setCallTranscript([...transcripts]);
    }
  }, []);

  const handleDebugMessage = useCallback((debugMessage: UltravoxExperimentalMessageEvent) => {
    setCallDebugMessages(prevMessages => [...prevMessages, debugMessage]);
  }, []);

  const clearCustomerProfile = useCallback(() => {
    // This will trigger a re-render of CustomerProfileForm with a new empty profile
    setCustomerProfileKey(prev => prev ? `${prev}-cleared` : 'cleared');
  }, []);

  const handleStartCallButtonClick = async (modelOverride?: string, showDebugMessages?: boolean) => {
    try {
      handleStatusChange('Starting call...');
      setCallTranscript(null);
      setCallDebugMessages([]);
      clearCustomerProfile();

      // Generate a new key for the customer profile
      const newKey = `call-${Date.now()}`;
      setCustomerProfileKey(newKey);

      // Setup our call config including the call key as a parameter restriction
      let callConfig: CallConfig = {
        systemPrompt: demoConfig.callConfig.systemPrompt,
        model: modelOverride || demoConfig.callConfig.model,
        languageHint: demoConfig.callConfig.languageHint,
        voice: demoConfig.callConfig.voice,
        temperature: demoConfig.callConfig.temperature,
        maxDuration: demoConfig.callConfig.maxDuration,
        timeExceededMessage: demoConfig.callConfig.timeExceededMessage,
        medium: callType === 'twilio' ? {
          type: 'twilio',
          config: {
            phoneNumber
          }
        } : undefined
      };

      const paramOverride: { [key: string]: any } = {
        "callId": newKey
      }

      let cpTool: SelectedTool | undefined = demoConfig?.callConfig?.selectedTools?.find(tool => tool.toolName === "createProfile");
      
      if (cpTool) {
        cpTool.parameterOverrides = paramOverride;
      }
      callConfig.selectedTools = demoConfig.callConfig.selectedTools;

      await startCall({
        onStatusChange: handleStatusChange,
        onTranscriptChange: handleTranscriptChange,
        onDebugMessage: handleDebugMessage
      }, callConfig, showDebugMessages);

      if (callType === 'web') {
        setIsCallActive(true);
      } else {
        // For phone calls, just show success message and reset
        setTimeout(() => {
          setPhoneNumber('');
          handleStatusChange('Ready to start a new call');
        }, 3000);
      }
    } catch (error) {
      handleStatusChange(`Error starting call: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEndCallButtonClick = async () => {
    try {
      handleStatusChange('Ending call...');
      if (callType === 'web') {
        await endCall();
      }
      setIsCallActive(false);
      clearCustomerProfile();
      setCustomerProfileKey(null);
      handleStatusChange('Call ended successfully');
    } catch (error) {
      handleStatusChange(`Error ending call: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsHandler>
        {({ showMuteSpeakerButton, modelOverride, showDebugMessages, showUserTranscripts }: SearchParamsProps) => (
          <div className="flex flex-col items-center justify-center">
            {/* Main Area */}
            <div className="max-w-[1206px] mx-auto w-full py-5 pl-5 pr-[10px] border border-[#2A2A2A] rounded-[3px]">
              <div className="flex flex-col justify-center lg:flex-row ">
                {/* Action Area */}
                <div className="w-full lg:w-2/3">
                  <h1 className="text-2xl font-bold w-full">{demoConfig.title}</h1>
                  <div className="flex flex-col justify-between items-start h-full font-mono p-4 ">
                    <div className="mt-20 self-center">
                      <BorderedImage
                        src={UVLogo}
                        alt="todo"
                        size="md"
                      />
                    </div>
                    {isCallActive && callType === 'web' ? (
                      <div className="w-full">
                        <div className="mb-5 relative">
                          <div 
                            ref={transcriptContainerRef}
                            className="h-[300px] p-2.5 overflow-y-auto relative"
                          >
                            {callTranscript && callTranscript.map((transcript, index) => (
                              <div key={index}>
                                {showUserTranscripts ? (
                                  <>
                                    <p><span className="text-gray-600">{transcript.speaker === 'agent' ? "Ultravox" : "User"}</span></p>
                                    <p className="mb-4"><span>{transcript.text}</span></p>
                                  </>
                                ) : (
                                  transcript.speaker === 'agent' && (
                                    <>
                                      <p><span className="text-gray-600">{transcript.speaker === 'agent' ? "Ultravox" : "User"}</span></p>
                                      <p className="mb-4"><span>{transcript.text}</span></p>
                                    </>
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-t from-transparent to-black pointer-events-none" />
                        </div>
                        <div className="flex justify-between space-x-4 p-4 w-full">
                          <MicToggleButton role={Role.USER}/>
                          { showMuteSpeakerButton && <MicToggleButton role={Role.AGENT}/> }
                          <button
                            type="button"
                            className="flex-grow flex items-center justify-center h-10 bg-red-500"
                            onClick={handleEndCallButtonClick}
                            disabled={!isCallActive}
                          >
                            <PhoneOffIcon width={24} className="brightness-0 invert" />
                            <span className="ml-2">End Call</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="h-[300px] text-gray-400 mb-6 mt-32 lg:mt-0">
                          {demoConfig.overview}
                        </div>
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center space-x-4">
                            <button
                              className={`flex items-center space-x-2 px-4 py-2 rounded ${
                                callType === 'web' 
                                  ? 'bg-gray-700 text-white' 
                                  : 'bg-transparent text-gray-400'
                              }`}
                              onClick={() => setCallType('web')}
                            >
                              <MicIcon size={18} />
                              <span>Web</span>
                            </button>
                            <button
                              className={`flex items-center space-x-2 px-4 py-2 rounded ${
                                callType === 'twilio' 
                                  ? 'bg-gray-700 text-white' 
                                  : 'bg-transparent text-gray-400'
                              }`}
                              onClick={() => setCallType('twilio')}
                            >
                              <PhoneIcon size={18} />
                              <span>Phone</span>
                            </button>

                            {callType === 'twilio' && (
                              <input
                                type="tel"
                                placeholder="Enter phone number (e.g., +1234567890)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="bg-gray-700 text-white rounded px-4 py-2 flex-1"
                                pattern="^\+[1-9]\d{1,14}$"
                                title="Please enter phone number in E.164 format (e.g., +1234567890)"
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            className="hover:bg-gray-700 px-6 py-2 border-2 w-full mb-4"
                            onClick={() => {
                              if (callType === 'twilio' && !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
                                handleStatusChange('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
                                return;
                              }
                              handleStartCallButtonClick(modelOverride, showDebugMessages);
                            }}
                          >
                            Start {callType === 'twilio' ? 'Phone' : 'Web'} Call
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Call Status */}
                <CallStatus status={agentStatus}>
                  <OrderDetails />
                </CallStatus>
              </div>
            </div>
            {/* Debug View */}
            <DebugMessages debugMessages={callDebugMessages} />
          </div>
        )}
      </SearchParamsHandler>
    </Suspense>
  )
}