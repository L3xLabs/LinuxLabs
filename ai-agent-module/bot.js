import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, OPENAI_API_KEY, PORT } =
  process.env;

const FLOWWBOOK_API =
  "https://rn-inside-torture-masters.trycloudflare.com/posts";

// Webhook POST route
app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message?.type === "text" && message.text.body.startsWith("#")) {
    const business_phone_number_id =
      req.body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    const userPrompt = message.text.body;
    const cleanedPrompt = userPrompt.replace(/^#/, "").trim();

    try {
      // Step 1: Ask OpenAI to clean and structure the message
      const openaiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a bot that receives a user's message and must return a JSON object with:\n" +
                "1. `content` (string): the clean message to post.\n" +
                "2. `isAnonymous` (boolean): true if user wants to post anonymously (detect words like '@anonymous', 'keep me anonymous', etc.).\n" +
                'Respond ONLY with a valid JSON object like: { "content": "...", "isAnonymous": true }.',
            },
            {
              role: "user",
              content: cleanedPrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const parsed = JSON.parse(openaiResponse.data.choices[0].message.content);
      const { content, isAnonymous } = parsed;

      // Step 2: Post to Flowwbook with default values
      const postPayload = {
        content,
        isAnonymous,
        category: "general",
        tags: ["whatsapp-bot", "ai"],
        metadata: {
          createdFrom: "WhatsApp Bot",
          userType: isAnonymous ? "anonymous" : "named",
        },
      };

      if (!isAnonymous) {
        postPayload.author = {
          id: message.from,
          name: message.from,
          avatar: message.from.slice(-2),
        };
      }

      await axios.post(FLOWWBOOK_API, postPayload, {
        headers: { "Content-Type": "application/json" },
      });

      // Step 3: Reply to user
      await axios.post(
        `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        {
          messaging_product: "whatsapp",
          to: message.from,
          text: { body: "✅ Your post has been published on Flowwbook!" },
          context: { message_id: message.id },
        },
        {
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
        }
      );
    } catch (error) {
      console.error("Error:", error?.response?.data || error.message);

      await axios.post(
        `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        {
          messaging_product: "whatsapp",
          to: message.from,
          text: { body: "❌ Sorry, failed to process your post. Try again." },
          context: { message_id: message.id },
        },
        {
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
        }
      );
    }
  }

  res.sendStatus(200);
});

// Webhook verification GET route
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

// Root route
app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here. Checkout README.md to start.</pre>`);
});

// Start the server
app.listen(PORT || 3000, () => {
  console.log(`✅ Server running on port: ${PORT || 3000}`);
});
