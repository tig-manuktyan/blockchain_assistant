import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { CACHE, COINGECKO } from 'src/constants';
import { CoinDto } from '@blockchain_assistant/src/crypto/dto/coin.dto';


@Injectable()
export class CryptoService {
    private coinListCache: CoinDto[] = [];
    private lastCacheTime = 0;

    async getCoinsList(): Promise<CoinDto[]> {
        const now = Date.now();
        if (!this.coinListCache.length || now - this.lastCacheTime > CACHE.COINS_LIST_DURATION) {
            try {
                const response = await axios.get<CoinDto[]>(COINGECKO.COINS_LIST_URL);
                this.coinListCache = response.data;
                this.lastCacheTime = now;
            } catch (error) {
                throw error;
            }
        }
        return this.coinListCache;
    }

    async findCoin(query: string): Promise<CoinDto | null> {
        const coins = await this.getCoinsList();
        const lowerQuery = query.toLowerCase();
        const coin = coins.find(
            c => c.symbol.toLowerCase() === lowerQuery || c.name.toLowerCase() === lowerQuery,
        );
        return coin || null;
    }

    async getPriceById(coinId: string): Promise<number | null> {
        try {
            const response = await axios.get(COINGECKO.PRICE_URL, {
                params: { ids: coinId, vs_currencies: 'usd' },
            });
            const price = response.data[coinId]?.usd;
            return price ?? null;
        } catch (error) {
            return null;
        }
    }
}
