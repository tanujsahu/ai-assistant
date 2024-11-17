import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', async (data) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: data.content }],
        model: 'gpt-3.5-turbo',
      });

      const response = completion.choices[0].message.content;
      
      socket.emit('bot-response', {
        id: Date.now().toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
      socket.emit('error', { message: 'Failed to get response from AI' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});