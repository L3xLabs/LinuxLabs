import express, { Express, Request, Response } from "express";
import axios from "axios";
import { Crypto } from "@peculiar/webcrypto";
import { Buffer } from "buffer";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

// Initialize crypto for Node.js environment
const crypto = new Crypto();

// Types
interface IMessage {
  data: string; // Base64 encoded encrypted data
}

interface INodeConfig {
  nextNodeUrl?: string;
}

interface IPublicKeyResponse {
  nodeId: string;
  key: string;
}

class Node {
  id: string;
  key: Buffer;
  nextNodeUrl?: string;
  fernet: any; // Type would depend on crypto implementation

  constructor(nodeId: string, nextNodeUrl?: string) {
    this.id = nodeId;
    // Convert Uint8Array to Buffer for the key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    this.key = Buffer.from(randomBytes);
    this.nextNodeUrl = nextNodeUrl;
    // Initialize encryption - in real implementation, use proper crypto
    this.fernet = {
      encrypt: (data: Buffer): Buffer => {
        // Simplified encryption
        return Buffer.concat([this.key, data]);
      },
      decrypt: (data: Buffer): Buffer => {
        // Simplified decryption
        return data.slice(32);
      },
    };
  }
}

// initialize express app
const app: Express = express();
app.use(express.json());
dotenv.config();

app.use(bodyParser.json());

const server = http.createServer(app);
const messagesPath = path.resolve(__dirname, "messages.json");

// Create WebSocket server
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>();

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");
  clients.add(ws);

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

export function broadcastMessage(message: string) {
  console.log("Broadcasting message:", message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
app.use(cors());
// Initialize node
const NODE_ID = process.env.NODE_ID || "node1";
const node = new Node(NODE_ID);

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({
    nodeId: node.id,
    nextNode: node.nextNodeUrl,
  });
});

app.post("/config", (req: Request<{}, {}, INodeConfig>, res: Response) => {
  const { nextNodeUrl } = req.body;
  console.log(nextNodeUrl);
  node.nextNodeUrl = nextNodeUrl;
  res.json({
    status: "configured",
    nextNode: node.nextNodeUrl,
  });
});

app.get("/public-key", (_req: Request, res: Response<IPublicKeyResponse>) => {
  res.json({
    nodeId: node.id,
    key: node.key.toString("base64"),
  });
});

app.post("/posts", (req: any, res: any) => {
  const { content, author, isAnonymous = false } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required." });
  }

  const newMessage = {
    id: Date.now(),
    content,
    author: isAnonymous ? null : author,
    isAnonymous,
    timestamp: new Date().toISOString(),
    votes: 0,
    comments: [],
    userVote: null,
  };

  try {
    let messages: string[] = [];

    if (fs.existsSync(messagesPath)) {
      const data = fs.readFileSync(messagesPath, "utf-8");
      messages = JSON.parse(data);
    }

    messages.push(JSON.stringify(newMessage));
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), "utf-8");

    res
      .status(201)
      .json({ message: "Post created successfully.", post: newMessage });
  } catch (err) {
    console.error("Failed to create post:", err);
    res.status(500).json({ error: "Could not create post." });
  }
});

// Fix the forward endpoint type definition
app.post(
  "/forward",
  async (req: Request<{}, any, IMessage>, res: Response): Promise<void> => {
    try {
      console.log(`[Node ${node.id}] Received onion packet`);

      // Decode the base64 message
      const encryptedData = Buffer.from(req.body.data, "base64");
      console.log("Received Base64 onion:", req.body.data);
      console.log("Decoded onion buffer:", encryptedData);

      // Decrypt this layer
      const decryptedData = node.fernet.decrypt(encryptedData);

      // Split routing info and remaining data
      const colonIndex = decryptedData.indexOf(":");
      const routingInfo = decryptedData.slice(0, colonIndex);
      const remainingData = decryptedData.slice(colonIndex + 1);
      const nextHop = routingInfo.toString();

      console.log(`[Node ${node.id}] Routing Info: ${nextHop}`);
      console.log(`[Node ${node.id}] Remaining Data: ${remainingData}`);

      if (nextHop === "FINAL") {
        const message = remainingData.toString();
        console.log(`[Node ${node.id}] Final destination reached`);

        // Get the absolute path to messages.json
        const messagesPath = path.resolve(__dirname, "messages.json");

        try {
          let messages: string[] = [];

          // If the file exists, read existing messages
          if (fs.existsSync(messagesPath)) {
            const raw = fs.readFileSync(messagesPath, "utf-8");
            messages = JSON.parse(raw);
          }

          // Add the new message
          messages.push(message);

          // Save the updated array back to the file
          fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

          // Send response
          res.json({
            status: "delivered",
            message,
          });

          broadcastMessage(message);
        } catch (err) {
          console.error("Failed to write message to file:", err);
          res.status(500).json({ error: "Could not write message to file." });
        }

        return;
      }

      if (!node.nextNodeUrl) {
        throw new Error(`[Node ${node.id}] No next node configured`);
      }

      // Forward to next node
      const forwardData = remainingData.toString("base64");
      console.log(`[Node ${node.id}] Forwarding to ${node.nextNodeUrl}`);
      const response = await axios.post(`${node.nextNodeUrl}/forward`, {
        data: forwardData,
      });

      res.json(response.data);
    } catch (error) {
      console.error(`[Node ${node.id}] Error:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

app.get("/posts", (_req: Request, res: Response) => {
  const messagesPath = path.resolve(__dirname, "messages.json");

  try {
    if (fs.existsSync(messagesPath)) {
      const data = fs.readFileSync(messagesPath, "utf-8");
      const rawMessages = JSON.parse(data);

      const messages = rawMessages
        .map((msg: string) => {
          try {
            return JSON.parse(msg);
          } catch (e) {
            console.error("Invalid message format:", msg);
            return null;
          }
        })
        .filter((msg: any) => msg !== null);

      res.json({ messages });
    } else {
      res.json({ messages: [] });
    }
  } catch (err) {
    console.error("Failed to read messages file:", err);
    res.status(500).json({ error: "Could not read messages file." });
  }
});

app.get("/analyse", async (_req: any, res: any) => {
  const messagesPath = path.resolve(__dirname, "messages.json");

  try {
    if (!fs.existsSync(messagesPath)) {
      return res.json({
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        totalPosts: 0,
        message: "No messages found.",
      });
    }

    const raw = fs.readFileSync(messagesPath, "utf-8");
    const messages: string[] = JSON.parse(raw);
    const input = messages.join("\n");

    const prompt = `
You are a sentiment analysis engine. Given the following posts separated by new lines, rate their overall tone:
- Give three ratings (out of 10): Positive, Neutral, and Negative.
- Only respond with a JSON object in the format:
{
  "positive": <score>,
  "neutral": <score>,
  "negative": <score>
}

Posts:
${input}
    `.trim();

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const sentiment = JSON.parse(content);

    res.json({
      sentiment,
      totalPosts: messages.length,
    });
  } catch (error) {
    console.error("Error during sentiment analysis:", error);
    res.status(500).json({ error: "Could not analyse sentiments." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
