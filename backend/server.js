require('dotenv').config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input
const { OpenAI } = require('openai'); 

const apiId = process.env.API_ID; // Your API ID here
const apiHash = process.env.API_HASH; // Your API hash here
const stringSession = new StringSession(process.env.STRING_SESSION); // Your saved string session here
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Replace with your OpenAI API key


const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function compressMessagesWithAI(prompt) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    // Access the content of the message from the first choice
    const messageContent = chatCompletion.choices[0].message.content;
    console.log('Compressed Sentence:', messageContent);
    return messageContent; // Return the content so it can be used when the promise resolves
  } catch (error) {
    console.error('Error calling the OpenAI API:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

(async () => {
  console.log("Loading interactive example...");
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again

  // Replace 'channelName' with the username or ID of the channel you want to read from
  const channel = await client.getEntity('nexta_live');
  const messages = await client.getMessages(channel, {
    limit: 10, // Number of messages you want to retrieve
  });

  // Process and save the messages as needed
  const lastTenMessages = messages.map(message => ({
    id: message.id,
    senderId: message.senderId,
    text: message.message,
    date: message.date
  }));

  // Now you have the last ten messages stored in lastTenMessages
  console.log(lastTenMessages);

  // Create a prompt for the AI
  const messagesText = lastTenMessages.map(m => m.text).join('\n');
  const prompt = `You have one goal to only spit out a number from 1 to 5. Only use this numerical Output. There will be a number of short messages that describe the situation in the world. Evaluate  the entirety of them and how bad they are  on a scale of 1 (GOOD) to 5(WORST). Take into perspective the whole situation in the world. Dont overreact, use 4-5 only if really bad stuff happens. Here are the messages: :\n${messagesText}`;

  // Compress the messages using the AI
  try {
    const compressedSentence = await compressMessagesWithAI(prompt);
    console.log('Fahrenheit:', compressedSentence);
    // Do something with the compressed sentence
  } catch (error) {
    console.log('An error occurred:', error);
  }
})();
