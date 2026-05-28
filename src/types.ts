export type Step = 'WELCOME' | 'ACTIVITIES' | 'FOOD' | 'SUGGESTION' | 'EXTRAS' | 'CHECKOUT';

export interface ActivityOption {
  id: string;
  label: string;
  emoji: string;
}

export interface FoodOption {
  id: string;
  label: string;
  emoji: string;
}

export interface ExtraOption {
  id: string;
  label: string;
  cost: string;
  emoji: string;
  requiresReturn?: boolean;
}

export interface DateOrderState {
  activities: string[]; // Activity IDs
  foods: string[];     // Food IDs
  suggestion: string;   // Input suggestion (Visit new place text)
  extras: string[];     // Extra IDs
}
