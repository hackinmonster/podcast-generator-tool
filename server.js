const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate clarification questions endpoint
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const systemMessage = `You are an expert learning assistant. Your job is to help users create focused, effective learning experiences by asking the right clarifying questions.

Given a learning topic, generate exactly 3 clarifying questions that will help narrow the scope and make the learning more targeted and useful.

Format your response as a JSON array of objects, where each object has:
- "question": The clarifying question (should be specific and helpful)
- "placeholder": A helpful placeholder text showing example answers

Example format:
[
  {
    "question": "What specific time period or era interests you most?",
    "placeholder": "e.g., 1960s-1970s, modern day, historical overview"
  }
]

Make the questions relevant to the specific topic provided. Consider aspects like:
- Time periods, eras, or historical context
- Specific focus areas or subtopics
- Skill level or depth (beginner, intermediate, advanced)
- Practical vs theoretical approach
- Geographic or cultural context
- Industry or application context

Respond only with the JSON array, no additional text.`;

    const userMessage = `Learning topic: "${topic}"

Generate 3 clarifying questions to help focus this learning topic.`;

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.data.choices[0].message.content.trim();
    
    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', response);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response format
    if (!Array.isArray(questions) || questions.length !== 3) {
      throw new Error('Expected exactly 3 questions');
    }

    for (let q of questions) {
      if (!q.question || !q.placeholder) {
        throw new Error('Each question must have "question" and "placeholder" fields');
      }
    }

    res.json({ questions });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate clarification questions. Please try again.',
      details: error.message 
    });
  }
});

// Generate prompts endpoint
app.post('/api/generate-prompts', async (req, res) => {
  try {
    const { topic, clarifications } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Build the user message
    const clarificationText = clarifications && clarifications.length > 0
      ? clarifications.map((q, i) => `– ${q.question}: ${q.answer}`).join('\n')
      : '– No additional clarifications provided.';

    const userMessage = `Base topic: ${topic}
Clarifications:
${clarificationText}

Create 7 focused learning modules based on this topic and clarifications. For each module:

1. Generate a detailed "discover sources" prompt (3-6 sentences). Each should:
   • Start with "Discover sources on..."
   • Clearly explain what specific aspect to research
   • Mention what types of sources would be valuable
   • Suggest what key insights or information to look for
   • Be substantial enough to guide meaningful research

2. Generate a corresponding detailed "create podcast" prompt (3-6 sentences). Each should:
   • Start with "Create a 20-minute audio overview on..."
   • Specify what the podcast should cover and explain
   • Mention the target audience or perspective
   • Suggest what key concepts or stories to highlight
   • Provide clear direction for an engaging audio experience

Make each module focus on a distinct, important aspect of the topic. Think deeply about what someone really needs to understand to master this subject.

IMPORTANT: Format your response exactly like this:

DISCOVER_SOURCES:
1. [First discover sources prompt - 3-6 sentences]

2. [Second discover sources prompt - 3-6 sentences]

3. [Third discover sources prompt - 3-6 sentences]

4. [Fourth discover sources prompt - 3-6 sentences]

5. [Fifth discover sources prompt - 3-6 sentences]

6. [Sixth discover sources prompt - 3-6 sentences]

7. [Seventh discover sources prompt - 3-6 sentences]

CREATE_PODCAST:
1. [First create podcast prompt - 3-6 sentences]

2. [Second create podcast prompt - 3-6 sentences]

3. [Third create podcast prompt - 3-6 sentences]

4. [Fourth create podcast prompt - 3-6 sentences]

5. [Fifth create podcast prompt - 3-6 sentences]

6. [Sixth create podcast prompt - 3-6 sentences]

7. [Seventh create podcast prompt - 3-6 sentences]`;

    const systemMessage = `You are an expert curriculum designer and learning strategist. Your job is to break down complex topics into meaningful learning modules that build comprehensive understanding.

Given a learning topic and clarifications, create 7 detailed learning modules. Each module should focus on a distinct, important aspect of the topic.

For each module, provide two detailed prompts:
1. A "Discover Sources" prompt for research (3-6 sentences)
2. A "Create Podcast" prompt for audio overview (3-6 sentences)

The prompts should be substantive, specific, and educational. Avoid generic or surface-level approaches.

CRITICAL: You must format your response exactly as requested with clear section headers and numbered items.`;

    // Call OpenAI API (v3 syntax)
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const response = completion.data.choices[0].message.content;
    console.log('Raw OpenAI response:', response); // Debug logging
    
    // More robust parsing logic
    function parsePrompts(response) {
      // Try to find the sections
      let discoverIndex = response.search(/DISCOVER[_\s]*SOURCES?:?/i);
      let podcastIndex = response.search(/CREATE[_\s]*PODCAST:?/i);
      
      if (discoverIndex === -1 || podcastIndex === -1) {
        throw new Error('Could not find required section headers in response');
      }
      
      // Extract sections
      const discoverSection = response.substring(discoverIndex, podcastIndex);
      const podcastSection = response.substring(podcastIndex);
      
      // Parse discover sources
      const discoverSources = discoverSection
        .replace(/DISCOVER[_\s]*SOURCES?:?/i, '')
        .trim()
        .split(/\d+\.\s/)
        .filter(item => item.trim().length > 10)
        .map(item => item.trim())
        .slice(0, 7); // Ensure max 7 items
      
      // Parse create podcast
      const createPodcast = podcastSection
        .replace(/CREATE[_\s]*PODCAST:?/i, '')
        .trim()
        .split(/\d+\.\s/)
        .filter(item => item.trim().length > 10)
        .map(item => item.trim())
        .slice(0, 7); // Ensure max 7 items
      
      // Validate we have content
      if (discoverSources.length === 0 || createPodcast.length === 0) {
        throw new Error('No valid prompts found in response');
      }
      
      return { discoverSources, createPodcast };
    }
    
    const parsedPrompts = parsePrompts(response);
    
    console.log('Parsed prompts:', {
      discoverCount: parsedPrompts.discoverSources.length,
      podcastCount: parsedPrompts.createPodcast.length
    }); // Debug logging

    res.json(parsedPrompts);

  } catch (error) {
    console.error('Error generating prompts:', error);
    res.status(500).json({ 
      error: 'Failed to generate prompts. Please try again.',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', hasApiKey: !!process.env.OPENAI_API_KEY });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:3000 to use the app`);
}); 