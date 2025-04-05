const express = require('express');
const app = express();
const port = 3000;

// Simulating a Lambda handler
app.get('/message', (req, res) => {
  const query = req.query;
  const name = query.name;
  const chat = query.chat;

  console.log("Name:", name);
  console.log("Chat:", chat);

  res.json({
    received: true,
    name: name,
    chat: chat
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
