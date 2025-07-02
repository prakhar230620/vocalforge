# VocalForge

VocalForge is a Progressive Web App (PWA) built with Next.js that provides voice-based AI interactions and works offline.

## Features

- Progressive Web App (PWA) with offline support
- Voice-based AI interactions using Gemini API
- Modern UI with Tailwind CSS and Radix UI components
- TypeScript for type safety
- Firebase integration

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm run start
```

## Deploying to Vercel

This project is configured for seamless deployment on Vercel. Follow these steps to deploy:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in the Vercel dashboard
3. Configure the following environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY` - Your main Gemini API key
   - Any additional API keys used in your application
4. Deploy the application

Alternatively, you can use the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

## Environment Variables

Create a `.env.local` file for local development with the following variables:

```
GEMINI_API_KEY=your_api_key_here
```

For production, set these variables in the Vercel dashboard.
