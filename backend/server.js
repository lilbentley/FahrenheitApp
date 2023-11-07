require('dotenv').config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); 
const { OpenAI } = require('openai'); 
const express = require('express');

// Configuration from environment variables
const apiId = parseInt(process.env.API_ID, 10); 
const apiHash = process.env.API_HASH; 
const stringSession = new StringSession(process.env.STRING_SESSION);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize Telegram client
const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Function to evaluate messages with OpenAI
async function evaluateMessagesWithAI(prompt) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });
    const messageContent = chatCompletion.choices[0].message.content;
    return messageContent; 
  } catch (error) {
    console.error('Error calling the OpenAI API:', error);
    throw error; 
  }
}

// Function to start the Telegram client
async function startTelegramClient() {
  try {
    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () => await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
    console.log("Telegram client connected.");
  } catch (error) {
    console.error('Failed to start Telegram client:', error);
  }
}

// Start the Telegram client
startTelegramClient();

// Endpoint to get the evaluated number from messages
app.get('/api/count', async (req, res) => {
  try {
    const channel = await client.getEntity('nexta_live');
    const messages = await client.getMessages(channel, { limit: 10 });
    const messagesText = messages.map(m => m.message).join('\n');
    const prompt = `Please provide a numerical assessment of global stability based on the following messages. Assign a score from 1 to 5, where 1 indicates a stable and peaceful global situation (GOOD), and 5 indicates a highly unstable and critical global situation (WORST). Use the score of 4-5 only for situations with severe negative implications or events. Consider the collective impact of these messages on the current state of global affairs. Provide only the numerical score as your response. Here are the messages: ${messagesText} `; // Your existing prompt

    const evaluatedNumber = await evaluateMessagesWithAI(prompt);
    res.json({ count: parseInt(evaluatedNumber, 10) });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
