# Dream Weaver Log

A personal dream logging system with structured data tracking and sleep analysis.

## About

Dream Weaver Log is a web application designed to help you track and analyze your dreams and sleep patterns. Built with modern web technologies, it provides an intuitive interface for logging dreams, tracking sleep data, and gaining insights into your sleep quality.

## Features

- 📝 **Dream Logging**: Record and organize your dreams with detailed entries
- 😴 **Sleep Tracking**: Monitor sleep duration, quality, and patterns
- 📊 **Sleep Analysis**: Automatic parsing of sleep data from screenshots (Deep, Light, REM sleep tracking)
- 🌙 **Sleep Scores**: Track sleep quality metrics and continuity scores
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop devices
- 🇹🇭 **Thai Language Support**: Full Thai language interface

## Technology Stack

This project is built with:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui with Radix UI primitives
- **Backend**: Supabase (Database & Edge Functions)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun package manager

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd dream-weaver-log
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
dream-weaver-log/
├── src/               # Source code
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions
│   └── main.tsx       # Application entry point
├── supabase/          # Supabase configuration and functions
│   └── functions/     # Edge functions
├── public/            # Static assets
└── index.html         # HTML template
```

## Deployment

Build the production bundle:
```sh
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.).

## License

This is a personal project. All rights reserved.

## Author

Bon
