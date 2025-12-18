
export enum Rarity {
  N = 'N',
  R = 'R',
  SR = 'SR',
  SSR = 'SSR',
  UR = 'UR'
}

export enum ElementType {
  LOGIC = 'LOGIC',
  EMOTION = 'EMOTION',
  STRENGTH = 'STRENGTH',
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export enum CardTag {
  ADA = 'ADA',
  PORT_MAFIA = 'Port Mafia',
  GUILD = 'Guild',
  HUNTING_DOGS = 'Hunting Dogs',
  DOA = 'Decay of Angels',
  AU_HP = 'Harry Potter AU',
  AU_PJO = 'PJO AU',
  AU_COIL = 'COIL AU',
  AU_SCHOOL = 'School AU',
  AU_MHA = 'MHA AU',
  AU_SINGER = 'Singer AU',
  AU_GENDER = 'Gender Swap',
  AU_OWL = 'Owl House AU',
  AU_MLB = 'MLB AU',
  AU_INVERTED = 'Inverted AU',
  AU_MODERN = 'Modern AU',
  AU_ACTOR = 'Actor AU',
  AU_YOKAI = 'Yokai AU',
  AU_BEAST = 'Beast AU',
  AU_VAMPIRE = 'Vampire AU',
  AU_CYBERPUNK = 'Cyberpunk AU',
  ARC_DARK_ERA = 'Dark Era',
  ARC_GUILD = 'Guild Arc',
  ARC_DEAD_APPLE = 'Dead Apple',
  ARC_DOA = 'Decay of Angels Arc'
}

export interface Skill {
  name: string;
  description: string;
  type: 'damage' | 'heal' | 'buff' | 'coin_boost';
  value: number;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  image: string;
  hpBoost?: number; // multiplier, e.g. 0.1 for 10%
  atkBoost?: number; // multiplier
}

export interface Card {
  id: string; 
  name: string;
  title: string;
  rarity: Rarity;
  element: ElementType;
  image: string;
  description: string;
  hp: number;
  atk: number;
  tags: CardTag[];
  skill: Skill;
  limitBreak: number;
  level: number;
  maxLevel: number;
  isFavorite: boolean;
  xp: number;
  injuredUntil?: number; 
  equippedEquipmentId?: string; // Instance ID of equipment
}

export interface Synergy {
  id: string;
  name: string;
  requiredNames: string[];
  effectDescription: string;
  multiplier: number;
}

export interface StudySet {
  id: string;
  name: string;
  folderId?: string;
  material: string;
  items: Array<{ term: string; definition: string }>;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Expedition {
  id: string;
  instanceIds: string[];
  startTime: number;
  duration: number; 
  rewardCoins: number;
  rewardFurnitureId?: string;
}

export interface Banner {
  id: string;
  name: string;
  image: string;
  type: 'standard' | 'au' | 'limited' | 'equipment';
  cost: number;
  endTime?: number;
}

export interface UserState {
  coins: number;
  gems: number;
  pageFragments: number; 
  notebookPages: number; 
  battleItems: Record<string, number>; 
  inventory: string[];
  cardInstances: Record<string, Card>;
  equipmentInstances: Record<string, Equipment>;
  masterCards: Card[]; 
  masterEquipment: Equipment[];
  masterBanners: Banner[];
  xpItems: Record<string, number>; 
  teams: string[][];
  currentTeamIndex: number;
  pityCount: Record<string, number>;
  studySets: StudySet[];
  folders: Folder[];
  studyHistory: Record<string, number>; 
  unlockedBuffs: string[]; 
  srsData: Record<string, { level: number, nextReview: number }>; 
  userEmail: string | null;
  isDev: boolean;
  activeExpeditions: Expedition[];
  furniture: string[]; 
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  dependsOn?: string;
}

export interface XPItem {
  id: string;
  name: string;
  xpValue: number;
  rarity: Rarity;
  icon: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'stun' | 'damage' | 'heal' | 'debuff';
}
