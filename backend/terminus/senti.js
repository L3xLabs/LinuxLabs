import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeSentiment(text) {
  const prompt = `Analyze the sentiment of the following text and respond with Positive, Negative, or Neutral:\n\n${text}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  });

  return response.choices[0].message.content.trim();
}

app.post('/analyze', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const sentiment = await analyzeSentiment(text);
    res.json({ sentiment });
  } catch (error) {
    console.error('Error analyzing sentiment:', error.message);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

app.listen(port, () => {
  console.log(`Sentiment API listening at http://localhost:${port}`);
});
