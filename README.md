# Legally AI Paralegal App

Professional AI-powered paralegal assistant for Indian legal professionals. Built with React, TypeScript, Tailwind CSS, and Google Gemini 2.5 Pro for intelligent legal assistance.

## Features

- **ChatGPT-style Interface**: Intuitive conversation interface optimized for legal professionals
- **Google Gemini 2.5 Pro Integration**: Advanced AI model with legal-specific optimization
- **Legal-focused Functionality**: Specialized prompts and context for paralegal tasks
- **Streaming Responses**: Real-time AI response delivery for better user experience
- **Multi-turn Conversations**: Maintains conversation history for complex legal discussions
- **Professional Theme System**: Light/dark themes with legal industry color palette
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility Compliant**: WCAG 2.1 AA+ compliance with screen reader support

## Quick Start

### Prerequisites

- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm))
- Google AI Studio API key ([get one here](https://aistudio.google.com/app/apikey))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd legally-assist-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
```

### Environment Setup

1. Create a `.env.local` file in the project root
2. Add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Never commit your `.env.local` file to version control

### Development

```sh
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### API Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `GEMINI_API_KEY`
4. Monitor usage and set up billing alerts in Google Cloud Console

## Project Structure

```
src/
├── components/         # React components
│   ├── chat/          # Chat interface components
│   ├── layout/        # Layout components
│   ├── modals/        # Modal dialogs
│   ├── theme/         # Theme management
│   └── ui/            # shadcn/ui base components
├── hooks/             # Custom React hooks
│   └── use-gemini.ts  # Gemini AI integration hook
├── lib/               # Utilities and services
│   └── gemini.ts      # Gemini AI service
├── pages/             # Route components
└── assets/            # Static assets
```

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **AI Integration**: Google Gemini 2.5 Pro
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **Animations**: Framer Motion
- **State Management**: React Query
- **Build Tool**: Vite
- **Routing**: React Router DOM

## AI Integration

This app integrates with Google Gemini 2.5 Pro for intelligent legal assistance:

- **Streaming Responses**: Real-time token delivery
- **Legal Context**: Optimized for Indian legal system
- **Input Validation**: Comprehensive security measures
- **Error Handling**: Automatic retry with exponential backoff
- **Conversation Management**: Multi-turn dialogue support

### Usage Example

```typescript
import { useGemini } from './hooks/use-gemini'

function ChatComponent() {
  const { sendMessage, response, isLoading, error } = useGemini({
    multiTurn: true,
    legalContext: true
  })

  const handleSend = async (message: string) => {
    await sendMessage(message)
  }

  return (
    <div>
      {isLoading && <div>Thinking...</div>}
      {error && <div>Error: {error.message}</div>}
      {response && <div>{response}</div>}
    </div>
  )
}
```

## Security & Privacy

- **Input Validation**: XSS protection and content filtering
- **API Key Security**: Environment variable based, never logged
- **Data Privacy**: No conversation data stored or logged
- **Rate Limiting**: Automatic API rate limit handling
- **Content Safety**: Built-in safety filters for legal content

## Development Guidelines

- Follow TypeScript strict mode
- Use comprehensive JSDoc documentation
- Implement proper error handling
- Maintain WCAG 2.1 AA+ accessibility
- Write modular, testable code
- Keep dependencies up to date

## Testing

```sh
# TODO: Set up testing framework
# Recommended: Vitest for unit tests
npm install -D vitest @vitest/ui jsdom
npm run test
```

## Deployment

### Lovable Platform
Simply open [Lovable](https://lovable.dev/projects/b6314c27-f46b-4fbf-a073-4f5673af8e79) and click Share → Publish.

### Custom Deployment
The app can be deployed to any static hosting provider:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder after building
- **GitHub Pages**: Use the built-in GitHub Actions workflow

### Environment Variables for Production

Set these environment variables in your hosting platform:
- `GEMINI_API_KEY`: Your Google AI Studio API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper documentation
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for legal professional use.

## Support

For technical support or questions about legal AI integration, please refer to the documentation or contact the development team.
