import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('API_KEY'),
    });
  }

  async ask(inputText: string): Promise<string> {
    const openAIQuery = { input_text: inputText };
    return this.fetchOpenAICompletion(openAIQuery, inputText);
  }

  private async fetchOpenAICompletion(inputData: any, instruction: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `JSON:\n${JSON.stringify(inputData)}` },
          { role: 'user', content: instruction },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }) as any;

      return this.cleanResponse(response?.choices[0]?.message?.content);
    } catch (error) {
      console.error('Error generating completion:', error);
      throw new Error('Failed to generate translation');
    }
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
