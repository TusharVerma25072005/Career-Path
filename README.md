# Career Pathfinder

An AI-powered career assessment and guidance platform that helps users discover their ideal career paths through personalized assessments and intelligent recommendations.

## Project Features

- **Interactive Career Assessment**: Comprehensive questionnaire to evaluate interests, skills, and preferences
- **AI-Powered Recommendations**: Get personalized career suggestions based on your assessment results
- **Assessment-Specific Chat**: Discuss your results with an AI career counselor
- **Assessment Tracking**: Limited free assessments with upgrade options
- **User Authentication**: Secure login and user management

## How to run this project locally

Follow these steps to set up the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd pathfinder-quest-14

# Step 3: Install the necessary dependencies
npm install

# Step 4: Set up environment variables
# Create a .env file and add your Supabase credentials

# Step 5: Start the development server
npm run dev
```

## Technologies Used

This project is built with:

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn-ui + Tailwind CSS
- **Backend**: Supabase (Database + Authentication + Edge Functions)
- **AI Integration**: Google Gemini API
- **Routing**: React Router

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Main application pages
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and configurations
- `/supabase/functions` - Edge Functions for AI interactions

## Database Setup

Run the provided SQL migration scripts in your Supabase dashboard:
- `SIMPLE_SETUP.sql` - Basic user assessment usage tracking
- `MIGRATION_FOR_ASSESSMENT_CHATS.sql` - Assessment-specific chat sessions

## Deployment

This project can be deployed to any hosting platform that supports Node.js applications. Popular options include:

- Vercel
- Netlify
- Railway
- Heroku

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `GEMINI_API_KEY` - Google Gemini API key (for Edge Functions)
