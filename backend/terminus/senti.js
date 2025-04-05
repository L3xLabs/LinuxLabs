const { OpenAI } = require('openai');

require('dotenv').config(); // Load .env variables

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // replace with your OpenAI API key
});

async function analyzeSentiment(text) {
  const prompt = `Analyze the sentiment of the following text and respond with Positive, Negative, or Neutral:\n\n${text}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  });

  const sentiment = response.choices[0].message.content.trim();
  return sentiment;
}

// Example usage
(async () => {
  const sentiment = await analyzeSentiment("I really enjoyed the new season of the show!");
  console.log("Sentiment:", sentiment);
})();

