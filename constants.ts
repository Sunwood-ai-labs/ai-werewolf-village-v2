import { Role } from './types';

export const GM_ID = 'GAME_MASTER';
export const GM_NAME = 'ゲームマスター';
export const GM_AVATAR = 'https://ui-avatars.com/api/?name=GM&background=000&color=fff&size=128&font-size=0.5';

export const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Google)' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp (Google)' },
  { id: 'openrouter/google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro (OpenRouter)' },
  { id: 'openrouter/anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)' },
  { id: 'openrouter/openai/gpt-4o', name: 'GPT-4o (OpenRouter)' },
  { id: 'openrouter/deepseek/deepseek-r1:free', name: 'DeepSeek R1 (OpenRouter)' },
  { id: 'openrouter/deepseek/deepseek-v3.2', name: 'DeepSeek V3.2 (OpenRouter)' },
  { id: 'openrouter/x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast (OpenRouter)' },
];

export const AVATARS = [
  "https://picsum.photos/seed/p1/100/100",
  "https://picsum.photos/seed/p2/100/100",
  "https://picsum.photos/seed/p3/100/100",
  "https://picsum.photos/seed/p4/100/100",
  "https://picsum.photos/seed/p5/100/100",
  "https://picsum.photos/seed/p6/100/100",
  "https://picsum.photos/seed/p7/100/100",
  "https://picsum.photos/seed/p8/100/100",
  "https://picsum.photos/seed/p9/100/100",
  "https://picsum.photos/seed/p10/100/100",
  "https://picsum.photos/seed/p11/100/100",
  "https://picsum.photos/seed/p12/100/100",
];

export const NAMES = [
  "サトウ", "スズキ", "タカハシ", "タナカ", "イトウ", "ワタナベ", "ヤマモト", "ナカムラ", "コバヤシ", "カトウ", "ヨシダ", "ヤマダ"
];

export const PERSONALITIES = [
  "論理的で冷静。事実に焦点を当てる。",
  "感情的で攻撃的。すぐに他人を疑う。",
  "無口で観察眼が鋭い。口数は少ないが核心を突く。",
  "混沌としていて予測不能。意見を頻繁に変える。",
  "リーダーシップがあり、グループをまとめようとする。",
  "疑り深く、誰も信用しない。",
  "友好的だが防衛的。平和を保とうとする。",
  "分析的。発言の矛盾を探すのが得意。",
  "直感的。勘で人狼を当てようとする。",
  "慎重派。確証が得られるまで投票を避ける。"
];

// Default configuration for role counts
export const DEFAULT_ROLE_COUNTS: Record<Role, number> = {
  [Role.VILLAGER]: 3,
  [Role.WEREWOLF]: 1,
  [Role.SEER]: 1,
  [Role.BODYGUARD]: 0,
  [Role.MEDIUM]: 0,
};

// 5 Player Setup for faster games (Legacy reference)
export const INITIAL_ROLES_5 = [
  Role.WEREWOLF,
  Role.SEER,
  Role.VILLAGER,
  Role.VILLAGER,
  Role.VILLAGER
];