// types.ts
export interface DaDataConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface StandardizedAddress {
  city: string;
  street: string;
  house: string;
  apartment: string;
  fias_id: string;
  confidence_level: number;
}

export interface DaDataResponse {
  success: boolean;
  data: StandardizedAddress | null;
  suggestions: StandardizedAddress[];
  message: string;
}

export interface DaDataApiResponse {
  suggestions: Array<{
    value: string;
    unrestricted_value: string;
    data: {
      city: string;
      street: string;
      house: string;
      flat: string;
      house_fias_id: string;
      qc_geo: string;
    };
  }>;
}

export enum ConfidenceLevel {
  EXACT_MATCH = 10,
  GOOD_MATCH = 8,
  PARTIAL_MATCH = 5,
  POOR_MATCH = 2,
  NO_MATCH = 0
}