import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CryptoService } from '../crypto/crypto.service';
import { ChatHistoryService } from '../chat/chat-history.service';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI;
  private readonly openAICommandTemplate: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly chatHistoryService: ChatHistoryService,

  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('API_KEY'),
    });
  }

  async ask(inputText: string, userId: number): Promise<string> {
    return this.fetchOpenAICompletion({ input_text: inputText }, inputText, userId);
  }

  private async fetchOpenAICompletion(inputData: any, instruction: string, userId: number): Promise<any> {
    try {
      const history = await this.chatHistoryService.getHistory(userId) as any;
      const messages = [
        {
          role: "system",
          content: "Ты — ассистент, способный определять, спрашивает ли пользователь о цене криптовалюты. " +
            "Если это вопрос о цене, вызови функцию getCryptoPrice. " +
            "Если это обычный вопрос, ответь сам."
        },
        ...history,
        { role: 'user', content: instruction },

      ]
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106', // Ensure you are using a model that supports function calling
        messages,
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
                  description: "Название или тикер монеты, например 'Bitcoin'"
                },
                convertText: {
                  type: "string",
                  description: "Форматированный текст ответа на том же языке, что и вопрос. Например: 'Цена Bitcoin в USD: '"
                }
              },
              required: ["coinName", "convertText"]
            }
          }
        ],
        function_call: "auto" // Let OpenAI decide when to call the function
      });

      const message = response.choices?.[0]?.message;
      let reply = message?.content || 'Ошибка';
  
      // Check if OpenAI wants to call the function
      if (message?.function_call) {
        const { name, arguments: args } = message.function_call;
        if (name === "getCryptoPrice") {
          console.log(message.function_call, 111);

          const parsedArgs = JSON.parse(args);
          return await this.getCryptoPrice(parsedArgs);
        }
      }

      await this.chatHistoryService.addMessage(userId, { role: 'user', content: instruction });
      await this.chatHistoryService.addMessage(userId, { role: 'assistant', content: reply })
      return this.cleanResponse(message?.content || '');
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate completion');
    }
  }
  private async getCryptoPrice(inputDto: any): Promise<string> {
    const price = await this.cryptoService.getPriceById(inputDto.coinName.toLocaleLowerCase())
    return inputDto.convertText + " " + price; 
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
