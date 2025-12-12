import { Role, Language } from './types';

export const GM_ID = 'GAME_MASTER';
export const GM_NAME = 'GAME MASTER';
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

export const VOICE_NAMES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

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

export const NAMES_JP = [
  "サトウ", "スズキ", "タカハシ", "タナカ", "イトウ", "ワタナベ", "ヤマモト", "ナカムラ", "コバヤシ", "カトウ", "ヨシダ", "ヤマダ"
];

export const NAMES_EN = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez"
];

export const PERSONALITIES_JP = [
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

export const PERSONALITIES_EN = [
  "Logical and calm. Focuses strictly on facts.",
  "Emotional and aggressive. Quick to suspect others.",
  "Quiet but observant. Speaks little but hits the mark.",
  "Chaotic and unpredictable. Changes opinions frequently.",
  "Natural leader. Tries to organize the group.",
  "Paranoid. Trusts no one.",
  "Friendly but defensive. Tries to keep the peace.",
  "Analytical. Good at finding contradictions.",
  "Intuitive. Relies on gut feeling to find Werewolves.",
  "Cautious. Avoids voting until certain."
];

// Default configuration for role counts
export const DEFAULT_ROLE_COUNTS: Record<Role, number> = {
  [Role.VILLAGER]: 3,
  [Role.WEREWOLF]: 1,
  [Role.SEER]: 1,
  [Role.BODYGUARD]: 0,
  [Role.MEDIUM]: 0,
};

// UI Translations
export const UI_STRINGS: Record<Language, any> = {
  ja: {
    title: "AI 人狼村",
    phase: "フェーズ",
    phaseSetup: "準備中",
    phaseDayDiscussion: "昼：議論",
    phaseDayVote: "夕方：投票",
    phaseNightAction: "夜：行動",
    phaseGameOver: "終了",
    round: "ラウンド",
    day: "日数",
    daySuffix: "日目",
    btnStart: "ゲーム開始",
    btnAutoOn: "⏸ 自動再生 ON",
    btnAutoOff: "▶ 自動再生 OFF",
    btnNext: "次へ進む",
    btnReset: "リセット",
    btnSettings: "⚙️ 設定",
    heroTitle: "AI人狼村へようこそ",
    heroDesc: "をクリックして、AIたちによる命がけの推理ゲームを始めましょう。",
    winWolf: "人狼チームの勝利",
    winVillager: "村人チームの勝利",
    winWolfTitle: "WEREWOLVES WIN",
    winVillagerTitle: "VILLAGERS WIN",
    btnReplay: "もう一度プレイ",
    logTitle: "ログ",
    tabAll: "全て",
    tabPublic: "公開",
    tabWolf: "人狼",
    tabSeer: "占い",
    emptyLog: "村は静まり返っています... ゲームマスターが準備をしています。",
    thinking: "思考中...",
    settingsTitle: "⚙️ ゲーム設定",
    sectionApi: "API 設定",
    labelApiKey: "OpenRouter API Key (Claude/GPT等を使用する場合)",
    sectionAudio: "音声設定",
    labelTts: "🗣️ テキスト読み上げ (Gemini TTS)",
    descTts: "議論の内容をAI音声で読み上げます。プレイヤーごとに声色が変わります。",
    sectionRoles: "配役・人数設定",
    total: "合計",
    noteReflect: "※ 変更は次回の「ゲーム開始」または「リセット」時に反映されます。",
    sectionModel: "モデル設定",
    labelGmModel: "ゲームマスター / デフォルトモデル",
    btnApplyAll: "全員に適用",
    labelPlayerModel: "プレイヤー別 設定 (モデル / 声)",
    msgStartFirst: "ゲームを開始すると、プレイヤーごとの詳細設定が可能になります。",
    labelDuration: "議論の長さ (ターン数)",
    labelSpeed: "再生速度 (ms)",
    labelGodMode: "神の視点モード",
    descGodMode: "全てのプレイヤーの役職と、人狼・占い師の秘密の会話を閲覧できます。",
    btnClose: "閉じる",
    action: "ACTION",
    secret: "SECRET",
    dead: "死亡",
    unknown: "???"
  },
  en: {
    title: "AI Werewolf Village",
    phase: "PHASE",
    phaseSetup: "SETUP",
    phaseDayDiscussion: "DAY: DISCUSSION",
    phaseDayVote: "DUSK: VOTE",
    phaseNightAction: "NIGHT: ACTION",
    phaseGameOver: "GAME OVER",
    round: "ROUND",
    day: "DAY",
    daySuffix: "",
    btnStart: "Start Game",
    btnAutoOn: "⏸ Auto Play ON",
    btnAutoOff: "▶ Auto Play OFF",
    btnNext: "Next Step",
    btnReset: "Reset",
    btnSettings: "⚙️ Settings",
    heroTitle: "Welcome to AI Werewolf Village",
    heroDesc: "Click Start to begin the deadly deduction game by AI agents.",
    winWolf: "Werewolf Team Wins",
    winVillager: "Villager Team Wins",
    winWolfTitle: "WEREWOLVES WIN",
    winVillagerTitle: "VILLAGERS WIN",
    btnReplay: "Play Again",
    logTitle: "Logs",
    tabAll: "All",
    tabPublic: "Public",
    tabWolf: "Wolf",
    tabSeer: "Seer",
    emptyLog: "The village is silent... The Game Master is preparing.",
    thinking: "Thinking...",
    settingsTitle: "⚙️ Game Settings",
    sectionApi: "API Settings",
    labelApiKey: "OpenRouter API Key (for Claude/GPT etc.)",
    sectionAudio: "Audio Settings",
    labelTts: "🗣️ Text-to-Speech (Gemini TTS)",
    descTts: "Read out discussion contents with AI voices. Voices vary by player.",
    sectionRoles: "Roles & Count",
    total: "Total",
    noteReflect: "* Changes apply on next 'Start Game' or 'Reset'.",
    sectionModel: "Model Settings",
    labelGmModel: "Game Master / Default Model",
    btnApplyAll: "Apply to All",
    labelPlayerModel: "Player Settings (Model / Voice)",
    msgStartFirst: "Detailed player settings available after starting the game.",
    labelDuration: "Discussion Length (Turns)",
    labelSpeed: "Playback Speed (ms)",
    labelGodMode: "God Mode",
    descGodMode: "View all player roles and secret conversations (Wolf/Seer).",
    btnClose: "Close",
    action: "ACTION",
    secret: "SECRET",
    dead: "DEAD",
    unknown: "???"
  }
};