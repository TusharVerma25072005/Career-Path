# Career Chat Feature Documentation

## Overview
The Career Chat feature provides AI-powered career guidance using Google Gemini AI. Users can ask questions about their career assessment results and get personalized advice.

## Architecture

### Components
- **CareerChat.tsx**: Main chat interface component
- **career-chat Edge Function**: Serverless function handling AI requests
- **chat_messages table**: Database storage for conversation history

### Flow
1. User sends message through React component
2. Message sent to Supabase Edge Function
3. Function stores user message in database
4. Function calls Google Gemini AI with context
5. AI response stored in database
6. Response returned to user

## Setup Requirements

### 1. Google Gemini API Key
```bash
# Get API key from https://makersuite.google.com
npx supabase secrets set GEMINI_API_KEY=your_api_key_here
```

### 2. Database Table
The `chat_messages` table should exist with:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `content` (text)
- `is_user` (boolean)
- `created_at` (timestamptz)

### 3. Row Level Security
Policies ensure users can only access their own messages.

## Usage

### In Career Assessment Results
After completing an assessment, users can click the chat button to start a conversation with the AI advisor.

### API Format
The Edge Function expects:
```json
{
  "message": "User's question",
  "userId": "user-uuid",
  "assessmentData": "JSON string of assessment results"
}
```

## Features

### Context-Aware Responses
The AI has access to:
- User's career assessment results
- Previous conversation history
- Current job market trends knowledge

### Conversation History
- Messages persist across sessions
- Users can review past conversations
- Auto-scroll to latest messages

### Safety & Privacy
- Row-level security on all data
- API keys stored in Supabase secrets
- Content filtering via Gemini safety settings

## Cost Considerations

### Gemini API Pricing
- Free tier: 15 requests/minute, 1,500/day
- Paid: $0.35 per 1M input tokens
- Very affordable for typical usage

### Optimization
- 300 token limit on responses
- Conversation context limited to assessment data
- Rate limiting handled by Gemini API

## Troubleshooting

### Common Issues
1. **"GEMINI_API_KEY not configured"**
   - Ensure API key is set in Supabase secrets
   - Redeploy function after setting secrets

2. **"Table 'chat_messages' doesn't exist"**
   - Run the migration SQL in Supabase dashboard
   - Check table exists in Table Editor

3. **"Row-level security policy violation"**
   - Verify RLS policies are correctly set
   - Check user authentication status

### Debug Mode
Add console.log statements in the Edge Function to debug:
```typescript
console.log('Request data:', { message, userId, assessmentData });
```

## Future Enhancements

### Possible Improvements
- [ ] Voice message support
- [ ] File attachment for resumes
- [ ] Integration with job boards
- [ ] Multi-language support
- [ ] Conversation export/sharing
- [ ] Advanced context memory