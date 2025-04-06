// Required packages:
// npm install express redis twilio uuid dotenv

require('dotenv').config();
const express = require('express');
const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');

// Configuration
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_QUEUE_KEY = 'whatsapp_messages_queue';
const REDIS_PROCESSING_CHANNEL = 'llm_processing';
const REDIS_STATUS_CHANNEL = 'llm_status';

/**
 * Create Redis client with connection options
 */
function createRedisClient() {
  const client = Redis.createClient({
    url: `redis://${REDIS_PASSWORD ? `:${REDIS_PASSWORD}@` : ''}${REDIS_HOST}:${REDIS_PORT}`
  });
  
  client.on('error', (err) => console.error('Redis Error:', err));
  
  return client;
}

// API Server
async function startApiServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Initialize Redis clients
  const redisClient = createRedisClient();
  await redisClient.connect();
  
  const redisPublisher = redisClient.duplicate();
  await redisPublisher.connect();

  // WhatsApp webhook endpoint
  app.post('/webhook/whatsapp', async (req, res) => {
    try {
      // Extract WhatsApp message details from Twilio webhook
      const messageSid = req.body.MessageSid || '';
      const fromNumber = req.body.From || '';
      const messageBody = req.body.Body || '';
      const mediaUrl = req.body.MediaUrl0 || null;
      
      // Create message object
      const message = {
        message_id: messageSid,
        from_number: fromNumber,
        message_body: messageBody,
        timestamp: Date.now() / 1000,
        media_url: mediaUrl
      };
      
      // Add to Redis queue
      await addMessageToQueue(redisClient, redisPublisher, message);
      
      res.status(200).send('Message received');
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Error processing message');
    }
  });

  // Status update endpoint
  app.post('/api/status', async (req, res) => {
    try {
      const status = req.body;
      
      // Publish status update to Redis
      await redisPublisher.publish(REDIS_STATUS_CHANNEL, JSON.stringify(status));
      
      // Store status in Redis hash for persistence
      const statusKey = `status:${status.message_id}:${status.llm_service_id}`;
      await redisClient.hSet(statusKey, {
        status: status.status,
        timestamp: status.timestamp,
        llm_service_id: status.llm_service_id,
        result: status.result ? JSON.stringify(status.result) : '',
        error: status.error || ''
      });
      
      // Set TTL for status keys (e.g., 24 hours)
      await redisClient.expire(statusKey, 86400);
      
      res.json({ status: 'updated' });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).send('Error updating status');
    }
  });

  // Start the server
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
}

/**
 * Function to add message to Redis queue
 */
async function addMessageToQueue(redisClient, redisPublisher, message) {
  // Serialize message to JSON
  const messageJson = JSON.stringify(message);
  
  // Add to Redis list (RPUSH for FIFO queue)
  await redisClient.rPush(REDIS_QUEUE_KEY, messageJson);
  
  // Publish notification that new message is available
  await redisPublisher.publish(REDIS_PROCESSING_CHANNEL, JSON.stringify({
    event: 'new_message',
    message_id: message.message_id,
    timestamp: message.timestamp
  }));
}

// LLM Service Worker
async function startLlmServiceWorker(serviceId) {
  console.log(`Starting LLM service worker: ${serviceId}`);
  
  // Create Redis connections for the worker
  const redisClient = createRedisClient();
  await redisClient.connect();
  
  const redisSubscriber = redisClient.duplicate();
  await redisSubscriber.connect();
  
  const redisPublisher = redisClient.duplicate();
  await redisPublisher.connect();
  
  // Send startup status
  const startupStatus = {
    message_id: 'service_startup',
    llm_service_id: serviceId,
    status: 'online',
    timestamp: Date.now() / 1000
  };
  
  await redisPublisher.publish(REDIS_STATUS_CHANNEL, JSON.stringify(startupStatus));
  
  // Subscribe to processing channel
  await redisSubscriber.subscribe(REDIS_PROCESSING_CHANNEL, (message) => {
    // Process any control messages
    const data = JSON.parse(message);
    console.log(`Received control message: ${data.event}`);
  });

  try {
    // Main processing loop
    while (true) {
      try {
        // Try to get a message from the queue using BLPOP with timeout
        const result = await redisClient.blPop(REDIS_QUEUE_KEY, 1);
        
        if (result) {
          const messageData = result.element;
          const message = JSON.parse(messageData);
          
          // Update status to started
          const startStatus = {
            message_id: message.message_id,
            llm_service_id: serviceId,
            status: 'started',
            timestamp: Date.now() / 1000
          };
          await redisPublisher.publish(REDIS_STATUS_CHANNEL, JSON.stringify(startStatus));
          
          try {
            // In a real implementation, this would call your LLM service
            console.log(`Processing message: ${message.message_id}`);
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Process the message with the LLM (simulated here)
            const result = {
              processed_text: `Processed: ${message.message_body}`,
              confidence: 0.95,
            };
            
            // Update status to completed
            const completeStatus = {
              message_id: message.message_id,
              llm_service_id: serviceId,
              status: 'completed',
              timestamp: Date.now() / 1000,
              result: result
            };
            await redisPublisher.publish(REDIS_STATUS_CHANNEL, JSON.stringify(completeStatus));
            
          } catch (e) {
            // Update status to failed
            const errorStatus = {
              message_id: message.message_id,
              llm_service_id: serviceId,
              status: 'failed',
              timestamp: Date.now() / 1000,
              error: e.toString()
            };
            await redisPublisher.publish(REDIS_STATUS_CHANNEL, JSON.stringify(errorStatus));
          }
        }
      } catch (error) {
        console.error(`Worker error: ${error}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
      }
    }
  } catch (e) {
    console.error(`Worker fatal error: ${e}`);
  } finally {
    // Clean up
    await redisSubscriber.unsubscribe();
    
    // Send offline status
    const offlineStatus = {
      message_id: 'service_shutdown',
      llm_service_id: serviceId,
      status: 'offline',
      timestamp: Date.now() / 1000
    };
    await redisPublisher.publish(REDIS_STATUS_CHANNEL, JSON.stringify(offlineStatus));
    
    await redisClient.quit();
    await redisSubscriber.quit();
    await redisPublisher.quit();
  }
}

// Status Monitor
async function startStatusMonitor() {
  console.log('Starting status monitor...');
  
  const redisClient = createRedisClient();
  await redisClient.connect();
  
  const redisSubscriber = redisClient.duplicate();
  await redisSubscriber.connect();
  
  // Subscribe to status channel
  await redisSubscriber.subscribe(REDIS_STATUS_CHANNEL, (message) => {
    try {
      const status = JSON.parse(message);
      console.log(`Status update: ${status.llm_service_id} - ${status.status} for message ${status.message_id}`);
      
      // In a real implementation, you might:
      // - Update a dashboard
      // - Send notifications
      // - Handle retry logic for failed messages
      
    } catch (error) {
      console.error('Error processing status update:', error);
    }
  });
  
  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('Shutting down status monitor');
    await redisSubscriber.unsubscribe();
    await redisClient.quit();
    await redisSubscriber.quit();
    process.exit(0);
  });
}

// Command-line runner
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('Usage: node app.js [api|worker|monitor|run-all]');
    process.exit(1);
  }
  
  if (command === 'api') {
    await startApiServer();
  } else if (command === 'worker') {
    const serviceId = process.argv[3] || `llm-worker-${uuidv4().substring(0, 8)}`;
    await startLlmServiceWorker(serviceId);
  } else if (command === 'monitor') {
    await startStatusMonitor();
  } else if (command === 'run-all') {
    // Start API server
    startApiServer();
    
    // Start status monitor
    startStatusMonitor();
    
    // Start workers
    for (let i = 0; i < 3; i++) {
      startLlmServiceWorker(`llm-worker-${i+1}`);
    }
    
    console.log('All services started. Press Ctrl+C to stop.');
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Usage: node app.js [api|worker|monitor|run-all]');
    process.exit(1);
  }
}

// Start the program
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});