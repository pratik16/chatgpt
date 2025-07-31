# ChatGPT Clone UI

A modern ChatGPT clone built with Angular 19.2.15 and SCSS, featuring an exact replica of the ChatGPT interface.

## Features

- **Exact ChatGPT UI Design**: Pixel-perfect recreation of the ChatGPT interface
- **Responsive Layout**: Sidebar with chat history and main chat area
- **Message Components**: User and assistant message styling with code block support
- **Interactive Input**: Auto-expanding textarea with send button
- **Modern Styling**: Dark theme with ChatGPT's signature colors

## Components

- **Sidebar**: Chat history, new chat button, and user profile
- **Chat Area**: Welcome screen and message display
- **Chat Message**: Individual message component with user/assistant styling
- **Message Input**: Interactive input area with send functionality

## Technologies Used

- Angular 19.2.15
- SCSS for styling
- Standalone components
- TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   ng serve
   ```

3. Open your browser and navigate to `http://localhost:4200`

## UI Features

- Dark theme matching ChatGPT's design
- Hover effects and transitions
- Code block formatting
- Responsive textarea
- Custom scrollbars
- SVG icons for better visual appeal

## Structure

```
src/app/components/
├── sidebar/           # Left sidebar with chat history
├── chat-area/         # Main chat display area
├── chat-message/      # Individual message component
└── message-input/     # Input area with send button
```

This is a UI-only implementation. No actual chat functionality is included - it's purely for demonstration of the interface design.
