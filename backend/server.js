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
  const AIprompt = "Given the following news summaries, provide a numerical escalation level from 0 to 5 based on the overall state of global affairs. The scale is defined as: 0 for no significant events, 1 for minor incidents, 2 for moderate issues, 3 for serious events, 4 for critical incidents, and 5 for catastrophic events such as the start of a new war or worse. The assessment should be conservative, reserving levels 3 to 5 for extremely severe situations. Output the number that corresponds to the escalation level. After the number put the most severe news article behind it like this (Numberof escalation level. Number of most severe News Article). Only output those two Numbers. This is the news articles: ";
  // Global filter words
  const globalFilterWords = ['globalWord1', 'globalWord2']; // Add global filter words here

  // Channel configurations
  const channels = [
    {
      name: 'oldlentach',
      limit: 3,
      filterWords: ['#реклама', 'news.lenta.ch'],
      removeWords: ['removeThisWord'], // Specific filter words for this channel
    },

    {
      name: 'nexta_live',
      limit: 3,
      filterWords: ['#реклама', 'youtu.be'],
      removeWords: ['@nexta_live'], // Specific filter words for this channel
    },
    
    {
      name: 'varlamov_news',
      limit: 3,
      filterWords: ['#реклама', 'youtu.be'],
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

      // const chatCompletion = await openai.chat.completions.create({
      //   messages: [{ role: 'user', content: prompt }],
      //   model: 'gpt-3.5-turbo',
      //   seed: 1337,
      // });

      const chatCompletion = await openai.completions.create({
        prompt: prompt,
        model: 'gpt-3.5-turbo-instruct',
        seed: 1337344,
        temperature: 0.1,
        
      });


      const messageContent = chatCompletion.choices[0].text;
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
      // console.log(client.session.save());
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
  // Function to fetch and filter messages from a channel
async function fetchAndFilterMessages(channelConfig) {
  const channel = await client.getEntity(channelConfig.name);
  const messages = await client.getMessages(channel, { limit: channelConfig.limit });
  const combinedFilterWords = [...globalFilterWords, ...channelConfig.filterWords];

  let messageIndex = 1; // Start numbering from 1

  return messages
    .filter(m => m.message && m.message.trim() !== '')
    .map(m => {
      // Remove specified words from each message
      const messageWithoutRemovedWords = removeWordsFromMessage(m.message, channelConfig.removeWords);
      // Further filter out any messages that contain the combined filter words
      const filteredMessage = combinedFilterWords.some(word => messageWithoutRemovedWords.includes(word)) ? '' : messageWithoutRemovedWords;
      // If the message is not empty after filtering, prepend the index and increment it
      if (filteredMessage !== '') {
        const numberedMessage = ` ${messageIndex}) ${filteredMessage}`;
        messageIndex++; // Increment the message index for the next message
        return numberedMessage;
      }
      return '';
    })
    .filter(m => m !== ''); // Filter out any messages that became empty after word removal
}


  // Endpoint to get the evaluated number from messages
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
    const evaluationResponse = await evaluateMessagesWithAI(prompt);
    const [evaluatedNumber, mostSevereArticleIndex] = evaluationResponse.split('.').map(num => parseInt(num.trim(), 10));

    // Find the most severe article using the index
    const mostSevereArticle = allTextMessages[mostSevereArticleIndex - 1]; // Adjust for zero-based index
    console.log("AI Response:", evaluationResponse);
    // Log the results to the console
    console.log("Evaluated Number:", evaluatedNumber);
    console.log("Number of Most Severe News Article:", mostSevereArticleIndex);
    console.log("Content of Most Severe News Article:", mostSevereArticle);

    // Send the response
    res.json({
      count: evaluatedNumber,
      mostSevereArticleIndex: mostSevereArticleIndex,
      mostSevereArticleContent: mostSevereArticle
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});


  // Start the Express server
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
