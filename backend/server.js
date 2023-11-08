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
const AIprompt = "As an AI with a conservative stance on global stability ratings, you are to provide STRICTLY only a numerical assessment from 1 to 5 based on the following messages, where 1 represents a completely stable and peaceful global situation, and 5 represents extreme instability and crisis. Ratings of 3 or 4 or  5 are reserved for only the most dire of circumstances, where the events described have profound and widespread negative consequences. Please apply a stringent threshold for these ratings and consider the overall context and historical global stability standards. Provide only the numerical score as your response, and disregard any promotional content. Here are the messages:";
// Global filter words
const globalFilterWords = ['globalWord1', 'globalWord2']; // Add global filter words here

// Channel configurations
const channels = [
  {
    name: 'oldlentach',
    limit: 5,
    filterWords: ['#реклама', 'news.lenta.ch'],
    removeWords: ['removeThisWord'], // Specific filter words for this channel
  },

  {
    name: 'nexta_live',
    limit: 5,
    filterWords: ['#реклама'],
    removeWords: ['@nexta_live'], // Specific filter words for this channel
  },
  
  {
    name: 'varlamov_news',
    limit: 5,
    filterWords: ['#реклама'],
    removeWords: ['removeThisWord'], // Specific filter words for this channel
  },
  // Add more channel configurations here
];

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
      seed: 1337,
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
function removeWordsFromMessage(message, removeWords) {
  let modifiedMessage = message;
  removeWords.forEach(word => {
    // Replace the word with an empty string
    const regex = new RegExp(word, 'gi'); // 'gi' for case-insensitive and global match
    modifiedMessage = modifiedMessage.replace(regex, '');
  });
  return modifiedMessage.trim(); // Trim the message after replacements
}
// Function to fetch and filter messages from a channel
async function fetchAndFilterMessages(channelConfig) {
  const channel = await client.getEntity(channelConfig.name);
  const messages = await client.getMessages(channel, { limit: channelConfig.limit });
  const combinedFilterWords = [...globalFilterWords, ...channelConfig.filterWords];

  return messages
    .filter(m => m.message && m.message.trim() !== '')
    .map(m => {
      // Remove specified words from each message
      const messageWithoutRemovedWords = removeWordsFromMessage(m.message, channelConfig.removeWords);
      // Further filter out any messages that contain the combined filter words
      return combinedFilterWords.some(word => messageWithoutRemovedWords.includes(word)) ? '' : messageWithoutRemovedWords;
    })
    .filter(m => m !== ''); // Filter out any messages that became empty after word removal
}

// Endpoint to get the evaluated number from messages
app.get('/api/count', async (req, res) => {
  try {
    let allTextMessages = [];

    // Fetch and filter messages from each channel
    for (const channelConfig of channels) {
      const textMessages = await fetchAndFilterMessages(channelConfig);
      allTextMessages = allTextMessages.concat(textMessages);
    }

    // Output the text of all messages to the terminal
    console.log("Filtered Messages Text:", allTextMessages.join('\n'));

    // Check if there are enough messages to evaluate
    if (allTextMessages.length === 0) {
      return res.status(400).json({ error: 'No suitable text messages available for evaluation.' });
    }

    // Create a prompt for the AI with the filtered messages
    const prompt = `${AIprompt}  ${allTextMessages.join('\n')} `;

    // Evaluate messages with AI
    const evaluatedNumber = await evaluateMessagesWithAI(prompt);
    res.json({ count: parseInt(evaluatedNumber, 10) });
    console.log("Fahrenheit Temperature:"+ evaluatedNumber);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
