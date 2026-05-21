# AI Interview Copilot v5 - Frontend

A modern, professional React TypeScript frontend for the AI Interview Copilot v5 system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key (set as environment variable)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**
Create a `.env` file in the root:
```env
VITE_API_URL=http://localhost:8000
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   ├── interview/      # Interview-specific components
│   ├── dashboard/      # Dashboard components
│   ├── visualization/  # Charts and graphs
│   └── report/         # Report components
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── UploadPage.tsx
│   ├── InterviewPage.tsx
│   ├── DashboardPage.tsx
│   ├── SkillGraphPage.tsx
│   ├── TimelinePage.tsx
│   └── FinalReportPage.tsx
├── services/           # API services and types
│   ├── api.ts          # API client
│   └── types.ts        # TypeScript types
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Global styles
```

## 🎨 Features

### Core Pages
1. **Landing Page** - Introduction and product overview
2. **Upload Page** - Resume and job description upload
3. **Interview Page** - Live interview interface with voice recording
4. **Dashboard Page** - Real-time metrics and analytics
5. **Skill Graph Page** - Visual skill analysis
6. **Timeline Page** - Interview history and scores
7. **Final Report Page** - Comprehensive evaluation report

### Key Features
- 🎯 **Real-time Dashboard** - Live interview metrics updating every 3 seconds
- 🎙️ **Voice Recording** - Browser-based audio capture and transcription
- 📊 **Interactive Charts** - Score visualization and skill graphs
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Professional dark theme UI
- ⚡ **Fast Performance** - Optimized React components

## 🔧 Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **Recharts** - Chart library (for skill graphs)

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` by default. Key API endpoints:

- `POST /start-interview` - Initialize interview session
- `GET /next-question/{session_id}` - Get next question
- `POST /submit-answer` - Submit candidate answer
- `GET /dashboard/{session_id}` - Get live dashboard data
- `GET /final-report/{session_id}` - Get final evaluation

## 🎯 Usage Guide

### Starting an Interview
1. Navigate to upload page
2. Enter candidate name and position
3. Upload resume (PDF) and/or job description
4. Click "Start Interview"

### During Interview
1. Answer questions via voice or text
2. View real-time scores on dashboard
3. Monitor stress levels and performance trends

### After Interview
1. Review final report with scores and recommendations
2. Download interview data
3. View skill graphs and timeline

## 🎨 UI Components

### Button Component
```tsx
<Button variant="primary" size="lg" loading={false}>
  Start Interview
</Button>
```

### Card Component
```tsx
<Card variant="glass" hover={true}>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Score Display
```tsx
<div className={`text-3xl font-bold ${getScoreColor(8.5)}`}>
  8.5
</div>
```

## 🔄 Real-time Updates

The dashboard automatically refreshes every 3 seconds to show:
- Live candidate scores
- Interview progress
- Performance trends
- Hiring predictions

## 📱 Responsive Design

- **Desktop**: Full dashboard with all features
- **Tablet**: Optimized layout for touch
- **Mobile**: Simplified interface for essential features

## 🌙 Dark Theme

Professional dark theme with:
- Primary blue accents
- Glass morphism effects
- Smooth transitions
- High contrast for readability

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Environment Variables
- `VITE_API_URL` - Backend API URL
- `VITE_APP_TITLE` - Application title

## 🔧 Development

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation if needed

### API Integration
1. Add types to `src/services/types.ts`
2. Add API functions to `src/services/api.ts`
3. Use in components with error handling

### Styling
- Use Tailwind classes
- Follow component pattern
- Maintain consistent dark theme

## 🐛 Troubleshooting

### Common Issues
1. **API Connection**: Ensure backend is running on port 8000
2. **Voice Recording**: Requires HTTPS for microphone access
3. **File Upload**: Check file size limits (10MB max)
4. **Real-time Updates**: Verify WebSocket connection

### Debug Mode
Set `DEBUG=true` in environment for detailed logging.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📞 Support

For support and questions:
- Check the documentation
- Review API endpoints
- Test with sample data
