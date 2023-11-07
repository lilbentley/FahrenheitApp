require('dotenv').config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); 
const { OpenAI } = require('openai'); 
const express = require('express');

const apiId = parseInt(process.env.API_ID, 10); 
const apiHash = process.env.API_HASH; 
const stringSession = new StringSession(process.env.STRING_SESSION);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const app = express();
const port = 3000;
app.use(express.json());

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

(async () => {
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("Telegram client connected.");
})();


app.get('/api/count', async (req, res) => {
  try {
    const channel = await client.getEntity('nexta_live');
    const messages = await client.getMessages(channel, { limit: 10 });
    const messagesText = messages.map(m => m.message).join('\n');
    const prompt = `You have one goal to only spit out a number from 1 to 5. Only use this numerical Output. There will be a number of short messages that describe the situation in the world. Evaluate  the entirety of them and how bad they are  on a scale of 1 (GOOD) to 5(WORST). Take into perspective the whole situation in the world. Dont overreact, use 4-5 only if really bad stuff happens. Here are the messages: :\n${messagesText}`; // Your existing prompt

    const evaluatedNumber = await evaluateMessagesWithAI(prompt);
    console.log('Fahrenheit Temperature:', evaluatedNumber);
    res.json({ count: parseInt(evaluatedNumber, 10) }); // Send the number as a JSON response
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('An error occurred');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


