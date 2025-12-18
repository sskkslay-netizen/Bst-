import { Rarity, ElementType, CardTag, Card, Banner, Synergy, TechNode, XPItem, CraftingRecipe, Equipment } from './types';

export const INITIAL_GEMS = 5000;
export const INITIAL_COINS = 10000;
export const GACHA_COST_SINGLE = 100;
export const GACHA_COST_TEN = 1000;

export const XP_PER_LEVEL = 1000;
export const COIN_COST_PER_XP = 0.5;

// Shop prices for coins
export const XP_SHOP_PRICES: Record<string, number> = {
  'xp_n': 500,
  'xp_r': 2000,
  'xp_sr': 7500,
  'xp_ssr': 30000,
};

export const ELEMENT_TRIANGLE: Record<ElementType, ElementType> = {
  [ElementType.LOGIC]: ElementType.STRENGTH,
  [ElementType.STRENGTH]: ElementType.EMOTION,
  [ElementType.EMOTION]: ElementType.LOGIC,
  [ElementType.LIGHT]: ElementType.DARK,
  [ElementType.DARK]: ElementType.LIGHT,
};

export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30, 90, 180]; // days

export const XP_ITEMS: XPItem[] = [
  { id: 'xp_n', name: 'Agency Report', xpValue: 100, rarity: Rarity.N, icon: '📄' },
  { id: 'xp_r', name: 'Mafia Intel', xpValue: 500, rarity: Rarity.R, icon: '📂' },
  { id: 'xp_sr', name: 'Detective Log', xpValue: 2000, rarity: Rarity.SR, icon: '📔' },
  { id: 'xp_ssr', name: 'Forbidden Manuscript', xpValue: 10000, rarity: Rarity.SSR, icon: '📜' },
];

export const XP_ITEMS_MAP: Record<string, XPItem> = XP_ITEMS.reduce((acc, item) => ({
  ...acc,
  [item.id]: item
}), {});

export const TECH_TREE: TechNode[] = [
  { 
    id: 'tech_providence', 
    name: 'Rule of Providence', 
    description: 'The Book rewrites probability. Increases UR recruitment rate by 1.0%.', 
    cost: 15, 
    icon: '👁️' 
  },
  { 
    id: 'tech_vitality', 
    name: 'Rule of Vitality', 
    description: 'Mental stamina flows through the Agency. Increases Study Points/XP gain from focus sessions by 25%.', 
    cost: 10, 
    icon: '⚡' 
  },
  { 
    id: 'tech_economy', 
    name: 'Rule of Economy', 
    description: 'Reality is more efficient. Reduces the Coin cost of character training (Level Up) by 20%.', 
    cost: 12, 
    icon: '⚖️' 
  },
  { 
    id: 'tech_deduction', 
    name: 'Rapid Deduction', 
    description: 'Increases Coin rewards from all study games by 15%.', 
    cost: 8, 
    icon: '🧠' 
  },
];

export const SYNERGIES: Synergy[] = [
  { id: 'syn_double_black', name: 'Double Black (Soukoku)', requiredNames: ['Osamu Dazai', 'Chuuya Nakahara'], effectDescription: 'Increases Damage by 50%.', multiplier: 1.5 },
  { id: 'syn_shin_soukoku', name: 'New Soukoku', requiredNames: ['Atsushi Nakajima', 'Ryunosuke Akutagawa'], effectDescription: 'Increases Damage by 30% and Heals 5% HP per turn.', multiplier: 1.3 },
  { id: 'syn_hunting_dogs', name: 'Will of the Military', requiredNames: ['Saigiku Jouno', 'Tecchou Suehiro'], effectDescription: 'Increases Defense by 40%.', multiplier: 1.4 }
];

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  { id: 'item_stun', name: 'Stun Grenade', description: 'Manifests a flashbang. Stuns the enemy for 1 turn.', cost: 3, icon: '💥', type: 'stun' },
  { id: 'item_wire', name: 'Wire Gun', description: 'Shoots high-tension wire. Deals 50 fixed damage.', cost: 5, icon: '🔫', type: 'damage' },
  { id: 'item_bandage', name: 'Ideal Bandage', description: 'Notes on first aid. Restores 40 HP.', cost: 4, icon: '🩹', type: 'heal' },
  { id: 'item_smoke', name: 'Smoke Bomb', description: 'Creates a distraction. Reduces enemy damage by 50% for 2 turns.', cost: 6, icon: '💨', type: 'debuff' }
];

export interface AppTheme {
  bg: string;
  primary: string;
  accent: string;
  effect?: 'rain' | 'fog' | 'sparkle' | 'none';
}

export const THEMES: Record<string, AppTheme> = {
  ADA: { bg: 'bg-blue-50', primary: 'text-blue-600', accent: 'bg-blue-400', effect: 'none' },
  PM: { bg: 'bg-slate-900', primary: 'text-red-600', accent: 'bg-red-800', effect: 'none' },
  GUILD: { bg: 'bg-amber-50', primary: 'text-amber-700', accent: 'bg-amber-500', effect: 'none' },
  DEAD_APPLE: { bg: 'bg-slate-50', primary: 'text-rose-600', accent: 'bg-rose-500', effect: 'fog' },
  DARK_ERA: { bg: 'bg-stone-200', primary: 'text-stone-800', accent: 'bg-stone-600', effect: 'rain' },
  HUNTING_DOGS: { bg: 'bg-red-50', primary: 'text-red-900', accent: 'bg-red-700', effect: 'none' },
  DOA: { bg: 'bg-indigo-950', primary: 'text-white', accent: 'bg-indigo-600', effect: 'none' },
  CASINO: { bg: 'bg-black', primary: 'text-amber-400', accent: 'bg-red-600', effect: 'sparkle' }
};

const createCard = (id: string, name: string, title: string, rarity: Rarity, element: ElementType, tags: CardTag[], image: string): Card => ({
  id, name, title, rarity, element, tags, image,
  description: `Agent Dossier: ${name}, ${title}. Registered under ${tags.join(', ')}.`,
  hp: rarity === Rarity.UR ? 2500 : rarity === Rarity.SSR ? 1800 : rarity === Rarity.SR ? 1200 : 900,
  atk: rarity === Rarity.UR ? 900 : rarity === Rarity.SSR ? 700 : rarity === Rarity.SR ? 450 : 300,
  skill: { 
    name: 'Tactical Manifestation', 
    description: 'Unleashes ability-based parameters to secure victory.', 
    type: rarity === Rarity.UR ? 'buff' : 'damage', 
    value: rarity === Rarity.UR ? 2.0 : 1200 
  },
  limitBreak: 0, level: 1, maxLevel: rarity === Rarity.UR ? 70 : 60, isFavorite: false, xp: 0
});

export const PRESET_EQUIPMENT: Equipment[] = [
  { 
    id: 'eq_bandages', 
    name: "Dazai's Bandages", 
    description: "Old bandages filled with memories. Increases HP by 10%.", 
    rarity: Rarity.SSR, 
    image: 'https://images.unsplash.com/photo-1582719202047-76d3432ee323?q=80&w=200&h=200&auto=format&fit=crop',
    hpBoost: 0.1
  },
  { 
    id: 'eq_glasses', 
    name: "Ranpo's Glasses", 
    description: "Necessary for 'Ultra-Deduction'. Increases ATK by 15%.", 
    rarity: Rarity.SSR, 
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=200&h=200&auto=format&fit=crop',
    atkBoost: 0.15
  },
  { 
    id: 'eq_notebook', 
    name: "Kunikida's Notebook", 
    description: "A notebook with 'IDEAL' written on the cover. Increases HP and ATK by 10%.", 
    rarity: Rarity.SSR, 
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=200&h=200&auto=format&fit=crop',
    hpBoost: 0.1,
    atkBoost: 0.1
  },
  { 
    id: 'eq_fountain_pen', 
    name: "Fountain Pen", 
    description: "A standard agency pen. Increases ATK by 5%.", 
    rarity: Rarity.SR, 
    image: 'https://images.unsplash.com/photo-1585336139118-132f7f21503e?q=80&w=200&h=200&auto=format&fit=crop',
    atkBoost: 0.05
  },
  { 
    id: 'eq_notepad', 
    name: "Note Pad", 
    description: "For quick deductions. Increases HP by 5%.", 
    rarity: Rarity.R, 
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=200&h=200&auto=format&fit=crop',
    hpBoost: 0.05
  },
];

export const PRESET_CARDS: Card[] = [
  // --- MHA AU ---
  createCard('c_ur_atsushi_mha', 'Atsushi Nakajima', 'Hero-in-Training: Moonlight Smash', Rarity.UR, ElementType.STRENGTH, [CardTag.AU_MHA], 'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_akutagawa_mha', 'Akutagawa Ryūnosuke', 'Vigilante: Rashomon Blast', Rarity.SSR, ElementType.DARK, [CardTag.AU_MHA], 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&h=400&auto=format&fit=crop'),
  createCard('c_ssr_chuuya_mha', 'Chūya Nakahara', 'Hero: Zero-G Arahabaki', Rarity.SSR, ElementType.STRENGTH, [CardTag.AU_MHA], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=400&auto=format&fit=crop'),
  createCard('c_ur_dazai_mha', 'Osamu Dazai', 'Top Hero: Erasure Logic', Rarity.UR, ElementType.LOGIC, [CardTag.AU_MHA], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&auto=format&fit=crop'),

  // --- PJO AU (Percy Jackson) ---
  createCard('c_ur_chuuya_pjo', 'Chūya Nakahara', 'Son of Ares: Gravity Spear', Rarity.UR, ElementType.STRENGTH, [CardTag.AU_PJO], 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_dazai_pjo', 'Osamu Dazai', 'Son of Hades: Stygian Shadow', Rarity.SSR, ElementType.DARK, [CardTag.AU_PJO], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_atsushi_pjo', 'Atsushi Nakajima', 'Son of Poseidon: Tidal Beast', Rarity.SSR, ElementType.LIGHT, [CardTag.AU_PJO], 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_ranpo_pjo', 'Ranpo Edogawa', 'Son of Athena: Strategy Master', Rarity.SR, ElementType.LOGIC, [CardTag.AU_PJO], 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- COIL AU (Steampunk/Mechanical) ---
  createCard('c_ssr_kunikida_coil', 'Kunikida Doppo', 'Chronicle Engineer', Rarity.SSR, ElementType.LOGIC, [CardTag.AU_COIL], 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_katai_coil', 'Katai Tayama', 'The Steam-Ghost in the Net', Rarity.SR, ElementType.DARK, [CardTag.AU_COIL], 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- ACTOR AU ---
  createCard('c_ur_dazai_actor', 'Osamu Dazai', 'Award-Winning Enigma', Rarity.UR, ElementType.EMOTION, [CardTag.AU_ACTOR], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&auto=format&fit=crop'),
  createCard('c_ssr_chuuya_actor', 'Chūya Nakahara', 'Action Star: No Stunt Double', Rarity.SSR, ElementType.STRENGTH, [CardTag.AU_ACTOR], 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_atsushi_actor', 'Atsushi Nakajima', 'Rising Star: Method Actor', Rarity.SR, ElementType.EMOTION, [CardTag.AU_ACTOR], 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- MODERN AU ---
  createCard('c_sr_ranpo_modern', 'Ranpo Edogawa', 'Coffee-Addicted Detective', Rarity.SR, ElementType.LOGIC, [CardTag.AU_MODERN], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_poe_modern', 'Edgar Allan Poe', 'Reclusive Mystery Novelist', Rarity.R, ElementType.DARK, [CardTag.AU_MODERN], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_sigma_modern', 'Sigma', 'Sky Casino Manager', Rarity.SR, ElementType.LOGIC, [CardTag.AU_MODERN], 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- HARRY POTTER AU ---
  createCard('c_ur_atsushi_hp', 'Atsushi Nakajima', 'Gryffindor: The Brave Beast', Rarity.UR, ElementType.STRENGTH, [CardTag.AU_HP], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_akutagawa_hp', 'Akutagawa Ryūnosuke', 'Slytherin: Shadow Seeker', Rarity.SSR, ElementType.DARK, [CardTag.AU_HP], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_ranpo_hp', 'Ranpo Edogawa', 'Ravenclaw: The Ultimate Seer', Rarity.SSR, ElementType.LOGIC, [CardTag.AU_HP], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_kenji_hp', 'Kenji Miyazawa', 'Hufflepuff: Herbology Master', Rarity.SR, ElementType.LIGHT, [CardTag.AU_HP], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- OWL HOUSE AU ---
  createCard('c_ur_dazai_owl', 'Osamu Dazai', 'Covenless Rebel: Anti-Magic', Rarity.UR, ElementType.LOGIC, [CardTag.AU_OWL], 'https://images.unsplash.com/photo-1550525811-e5869dd03032?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_kyouka_owl', 'Kyouka Izumi', 'Palisman Guardian: Snow Rabbit', Rarity.SSR, ElementType.EMOTION, [CardTag.AU_OWL], 'https://images.unsplash.com/photo-1529626458564-28a62394f836?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- MLB AU (Miraculous) ---
  createCard('c_ur_kyouka_mlb', 'Kyouka Izumi', 'Masked Hero: Lucky Rabbit', Rarity.UR, ElementType.LIGHT, [CardTag.AU_MLB], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_atsushi_mlb', 'Atsushi Nakajima', 'The White Cat: Claws of Regret', Rarity.SSR, ElementType.DARK, [CardTag.AU_MLB], 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- BEAST AU ---
  createCard('c_ur_atsushi_beast', 'Atsushi Nakajima', 'The White Reaper', Rarity.UR, ElementType.DARK, [CardTag.AU_BEAST], 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_dazai_beast', 'Osamu Dazai', 'Mafia Boss: The Final Plan', Rarity.UR, ElementType.LOGIC, [CardTag.AU_BEAST], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_akutagawa_beast', 'Akutagawa Ryūnosuke', 'Agency Detective: Lone Wolf', Rarity.SSR, ElementType.STRENGTH, [CardTag.AU_BEAST], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- INVERTED AU (Roles Swapped) ---
  createCard('c_ur_mori_inverted', 'Ogai Mori', 'ADA Leader: The Surgeon\'s Path', Rarity.UR, ElementType.LOGIC, [CardTag.AU_INVERTED], 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_fukuzawa_inverted', 'Yukichi Fukuzawa', 'Mafia Boss: Blade of the Night', Rarity.UR, ElementType.STRENGTH, [CardTag.AU_INVERTED], 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_dazai_inverted', 'Osamu Dazai', 'Order of the Clock Tower Agent', Rarity.SSR, ElementType.DARK, [CardTag.AU_INVERTED], 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- VAMPIRE AU ---
  createCard('c_ur_bram_vampire', 'Bram Stoker', 'Vampire King: Sleeping Knight', Rarity.UR, ElementType.DARK, [CardTag.AU_VAMPIRE], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_chuuya_vampire', 'Chūya Nakahara', 'Infected Calamity: Gravity Blood', Rarity.SSR, ElementType.STRENGTH, [CardTag.AU_VAMPIRE], 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- YOKAI AU ---
  createCard('c_ur_dazai_yokai', 'Osamu Dazai', 'The Nine-Tailed Kitsune', Rarity.UR, ElementType.LOGIC, [CardTag.AU_YOKAI], 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_chuuya_yokai', 'Chūya Nakahara', 'Raging Red Oni', Rarity.SSR, ElementType.STRENGTH, [CardTag.AU_YOKAI], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=400&auto=format&fit=crop'),
  createCard('c_sr_atsushi_yokai', 'Atsushi Nakajima', 'Byakko Spirit of the Forest', Rarity.SR, ElementType.LIGHT, [CardTag.AU_YOKAI], 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- CYBERPUNK AU ---
  createCard('c_ssr_ango_cyber', 'Ango Sakaguchi', 'Neural Network Watcher', Rarity.SSR, ElementType.LOGIC, [CardTag.AU_CYBERPUNK], 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_yosano_cyber', 'Akiko Yosano', 'Nanotech Surgeon', Rarity.SSR, ElementType.EMOTION, [CardTag.AU_CYBERPUNK], 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- ADA ---
  createCard('c_ur_dazai', 'Osamu Dazai', 'No Longer Human', Rarity.UR, ElementType.LOGIC, [CardTag.ADA], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_atsushi', 'Atsushi Nakajima', 'Beast Beneath the Moonlight', Rarity.UR, ElementType.STRENGTH, [CardTag.ADA], 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_ranpo', 'Ranpo Edogawa', 'Super Deduction', Rarity.SSR, ElementType.LOGIC, [CardTag.ADA], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_kunikida', 'Doppo Kunikida', 'Lone Poet', Rarity.SSR, ElementType.STRENGTH, [CardTag.ADA], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_kenji', 'Kenji Miyazawa', 'Undefeated by the Rain', Rarity.SR, ElementType.STRENGTH, [CardTag.ADA], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_tanizaki', 'Junichiro Tanizaki', 'Light Snow', Rarity.R, ElementType.LIGHT, [CardTag.ADA], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- SCHOOL AU ---
  createCard('c_sr_dazai_school', 'Osamu Dazai', 'School Delinquent (Truant King)', Rarity.SR, ElementType.STRENGTH, [CardTag.AU_SCHOOL], 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_kunikida_school', 'Kunikida Doppo', 'Class President (Ideal Schedule)', Rarity.SSR, ElementType.LOGIC, [CardTag.AU_SCHOOL], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_akutagawa_school', 'Akutagawa Ryūnosuke', 'Bad Boy Transfer Student', Rarity.SR, ElementType.EMOTION, [CardTag.AU_SCHOOL], 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_chuuya_school', 'Chūya Nakahara', 'Motorcycle Club Leader', Rarity.SR, ElementType.STRENGTH, [CardTag.AU_SCHOOL], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_atsushi_school', 'Atsushi Nakajima', 'First Year Honor Student', Rarity.R, ElementType.STRENGTH, [CardTag.AU_SCHOOL], 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- SINGER AU ---
  createCard('c_ssr_chuuya_singer', 'Chūya Nakahara', 'Heavy Metal Vocalist (Corruption)', Rarity.SSR, ElementType.EMOTION, [CardTag.AU_SINGER], 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_dazai_singer', 'Osamu Dazai', 'Lofi Producer (Melancholy Beat)', Rarity.SSR, ElementType.LOGIC, [CardTag.AU_SINGER], 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_sigma_singer', 'Sigma', 'Casino Pop Idol', Rarity.SR, ElementType.EMOTION, [CardTag.AU_SINGER], 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- GENDER SWAP AU ---
  createCard('c_ssr_dazai_fem', 'Osamu Dazai (Female)', 'Femme Fatale Executive', Rarity.SSR, ElementType.LOGIC, [CardTag.AU_GENDER], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_chuuya_fem', 'Chūya Nakahara (Female)', 'Mafia Petite Queen', Rarity.SSR, ElementType.EMOTION, [CardTag.AU_GENDER], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_akutagawa_fem', 'Akutagawa Ryūnosuke (Female)', 'Silent Shadow Blade', Rarity.SR, ElementType.DARK, [CardTag.AU_GENDER], 'https://images.unsplash.com/photo-1506197603486-7c8b2c7dc55e?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- PORT MAFIA ---
  createCard('c_ur_chuuya', 'Chūya Nakahara', 'Upon the Tainted Sorrow', Rarity.UR, ElementType.STRENGTH, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_akutagawa', 'Akutagawa Ryūnosuke', 'Rashomon', Rarity.SSR, ElementType.DARK, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_kouyou', 'Kouyou Ozaki', 'Golden Demon', Rarity.SSR, ElementType.EMOTION, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_gin', 'Gin Akutagawa', 'Silent Blade', Rarity.SR, ElementType.DARK, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1506197603486-7c8b2c7dc55e?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_higuchi', 'Ichiyo Higuchi', 'Devoted Subordinate', Rarity.SR, ElementType.EMOTION, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_mori', 'Ogai Mori', 'Vita Sexualis', Rarity.UR, ElementType.LOGIC, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_elise', 'Elise', 'Vita Sexualis Manifestation', Rarity.SSR, ElementType.LIGHT, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1529626458564-28a62394f836?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_kajii', 'Motojiro Kajii', 'Lemon Bomber', Rarity.SR, ElementType.STRENGTH, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- GUILD ---
  createCard('c_ur_fitzgerald', 'Francis Scott Fitzgerald', 'The Great Fitzgerald', Rarity.UR, ElementType.LOGIC, [CardTag.GUILD], 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_poe', 'Edgar Allan Poe', 'Black Cat in the Rue Morgue', Rarity.SSR, ElementType.DARK, [CardTag.GUILD], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_lovecraft', 'Howard Phillips Lovecraft', 'The Great Old Ones', Rarity.SSR, ElementType.DARK, [CardTag.GUILD], 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_steinbeck', 'John Steinbeck', 'The Grapes of Wrath', Rarity.SR, ElementType.STRENGTH, [CardTag.GUILD], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_twain', 'Mark Twain', 'Huckleberry Finn and Tom Sawyer', Rarity.SR, ElementType.LOGIC, [CardTag.GUILD], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_alcott', 'Louisa May Alcott', 'Little Women', Rarity.SR, ElementType.EMOTION, [CardTag.GUILD], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- HUNTING DOGS ---
  createCard('c_ur_fukuchi', 'Ouchi Fukuchi', 'Mirror Lion', Rarity.UR, ElementType.STRENGTH, [CardTag.HUNTING_DOGS], 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_jouno', 'Saigiku Jouno', 'Priceless Tears', Rarity.SSR, ElementType.LOGIC, [CardTag.HUNTING_DOGS], 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_tecchou', 'Tecchou Suehiro', 'Plum Blossoms in Snow', Rarity.SSR, ElementType.STRENGTH, [CardTag.HUNTING_DOGS], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_teruko', 'Teruko Okura', 'Gasp of the Soul', Rarity.SR, ElementType.EMOTION, [CardTag.HUNTING_DOGS], 'https://images.unsplash.com/photo-1529626458564-28a62394f836?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_tachihara', 'Michizo Tachihara', 'Midwinter Memento', Rarity.SR, ElementType.STRENGTH, [CardTag.HUNTING_DOGS], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- DECAY OF ANGELS ---
  createCard('c_ur_fyodor', 'Fyodor Dostoevsky', 'Crime and Punishment', Rarity.UR, ElementType.LOGIC, [CardTag.DOA], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_nikolai', 'Nikolai Gogol', 'The Overcoat', Rarity.UR, ElementType.EMOTION, [CardTag.DOA], 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_sigma', 'Sigma', 'Unknown', Rarity.SSR, ElementType.LOGIC, [CardTag.DOA], 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_bram', 'Bram Stoker', 'Dracula', Rarity.SSR, ElementType.DARK, [CardTag.DOA], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_ivan', 'Ivan Goncharov', 'The Precipice', Rarity.SR, ElementType.STRENGTH, [CardTag.DOA], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- MORE ADA MEMBERS ---
  createCard('c_ssr_yosano', 'Akiko Yosano', 'Thou Shalt Not Die', Rarity.SSR, ElementType.EMOTION, [CardTag.ADA], 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_naomi', 'Naomi Tanizaki', 'Light Snow (Support)', Rarity.SR, ElementType.LIGHT, [CardTag.ADA], 'https://images.unsplash.com/photo-1529626458564-28a62394f836?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_katai', 'Katai Tayama', 'Futon', Rarity.SR, ElementType.LOGIC, [CardTag.ADA], 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_fukuzawa', 'Yukichi Fukuzawa', 'All Men Are Equal', Rarity.UR, ElementType.LIGHT, [CardTag.ADA], 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- MORE PORT MAFIA ---
  createCard('c_ssr_kyouka', 'Kyouka Izumi', 'Demon Snow', Rarity.SSR, ElementType.DARK, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1529626458564-28a62394f836?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_hirotsu', 'Ryuurou Hirotsu', 'Falling Camellia', Rarity.SR, ElementType.STRENGTH, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_black_lizard', 'Black Lizard Squad', 'Tactical Unit', Rarity.R, ElementType.STRENGTH, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- SPECIAL GOVERNMENT ---
  createCard('c_ssr_ango', 'Ango Sakaguchi', 'Discourse on Decadence', Rarity.SSR, ElementType.LOGIC, [CardTag.ADA], 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_taneda', 'Santoka Taneda', 'Government Official', Rarity.SR, ElementType.LOGIC, [CardTag.ADA], 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- RATS IN THE HOUSE OF THE DEAD ---
  createCard('c_sr_pushkin', 'Alexander Pushkin', 'The Queen of Spades', Rarity.SR, ElementType.LOGIC, [CardTag.DOA], 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_mushitaro', 'Mushitaro Oguri', 'The Perfect Crime', Rarity.R, ElementType.DARK, [CardTag.DOA], 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- ADDITIONAL AU VARIANTS ---
  createCard('c_ssr_ranpo_detective', 'Ranpo Edogawa', 'Master Detective (Classic)', Rarity.SSR, ElementType.LOGIC, [CardTag.ADA, CardTag.ARC_GUILD], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ur_dazai_dark_era', 'Osamu Dazai', 'Port Mafia Executive (Dark Era)', Rarity.UR, ElementType.DARK, [CardTag.PORT_MAFIA, CardTag.ARC_DARK_ERA], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_chuuya_corruption', 'Chūya Nakahara', 'Corruption Unleashed', Rarity.SSR, ElementType.STRENGTH, [CardTag.PORT_MAFIA, CardTag.ARC_DEAD_APPLE], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- HOLIDAY/SEASONAL VARIANTS ---
  createCard('c_ssr_dazai_christmas', 'Osamu Dazai', 'Holiday Detective', Rarity.SSR, ElementType.LIGHT, [CardTag.ADA], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_atsushi_summer', 'Atsushi Nakajima', 'Beach Tiger', Rarity.SR, ElementType.LIGHT, [CardTag.ADA], 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_sr_chuuya_halloween', 'Chūya Nakahara', 'Vampire Lord', Rarity.SR, ElementType.DARK, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- CHIBI/CUTE VARIANTS ---
  createCard('c_r_chibi_dazai', 'Chibi Dazai', 'Tiny Bandaged Detective', Rarity.R, ElementType.EMOTION, [CardTag.ADA], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_chibi_chuuya', 'Chibi Chuuya', 'Pocket-Sized Gravity Master', Rarity.R, ElementType.EMOTION, [CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_r_chibi_atsushi', 'Chibi Atsushi', 'Baby Tiger', Rarity.R, ElementType.EMOTION, [CardTag.ADA], 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400&h=600&auto=format&fit=crop'),

  // --- ADDITIONAL RARE VARIANTS ---
  createCard('c_ur_soukoku', 'Double Black', 'Legendary Partnership', Rarity.UR, ElementType.DARK, [CardTag.ADA, CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=600&auto=format&fit=crop'),
  createCard('c_ssr_shin_soukoku', 'New Double Black', 'Next Generation', Rarity.SSR, ElementType.LIGHT, [CardTag.ADA, CardTag.PORT_MAFIA], 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400&h=600&auto=format&fit=crop'),
];

export const BANNERS: Banner[] = [
  { id: 'b_standard', name: 'Detective Recruitment', image: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=800&h=400&auto=format&fit=crop', type: 'standard', cost: 100 },
  { id: 'b_equipment', name: 'Tactical Gear Manifestation', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&h=400&auto=format&fit=crop', type: 'equipment', cost: 80 },
  { id: 'b_au_cross', name: 'Multiverse Crossover: MHA & PJO', image: 'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?q=80&w=800&h=400&auto=format&fit=crop', type: 'au', cost: 100 },
  { id: 'b_au', name: 'Alternative Realities Scout', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&h=400&auto=format&fit=crop', type: 'au', cost: 100 },
  { id: 'b_limited', name: 'Divine Myths & Magic', image: 'https://images.unsplash.com/photo-1506197603486-7c8b2c7dc55e?q=80&w=800&h=400&auto=format&fit=crop', type: 'limited', cost: 120 },
  { id: 'b_holiday', name: 'Seasonal Festivities', image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=800&h=400&auto=format&fit=crop', type: 'limited', cost: 150, endTime: Date.now() + (7 * 24 * 60 * 60 * 1000) },
  { id: 'b_soukoku', name: 'Double Black Legacy', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&h=400&auto=format&fit=crop', type: 'limited', cost: 200, endTime: Date.now() + (3 * 24 * 60 * 60 * 1000) }
];