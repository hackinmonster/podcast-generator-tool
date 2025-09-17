# NotebookLM Prompt Generator

A web application that transforms learning topics into focused NotebookLM research and podcast prompts. Perfect for creating structured learning experiences with Google's NotebookLM tool.

## Features

- **Topic Input**: Enter any learning subject you want to explore
- **Smart Clarification**: Answer 2-3 follow-up questions to narrow your focus
- **Dual Prompt Generation**: 
  - 7 "Discover Sources" prompts for research
  - 7 "Create Podcast" prompts for NotebookLM's Audio Overview feature
- **Copy-to-Clipboard**: Easy copying of individual prompts
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd podcast-generator-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Getting an OpenAI API Key

1. Visit [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to the API section
4. Generate a new API key
5. Add billing information (required for API usage)

## Usage Guide

### Step 1: Enter Your Topic
Type what you want to learn about. Examples:
- "the history of jazz fusion"
- "quantum computing fundamentals"
- "sustainable agriculture practices"

### Step 2: Answer Clarification Questions
The app will ask 2-3 questions to help focus your learning:
- Time period or era
- Perspective or angle of interest
- Specific region, industry, or context

### Step 3: Get Your Prompts
The app generates two sets of prompts:

**Discover Sources Prompts** - Use these in NotebookLM to research sub-topics:
- "Discover sources on early jazz fusion pioneers"
- "Discover sources on fusion's influence on rock music"
- etc.

**Create Podcast Prompts** - Use these for NotebookLM's Audio Overview:
- "Create a 5-minute audio overview on early jazz fusion pioneers"
- "Create a 5-minute audio overview on fusion's influence on rock music"
- etc.

## Technical Details

### Backend
- **Framework**: Node.js with Express
- **AI Integration**: OpenAI GPT-4o-mini
- **API Endpoints**:
  - `POST /api/generate-prompts` - Generate prompts
  - `GET /api/health` - Health check

### Frontend
- **Styling**: Tailwind CSS
- **JavaScript**: Vanilla JS (no frameworks)
- **Features**: Responsive design, clipboard API, error handling

### Project Structure
```
/
├── package.json          # Dependencies and scripts
├── server.js            # Express backend
├── public/
│   ├── index.html       # Main HTML file
│   ├── script.js        # Frontend JavaScript
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add your `OPENAI_API_KEY` in the Vercel dashboard under Environment Variables

### Heroku
1. Create a Heroku app: `heroku create your-app-name`
2. Set environment variable: `heroku config:set OPENAI_API_KEY=your_key`
3. Deploy: `git push heroku main`

### Google Cloud Platform
1. Create a new GCP project
2. Enable Cloud Run
3. Deploy using `gcloud run deploy`
4. Set environment variables in the Cloud Run console

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `PORT` | No | Server port (default: 3000) |

## API Usage Costs

This app uses OpenAI's GPT-4o-mini model. Typical costs per request:
- Input tokens: ~200-400 tokens ($0.0001-0.0002)
- Output tokens: ~400-600 tokens ($0.0002-0.0004)
- **Total per generation**: ~$0.0003-0.0006

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you've created a `.env` file
- Verify your API key is correct
- Ensure you have billing set up with OpenAI

### "Failed to generate prompts"
- Check your internet connection
- Verify your OpenAI account has available credits
- Try again - temporary API issues can occur

### Clipboard copy not working
- Some browsers require HTTPS for clipboard API
- The app includes a fallback for older browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 