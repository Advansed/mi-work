
// dadata-service.ts
import { DaDataConfig, DaDataResponse, DaDataApiResponse, StandardizedAddress, ConfidenceLevel } from './types';

class DaDataService {
  private config: DaDataConfig;
  private cache: Map<string, { data: DaDataResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 час

  constructor(config: DaDataConfig) {
    this.config = {
      baseUrl: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs',
      timeout: 5000,
      retryAttempts: 3,
      ...config
    };
  }

  private generateCacheKey(address: string): string {
    // Простой хеш для кириллических символов
    const normalized = address.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getFromCache(key: string): DaDataResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: DaDataResponse): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private calculateConfidence(qcGeo: string): number {
    switch (qcGeo) {
      case '0': return ConfidenceLevel.EXACT_MATCH;
      case '1': return ConfidenceLevel.GOOD_MATCH;
      case '2': 
      case '3': return ConfidenceLevel.PARTIAL_MATCH;
      case '4': return ConfidenceLevel.POOR_MATCH;
      default: return ConfidenceLevel.NO_MATCH;
    }
  }

  private parseResponse(apiResponse: DaDataApiResponse): { best: StandardizedAddress | null; suggestions: StandardizedAddress[] } {
    if (!apiResponse.suggestions || apiResponse.suggestions.length === 0) {
      return { best: null, suggestions: [] };
    }

    const suggestions = apiResponse.suggestions.map(suggestion => {
      const data = suggestion.data;
      return {
        city: data.city || '',
        street: data.street || '',
        house: data.house || '',
        apartment: data.flat || '',
        fias_id: data.house_fias_id || '',
        confidence_level: this.calculateConfidence(data.qc_geo || '5')
      };
    });

    // Лучший результат - с наивысшим уровнем достоверности
    const best = suggestions.find(s => s.confidence_level >= ConfidenceLevel.GOOD_MATCH) || null;

    return { best, suggestions };
  }

  private async makeApiRequest(address: string, attempt: number = 1): Promise<DaDataApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch( `${this.config.baseUrl}/suggest/address`, {
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'Authorization':  `Token ${this.config.apiKey}`,
          'X-secret':       '050209ff2af5411fac79a59ff57e91f10466fa9e'
        },
        body: JSON.stringify({
          query: address,
          count: 5
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt < this.config.retryAttempts!) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.makeApiRequest(address, attempt + 1);
      }
      
      throw error;
    }
  }

  async standardizeAddress(address: string): Promise<DaDataResponse> {
    if (!address || address.trim().length === 0) {
      return {
        success: false,
        data: null,
        suggestions: [],
        message: 'Адрес не может быть пустым'
      };
    }

    const cacheKey = this.generateCacheKey(address);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const apiResponse = await this.makeApiRequest(address);
      const { best, suggestions } = this.parseResponse(apiResponse);

      const result: DaDataResponse = {
        success: !!best,
        data: best,
        suggestions: suggestions,
        message: best 
          ? 'Адрес успешно стандартизирован' 
          : suggestions.length > 0 
            ? `Найдено ${suggestions.length} похожих вариантов`
            : 'Адрес не найден'
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      const fallbackResult: DaDataResponse = {
        success: false,
        data: null,
        suggestions: [],
        message: `Ошибка API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };

      return fallbackResult;
    }
  }
}

export default DaDataService;
