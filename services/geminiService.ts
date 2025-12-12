import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { Player, Role, GamePhase, LogEntry, ROLE_LABELS, ROLE_LABELS_EN, Language } from "../types";

// Helper to sanitize text
const cleanText = (text: string) => text.replace(/`/g, '').trim();

// Retry helper
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

// --- Audio Utilities for TTS ---

// Base64 decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// PCM Audio Decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let audioContext: AudioContext | null = null;

export const playRawAudio = async (base64Audio: string): Promise<void> => {
  if (!base64Audio) return;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const bytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(bytes, audioContext);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start(0);
    });
  } catch (error) {
    console.error("Audio Playback Error:", error);
    return Promise.resolve(); // Fail gracefully
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return undefined;
  }
};


// Strategic Advice based on Role and Day
const getStrategicAdvice = (role: Role, day: number, phase: GamePhase, lang: Language): string => {
  if (lang === 'en') {
      const common = "Act logically and do not get too emotional.";
      switch (role) {
        case Role.VILLAGER:
          return `
            [Villager Strategy]
            - Identify players who are hiding info or contradicting themselves.
            - Staying too silent makes you suspicious; speak enough to prove innocence.
            - If two Seers appear, judge carefully who is lying.
          `;
        case Role.SEER:
          if (day === 1) {
            return `
              [Seer Strategy: CRITICAL]
              - You MUST reveal (Come Out) that you are the Seer early on Day 1 or Day 2.
              - Clearly state who you divined and the result (White=Human, Black=Werewolf).
              - Hiding your role hurts the village.
            `;
          }
          return `
            [Seer Strategy]
            - Report last night's divination results immediately.
            - If there is a counter-Seer (fake), argue logically why you are the real one.
          `;
        case Role.BODYGUARD:
          return `
            [Bodyguard Strategy: CRITICAL]
            - NEVER reveal that you are the Bodyguard. If you do, wolves will kill you.
            - Act like a normal Villager in discussions.
            - At night, prioritize protecting the person you believe is the real Seer.
          `;
        case Role.WEREWOLF:
          return `
            [Werewolf Strategy]
            - Never let them know you are a wolf.
            - Pretend to be a villager and use plausible reasoning to mislead others.
            - If the real Seer reveals themselves, it is a valid tactic to lie and claim YOU are the Seer (Counter-CO) to cause confusion.
            - Don't defend other wolves too obviously. Sometimes voting for a partner (bussing) is necessary.
          `;
        default: return common;
      }
  } else {
    // JAPANESE
      const common = "感情的にならず、論理的に振る舞ってください。";
      switch (role) {
        case Role.VILLAGER:
          return `
            【村人の戦略】
            - 情報を隠している人物や、発言に矛盾がある人物を探してください。
            - 寡黙な人物は疑われやすいので、適度に発言して潔白をアピールしてください。
            - 占い師が二人出た場合は、両方の真偽を慎重に見極めてください。
          `;
        case Role.SEER:
          if (day === 1) {
            return `
              【占い師の戦略：重要】
              - 初日または2日目の早い段階で、必ず「自分が占い師である」とカミングアウト（CO）してください。
              - 誰を占ってどういう結果だったか（白＝人間、黒＝人狼）を明確に伝えてください。
              - 潜伏（COしないこと）は、村の不利益になります。
            `;
          }
          return `
            【占い師の戦略】
            - 昨晩の占い結果を速やかに報告してください。
            - 対抗（偽の占い師）がいる場合は、自分が本物であることを論理的に主張してください。
          `;
        case Role.BODYGUARD:
          return `
            【騎士の戦略：最重要】
            - **絶対に自分が騎士であることを明かさない（カミングアウトしない）でください**。正体がバレると人狼に襲撃されます。
            - 議論ではただの村人として振る舞ってください。
            - 夜の護衛は、本物だと思われる占い師を優先して守ってください。
          `;
        case Role.WEREWOLF:
          return `
            【人狼の戦略】
            - 自分が人狼であることは絶対に悟られないでください。
            - 村人のふりをして、もっともらしい推理でミスリードを誘ってください。
            - 占い師が本物を名乗り出た場合、あえて自分も「私が占い師だ」と嘘をついて（対抗CO）、場を混乱させるのも有効な戦略です。
            - 仲間（他の人狼）を露骨にかばうと怪しまれます。時には仲間に投票するライン切りも必要です。
          `;
        default: return common;
      }
  }
};

const getRoleDescription = (role: Role, lang: Language) => {
  if (lang === 'en') {
      switch (role) {
        case Role.WEREWOLF: return "You are a [WEREWOLF]. Goal: Deceive humans and kill them all.";
        case Role.SEER: return "You are the [SEER]. Goal: Find Werewolves. You can divine one person every night.";
        case Role.BODYGUARD: return "You are the [BODYGUARD]. Goal: Protect villagers. You can guard one person every night.";
        default: return "You are a [VILLAGER]. No special powers. Deduce who the wolves are.";
      }
  } else {
      switch (role) {
        case Role.WEREWOLF: return "あなたは【人狼】です。目的：正体がバレないように振る舞い、村人陣営を敗北させること。";
        case Role.SEER: return "あなたは【占い師】です。目的：人狼を見つけること。毎晩一人を占えます。";
        case Role.BODYGUARD: return "あなたは【騎士】です。目的：村人を守ること。毎晩一人を護衛できます。";
        default: return "あなたは【村人】です。特別な能力はありません。議論で人狼を探してください。";
      }
  }
};

const buildContext = (activePlayer: Player, players: Player[], logs: LogEntry[], currentPhase: GamePhase, currentDay: number, lang: Language) => {
  const recentLogs = logs.slice(-30);
  
  const visibleLogs = recentLogs
    .filter(l => !l.visibleTo || l.visibleTo.includes(activePlayer.id))
    .map(l => {
      const isNight = l.phase === GamePhase.NIGHT_ACTION;
      const dayLabel = lang === 'en' ? `[Day ${l.day}/${isNight ? 'Night' : 'Day'}]` : `[${l.day}日目/${isNight ? '夜' : '昼'}]`;
      
      if (l.type === 'system' || l.type === 'death') return `${dayLabel} [GM]: ${l.content}`;
      
      const speaker = players.find(p => p.id === l.speakerId);
      const privateMark = l.visibleTo ? (lang === 'en' ? "[SECRET INFO] " : "【(重要) あなただけの秘密情報】") : "";
      return `${dayLabel} [${speaker?.name || 'Unknown'}]: ${privateMark} ${l.content}`;
    });

  const alivePlayersList = players.filter(p => p.isAlive).map(p => {
    let info = `ID:${p.id} Name:${p.name}`;
    if (activePlayer.role === Role.WEREWOLF && p.role === Role.WEREWOLF && p.id !== activePlayer.id) {
        info += lang === 'en' ? " (Ally Wolf)" : " (味方の人狼)";
    }
    return info;
  }).join('\n');

  if (lang === 'en') {
      return `
        [Current Situation]
        Day: ${currentDay}
        Phase: ${currentPhase}
        
        [Survivors]
        ${alivePlayersList}

        [Recent Logs (Public + Your Memory)]
        ${visibleLogs.join('\n')}
      `;
  } else {
      return `
        【現在の状況】
        日数: ${currentDay}日目
        フェーズ: ${currentPhase}
        
        【生存者リスト】
        ${alivePlayersList}

        【直近の会話ログ（公開情報 + あなたの記憶）】
        ${visibleLogs.join('\n')}
      `;
  }
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// 1. Generate Discussion (XML)
export const generateDiscussion = async (
  activePlayer: Player,
  players: Player[],
  logs: LogEntry[],
  currentPhase: GamePhase,
  currentDay: number,
  modelName: string = 'gemini-2.5-flash',
  openRouterKey?: string,
  lang: Language = 'ja'
): Promise<string> => {
  
  const strategicAdvice = getStrategicAdvice(activePlayer.role, currentDay, currentPhase, lang);
  const roleLabel = lang === 'en' ? ROLE_LABELS_EN[activePlayer.role] : ROLE_LABELS[activePlayer.role];

  let systemInstruction = '';
  let prompt = '';

  if (lang === 'en') {
    systemInstruction = `
      This is a fictional "Werewolf" game simulation.
      Act as player "${activePlayer.name}".
      
      [Character Info]
      Role: ${roleLabel}
      Personality: ${activePlayer.personality}
      ${getRoleDescription(activePlayer.role, lang)}

      [Strategy & Guidelines]
      ${strategicAdvice}
      
      [Instructions]
      - Phase: Day Discussion.
      - Read recent logs carefully. Keep the conversation flowing.
      - If asked a question, answer it.
      - Speak in short, conversational English (1-2 sentences). No long speeches.
      - Output MUST be in XML format.
      
      [Output Template]
      <speech>
      Put your speech content here.
      </speech>
    `;
    prompt = `
        ${buildContext(activePlayer, players, logs, currentPhase, currentDay, lang)}
        
        Based on the logs, speak as ${activePlayer.name}.
        Follow your strategy as a ${roleLabel}.
    `;
  } else {
    // JAPANESE
    systemInstruction = `
      これはフィクションの「人狼ゲーム」のシミュレーションです。
      あなたはプレイヤー「${activePlayer.name}」として振る舞ってください。
      
      【キャラクター情報】
      役職: ${roleLabel}
      性格: ${activePlayer.personality}
      ${getRoleDescription(activePlayer.role, lang)}

      【戦略・行動指針】
      ${strategicAdvice}
      
      【指示】
      - フェーズ: 昼の議論
      - 他のプレイヤーの直近の発言（ログ）をよく読み、会話の流れを止めないでください。
      - 誰かが質問している場合は答えてください。
      - 1〜2文の短い日本語の口語で、簡潔に話してください。長演説は禁止です。
      - あなたの出力はシステムによって解析されます。必ずXML形式で出力してください。
      
      【出力テンプレート】
      <speech>
      ここに発言内容を入れる
      </speech>
    `;
    prompt = `
      ${buildContext(activePlayer, players, logs, currentPhase, currentDay, lang)}
      
      上記のログを踏まえ、${activePlayer.name}として発言してください。
      戦略ガイドラインに従い、${roleLabel}として最適な振る舞いを心がけてください。
    `;
  }

  // --- OPENROUTER HANDLING ---
  if (modelName.startsWith('openrouter/')) {
      const realModel = modelName.replace('openrouter/', '');
      const apiKey = openRouterKey || process.env.OPENROUTER_API_KEY || process.env.API_KEY; 
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": realModel,
          "messages": [
            {"role": "system", "content": systemInstruction},
            {"role": "user", "content": prompt},
          ]
        })
      });
      
      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "";
      const match = rawText.match(/<speech>([\s\S]*?)<\/speech>/);
      return match && match[1] ? cleanText(match[1]) : cleanText(rawText);
  }

  // --- GEMINI HANDLING ---
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const operation = async () => {
    const response = await ai.models.generateContent({
      model: modelName, 
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        safetySettings: SAFETY_SETTINGS,
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
       throw new Error(`Gemini Stopped: ${candidate.finishReason}`);
    }

    const rawText = response.text || "";
    const match = rawText.match(/<speech>([\s\S]*?)<\/speech>/);
    if (match && match[1]) {
        return cleanText(match[1]);
    }
    return cleanText(rawText);
  };

  try {
    return await withRetry(operation);
  } catch (error) {
    console.error("Discussion Error:", error);
    throw error;
  }
};

// 2. Generate Action (Vote / Night Ability)
export const generateAction = async (
  activePlayer: Player,
  players: Player[],
  logs: LogEntry[],
  phase: GamePhase,
  currentDay: number,
  modelName: string = 'gemini-2.5-flash',
  openRouterKey?: string,
  lang: Language = 'ja'
): Promise<{ targetId: string; reasoning: string }> => {
  
  const validTargets = players.filter(p => p.isAlive && p.id !== activePlayer.id).map(p => p.id);
  
  let taskDescription = '';
  let template = '';
  
  if (phase === GamePhase.DAY_VOTE) {
      taskDescription = lang === 'en' 
        ? 'Choose one player to execute. Pick the most suspicious person based on the discussion. Provide a short reason.'
        : '処刑投票の対象を1名選んでください。直前の議論の内容に基づき、最も怪しい人物を選んでください。理由も簡潔に述べてください。';
      template = `<vote><target>TARGET_ID</target><reason>REASON</reason></vote>`;
  } else if (phase === GamePhase.NIGHT_ACTION) {
      switch (activePlayer.role) {
          case Role.WEREWOLF:
              taskDescription = lang === 'en'
                ? 'Choose a victim to attack tonight. Targeting Seers or sharp villagers is standard strategy.'
                : '今晩襲撃して排除する対象を1名選んでください。占い師や、鋭い村人を狙うのが定石です。';
              template = `<attack><target>TARGET_ID</target><reason>REASON</reason></attack>`;
              break;
          case Role.SEER:
              taskDescription = lang === 'en'
                ? 'Choose a player to divine (inspect). Check someone whose role is unknown (Gray).'
                : '今晩占う対象を1名選んでください。白黒はっきりしていない人物（グレー）を占ってください。';
              template = `<divine><target>TARGET_ID</target><reason>REASON</reason></divine>`;
              break;
          case Role.BODYGUARD:
              taskDescription = lang === 'en'
                ? 'Choose a player to protect tonight. Protect important roles like the Seer. You cannot protect yourself.'
                : '今晩護衛する対象を1名選んでください。占い師などの重要人物を守ってください。自分は守れません。';
              template = `<guard><target>TARGET_ID</target><reason>REASON</reason></guard>`;
              break;
          default:
              return { targetId: "NONE", reasoning: "No Action" };
      }
  }

  const strategicAdvice = getStrategicAdvice(activePlayer.role, currentDay, phase, lang);
  const roleLabel = lang === 'en' ? ROLE_LABELS_EN[activePlayer.role] : ROLE_LABELS[activePlayer.role];
  
  const systemInstruction = `
    You are "${activePlayer.name}".
    Role: ${roleLabel}
    
    [Valid Target IDs]
    ${JSON.stringify(validTargets)}
    
    [Strategy]
    ${strategicAdvice}
    
    [Task]
    ${taskDescription}
    
    Output ONLY XML template.
    ${template}
  `;

  const context = buildContext(activePlayer, players, logs, phase, currentDay, lang);
  const prompt = `${context}\n\nDecide your action.`;

  // --- OPENROUTER HANDLING ---
  if (modelName.startsWith('openrouter/')) {
    const realModel = modelName.replace('openrouter/', '');
    const apiKey = openRouterKey || process.env.OPENROUTER_API_KEY || process.env.API_KEY; 
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        "model": realModel,
        "messages": [
            {"role": "system", "content": systemInstruction},
            {"role": "user", "content": prompt},
          ]
      })
    });
    
    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    const targetMatch = rawText.match(/<target>(.*?)<\/target>/);
    const reasonMatch = rawText.match(/<reason>([\s\S]*?)<\/reason>/);

    if (targetMatch && reasonMatch) {
        let tid = cleanText(targetMatch[1]);
        if (!validTargets.includes(tid)) tid = validTargets[0]; // fallback
        return { targetId: tid, reasoning: cleanText(reasonMatch[1]) };
    }
    return { targetId: validTargets[0], reasoning: "Parser Error: Random" };
  }

  // --- GEMINI HANDLING ---
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const operation = async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        safetySettings: SAFETY_SETTINGS,
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Stopped: ${candidate.finishReason}`);
    }
    const rawText = response.text || "";
    
    const targetMatch = rawText.match(/<target>(.*?)<\/target>/);
    const reasonMatch = rawText.match(/<reason>([\s\S]*?)<\/reason>/);

    if (targetMatch && reasonMatch) {
        const result = {
            targetId: cleanText(targetMatch[1]),
            reasoning: cleanText(reasonMatch[1])
        };
        if (!validTargets.includes(result.targetId)) {
            const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
            return { targetId: randomTarget, reasoning: `(Auto-fix ID) ${result.reasoning}` };
        }
        return result;
    }
    throw new Error("Invalid XML response");
  };

  try {
    return await withRetry(operation);
  } catch (error) {
    console.error("Action Error:", error);
    const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
    return { targetId: randomTarget, reasoning: `(Error Random)` };
  }
};