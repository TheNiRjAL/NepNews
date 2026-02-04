export type Language = 'en' | 'np';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  timestamp: string;
}

export interface Party {
  id: string;
  name: string;
  fullName: string;
  leader: string;
  symbol: string; // Emoji or icon description
  description: string;
  recentStance: string;
  color: string;
  imageUrl: string;
}

export interface HoroscopeItem {
  sign: string;
  prediction: string;
  icon: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'hot' | 'info';
}