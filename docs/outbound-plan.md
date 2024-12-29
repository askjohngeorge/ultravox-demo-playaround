# Outbound Call Implementation Plan

This document outlines the plan to implement outbound phone call functionality using Twilio in the Ultravox demo template.

## Prerequisites

- Package Manager: pnpm
- Required Packages: `twilio` (to be installed via `pnpm add twilio`)

## Environment Variables

Create `.env.example` with the following variables:
```
# Existing variables
ULTRAVOX_API_KEY=your_ultravox_api_key_here

# New Twilio variables
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Implementation Steps

### 1. Type Definitions (`lib/types.ts`)

Add new types to support Twilio integration:

```typescript
export interface CallMedium {
  type: 'web' | 'twilio';
  phoneNumber?: string;  // Required for Twilio calls
}

// Update existing CallConfig
export interface CallConfig {
  // ... existing fields ...
  medium?: CallMedium;
}
```

### 2. Backend API (`app/api/ultravox/route.ts`)

Modify the API route to handle Twilio calls:

1. Initialize Twilio client
2. Update POST handler to:
   - Create Ultravox call as usual
   - If medium type is 'twilio', initiate outbound call using Twilio
   - Return combined response with Ultravox and Twilio call details

### 3. Frontend Updates (`app/page.tsx`)

1. Add new state variables:
   ```typescript
   const [callType, setCallType] = useState<'web' | 'twilio'>('web');
   const [phoneNumber, setPhoneNumber] = useState<string>('');
   ```

2. Add UI components:
   - Call type selector (dropdown)
   - Phone number input field (shown when Twilio selected)
   - Update call button behavior

3. Update call initiation logic to include medium configuration

### 4. Styling Updates

1. Add new styles for:
   - Call type selector
   - Phone number input
   - Form layout adjustments

## Implementation Order

1. Environment Setup
   - Add `.env.example`
   - Install Twilio package
   - Update `.env.local` with actual credentials

2. Type Updates
   - Update `types.ts`
   - Verify type compatibility

3. Backend Changes
   - Implement Twilio integration in API route
   - Add error handling
   - Test Ultravox call creation
   - Test Twilio call initiation

4. Frontend Updates
   - Add new UI components
   - Implement state management
   - Update call handling
   - Add form validation

5. Testing
   - Test web calls still work
   - Test phone number validation
   - Test outbound call flow
   - Verify error handling

## Notes

- Keep existing web call functionality as default
- Ensure proper error handling for both Ultravox and Twilio errors
- Add phone number validation
- Consider international phone number format support
- Add loading states during call initiation
- Consider adding call status indicators specific to Twilio calls

## Security Considerations

- Never expose Twilio credentials in client-side code
- Validate phone numbers server-side
- Consider rate limiting for outbound calls
- Log all call attempts for auditing
- Implement proper error handling for failed calls
