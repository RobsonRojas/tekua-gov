export const MAX_THANKS_MESSAGE = 280;
export const MAX_THANKS_EMOJIS = 5;
/** Emojis oferecidos para o agradecimento. A lista é fixa: o servidor também recusa qualquer outro texto. */
export const EMOJI_CHOICES = ['🙏', '❤️', '🌱', '🤝', '🌟', '🎉', '🙌', '💚'];

export type Sentiment = 'gratitude' | 'ingratitude';

export interface GratitudeValue {
  message: string;
  emojis: string[];
  isPublic: boolean;
  sentiment: Sentiment;
}

export const emptyGratitude: GratitudeValue = { message: '', emojis: [], isPublic: true, sentiment: 'gratitude' };
