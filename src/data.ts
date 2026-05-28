import { ActivityOption, FoodOption, ExtraOption } from './types';

export const ACTIVITIES_OPTIONS: ActivityOption[] = [
  { id: 'EAT_OUT', label: 'Comer fora', emoji: '🍔' },
  { id: 'PUB', label: 'Barzinho', emoji: '🍻' },
  { id: 'MOVIES', label: 'Cinema', emoji: '🎬' },
  { id: 'CUDDLING', label: 'Ficar em Casa', emoji: '🛋️' },
  { id: 'ICE_CREAM', label: 'Tomar sorvete', emoji: '🍦' },
  { id: 'NEW_PLACE', label: 'Visitar um lugar novo', emoji: '🗺️' },
];

export const FOOD_OPTIONS: FoodOption[] = [
  { id: 'JAPANESE', label: 'Comida japonesa', emoji: '🍣' },
  { id: 'BARBECUE', label: 'Churrasco', emoji: '🥩' },
  { id: 'CHINESE', label: 'Comida chinesa', emoji: '🥡' },
  { id: 'BURGER', label: 'Hambúrguer', emoji: '🍔' },
  { id: 'PASTA', label: 'Massa', emoji: '🍝' },
  { id: 'PIZZA', label: 'Pizza', emoji: '🍕' },
  { id: 'HOT_DOG', label: 'Cachorro-quente', emoji: '🌭' },
  { id: 'NOT_EAT', label: 'Você decide', emoji: '🙅‍♀️' },
];

export const EXTRAS_OPTIONS: ExtraOption[] = [
  { id: 'KISSES', label: 'Beijos ilimitados', cost: 'Grátis', emoji: '💋' },
  { id: 'HUGS', label: 'Abraços ilimitados', cost: 'Grátis', emoji: '🫂' },
  { id: 'DRIVE', label: 'Carona para casa', cost: 'Grátis', emoji: '🚗' },
  { id: 'FOREHEAD', label: 'Beijinho na testa', cost: 'Tem que dar um de volta', emoji: '🥺', requiresReturn: true },
  { id: 'NO_HOLDING', label: 'Não dar as mãos', cost: 'Proibido', emoji: '💔' },
];
