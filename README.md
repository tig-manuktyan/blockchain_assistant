# Blockchain Assistant Telegram Bot

This project is a Telegram bot built using [NestJS](https://nestjs.com/), [Telegraf](https://telegraf.js.org/), and [OpenAI API](https://beta.openai.com/). It allows users to interact with cryptocurrency data and use OpenAI's language model for general queries.

## Prerequisites

Before running the bot, ensure you have the following:

- **Node.js** (v14 or higher) installed.
- **npm** (Node Package Manager) installed.
- A **Telegram Bot Token** (you can generate this by chatting with [BotFather](https://core.telegram.org/bots#botfather)).
- An **OpenAI API Key** (you can get this from your [OpenAI account](https://platform.openai.com/account/api-keys)).


Create a .env file at the root of your project and add the following variables:

BOT_TOKEN=<your-telegram-bot-token>
API_KEY=<your-openai-api-key>



- **BOT_TOKEN**: This is your Telegram bot token, which you can generate using BotFather on Telegram.
- **API_KEY**: This is your OpenAI API key, which you'll get from your OpenAI developer account.


## Running the Bot

To start the bot in development mode, run the following command:

```bash
$ npm run start:dev
```


## Available Commands

- **/start** - Start a conversation with the bot.
- **/help** - Display information about the bot and how to use it