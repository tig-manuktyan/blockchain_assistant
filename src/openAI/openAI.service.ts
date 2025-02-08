import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI;
  private readonly openAICommandTemplate: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('API_KEY'),
    });
  }

  async ask(inputText: string): Promise<string> {
    const openAIQuery = { input_text: inputText };
    // const command = this.buildCommand(inputText);
    // console.log(command, "command");

    return this.fetchOpenAICompletion(openAIQuery, inputText);
  }

  async askCorrect(inputText: string): Promise<string> {
    const openAIQuery = { input_text: inputText };
    return this.fetchOpenAICompletion(openAIQuery, inputText);
  }

  /**
   * Builds the OpenAI command by replacing placeholders with the actual input text.
   * @param inputText The input text.
   * @returns The formatted command.
   */
  private buildCommand(inputText: string): string {
    return this.openAICommandTemplate.replace('{input_text}', inputText);
  }

  private async fetchOpenAICompletion(inputData: any, instruction: string): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106', // Ensure you are using a model that supports function calling
        messages: [
          {
            role: "system",
            content: "Ты — ассистент, способный определять, спрашивает ли пользователь о цене криптовалюты. " +
              "Если это вопрос о цене, вызови функцию getCryptoPrice. " +
              "Если это обычный вопрос, ответь сам."
          },
          { role: 'user', content: `JSON:\n${JSON.stringify(inputData)}` },
          { role: 'user', content: instruction },
        ],
        max_tokens: 200,
        temperature: 0.1,
        functions: [
          {
            name: "getCryptoPrice",
            description: "Получить цену указанной криптовалюты в USD",
            parameters: {
              type: "object",
              properties: {
                coinName: {
                  type: "string",
                  description: "Название или тикер монеты, например 'BTC' или 'Bitcoin'"
                }
              },
              required: ["coinName"]
            }
          }
        ],
        function_call: "auto" // Let OpenAI decide when to call the function
      });

      const message = response.choices?.[0]?.message;

      // Check if OpenAI wants to call the function
      if (message?.function_call) {
        const { name, arguments: args } = message.function_call;
        if (name === "getCryptoPrice") {
          console.log(message.function_call, 111);

          const parsedArgs = JSON.parse(args);
          return await this.getCryptoPrice(parsedArgs.coinName);
        }
      }

      return this.cleanResponse(message?.content || '');
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate completion');
    }
  }
  private async getCryptoPrice(coinName: string): Promise<string> {
    const price = await this.cryptoService.getPriceById(coinName)
    return `Цена ${coinName}  в USD: ${price}`; // Replace with real API data
  }


  /**
   * Cleans the response by trimming whitespace and removing surrounding quotes.
   * @param response The raw response from OpenAI.
   * @returns The cleaned response string.
   */
  private cleanResponse(response: string | undefined): string {
    if (!response) {
      this.logger.error('Received empty response from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('"') && cleanedResponse.endsWith('"')) {
      cleanedResponse = cleanedResponse.slice(1, -1);
    }

    return cleanedResponse;
  }
}
