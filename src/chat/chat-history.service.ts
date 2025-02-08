import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatHistoryService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 60 * 60 }); // TTL 24 часа
  }

  private getCacheKey(userId: number): string {
    return `chat_history_${userId}`;
  }

  async getHistory(userId: number): Promise<ChatMessage[]> {
    return this.cache.get<ChatMessage[]>(this.getCacheKey(userId)) || [];
  }

  async addMessage(userId: number, message: ChatMessage) {
    const history = await this.getHistory(userId);

    if (history.length >= 10) {
      history.shift(); // Удаляем старые сообщения
    }

    history.push(message);
    this.cache.set(this.getCacheKey(userId), history);
  }

  async clearHistory(userId: number) {
    this.cache.del(this.getCacheKey(userId));
  }
}
