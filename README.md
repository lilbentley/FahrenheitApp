# Fahrenheit

Fahrenheit is an innovative project aimed at evaluating the current news landscape by providing a quantifiable measure of news content. Utilizing the power of GramJS and OpenAI's API, Fahrenheit analyzes news articles and assigns a score on a scale from 1 to 5, offering an insightful perspective into the news narrative's impact and significance.

## Features

- **News Analysis**: Leverage advanced natural language processing to understand and evaluate news content.
- **Scoring System**: Rate news on a scale from 1 (least impactful) to 5 (most impactful) based on various metrics.
- **Telegram Integration**: Fetch news directly from Telegram channels using GramJS.
- **AI-Powered Insights**: Utilize OpenAI's API to interpret and score news content intelligently.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- npm or Yarn
- Git

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/Fahrenheit.git
   ```

2. Navigate to the project directory:
   ```sh
   cd Fahrenheit
   ```
3. Install the dependencies:
   ```sh
   npm install

### Configuration
Create a .env file in the root of your project and add the following environment variables:
   ```env
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   OPENAI_API_KEY=your_openai_api_key

   ```
### Usage
To start the application, run:
   ```sh
   npm start
```

## Development

Want to contribute? Great! Here's how you can run the project for development:

1. Make sure all the prerequisites are installed.
2. Follow the installation steps.
3. Make your changes.
4. Test your changes.
5. Create a pull request.

## Roadmap

- [ ] Fetch news from multiple Telegram channels.
- [ ] Implement a more sophisticated scoring algorithm.
- [ ] Add support for real-time news analysis.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- GramJS for providing the Telegram client library.
- OpenAI for the powerful API enabling AI-driven analysis.

We hope Fahrenheit will become a valuable tool in understanding the news narrative and its underlying impact on society.

