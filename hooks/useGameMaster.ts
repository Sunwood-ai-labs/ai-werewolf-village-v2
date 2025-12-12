import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GamePhase, GameState, Player, Role, LogEntry, ROLE_LABELS } from '../types';
import { DEFAULT_ROLE_COUNTS, NAMES, AVATARS, PERSONALITIES, GM_ID, GM_NAME, MODELS, VOICE_NAMES } from '../constants';
import { generateDiscussion, generateAction, generateSpeech, playRawAudio } from '../services/geminiService';

const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

export const useGameMaster = (openRouterKey?: string) => {
  const [state, setState] = useState<GameState>({
    players: [],
    phase: GamePhase.SETUP,
    dayCount: 0,
    turnIndex: 0,
    logs: [],
    winner: null,
    activeSpeakerId: null,
    currentDiscussionRound: 1,
    maxDiscussionRounds: 3,
  });

  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
  const [roleCounts, setRoleCounts] = useState<Record<Role, number>>(DEFAULT_ROLE_COUNTS);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(false);
  const processingRef = useRef(false);

  // --- GM Helpers ---
  
  const addLog = (content: string, type: LogEntry['type'] = 'system', speakerId: string = GM_ID, visibleTo?: string[]) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, { 
          id: uuidv4(), 
          phase: prev.phase, 
          day: prev.dayCount, 
          content, 
          type, 
          speakerId, 
          visibleTo 
      }]
    }));
  };

  const updatePlayers = (fn: (players: Player[]) => Player[]) => {
    setState(prev => ({ ...prev, players: fn(prev.players) }));
  };

  const setDiscussionRounds = (rounds: number) => {
      setState(prev => ({ ...prev, maxDiscussionRounds: rounds }));
  };
  
  // Updates a single player's model
  const updatePlayerModel = (playerId: string, modelId: string) => {
    updatePlayers(current => current.map(p => p.id === playerId ? { ...p, model: modelId } : p));
  };

  // Updates the global default AND all existing players
  const setAllPlayerModels = (modelId: string) => {
      setSelectedModel(modelId);
      updatePlayers(current => current.map(p => ({ ...p, model: modelId })));
  };

  const checkWinCondition = (currentPlayers: Player[]) => {
    const aliveWolves = currentPlayers.filter(p => p.isAlive && p.role === Role.WEREWOLF).length;
    const aliveHumans = currentPlayers.filter(p => p.isAlive && p.role !== Role.WEREWOLF).length;

    if (aliveWolves === 0) {
      setState(prev => ({ ...prev, winner: 'VILLAGERS', phase: GamePhase.GAME_OVER }));
      addLog("人狼は全滅しました。村人陣営の勝利です！", 'system');
      return true;
    }
    if (aliveWolves >= aliveHumans) {
      setState(prev => ({ ...prev, winner: 'WEREWOLVES', phase: GamePhase.GAME_OVER }));
      addLog("人狼の数が村人を上回りました。人狼陣営の勝利です！", 'system');
      return true;
    }
    return false;
  };

  // --- Phase Logic ---

  const initGame = () => {
    // Construct roles array based on counts
    const roles: Role[] = [];
    Object.entries(roleCounts).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        roles.push(role as Role);
      }
    });

    if (roles.length === 0) {
        addLog("プレイヤー人数が0人です。設定を確認してください。", 'system');
        return;
    }

    const shuffledRoles = shuffle(roles);
    
    // Prepare metadata pools (expand if necessary)
    let availableNames = [...NAMES];
    let availableAvatars = [...AVATARS];
    let availablePersonalities = [...PERSONALITIES];

    const newPlayers: Player[] = shuffledRoles.map((role, idx) => {
      // Handle insufficient metadata gracefully
      const name = availableNames.length > 0 
        ? availableNames.splice(Math.floor(Math.random() * availableNames.length), 1)[0]
        : `プレイヤー${idx + 1}`;
      
      const avatar = availableAvatars.length > 0
        ? availableAvatars.splice(Math.floor(Math.random() * availableAvatars.length), 1)[0]
        : `https://ui-avatars.com/api/?name=${name}&background=random`;

      const personality = availablePersonalities.length > 0
        ? availablePersonalities.splice(Math.floor(Math.random() * availablePersonalities.length), 1)[0]
        : "普通。特徴はない。";
      
      // Assign random voice
      const voiceName = VOICE_NAMES[Math.floor(Math.random() * VOICE_NAMES.length)];

      return {
        id: uuidv4(),
        name,
        role,
        isAlive: true,
        avatar,
        personality,
        model: selectedModel, // Assign current global/GM model to the player
        voiceName,
      };
    });

    setState(prev => ({
      ...prev,
      players: newPlayers,
      phase: GamePhase.DAY_DISCUSSION,
      dayCount: 1,
      turnIndex: 0,
      currentDiscussionRound: 1,
      logs: [{ id: uuidv4(), phase: GamePhase.SETUP, day: 1, content: `これより、人狼ゲームを開始します。参加者は${newPlayers.length}名です。各自、役職を確認してください。`, type: "system", speakerId: GM_ID }],
      winner: null,
      activeSpeakerId: null,
    }));
  };

  const handleDayDiscussion = async () => {
    const { players, logs, turnIndex, dayCount, currentDiscussionRound, maxDiscussionRounds } = state;
    const alivePlayers = players.filter(p => p.isAlive);

    // End of round check
    if (turnIndex >= alivePlayers.length) {
        if (currentDiscussionRound < maxDiscussionRounds) {
            // Start next round
            setState(prev => ({ ...prev, currentDiscussionRound: prev.currentDiscussionRound + 1, turnIndex: 0 }));
            addLog(`議論は続きます（ラウンド ${currentDiscussionRound + 1}/${maxDiscussionRounds}）`, 'system');
            return;
        } else {
            // End discussion
            setState(prev => ({ ...prev, phase: GamePhase.DAY_VOTE, turnIndex: 0 }));
            addLog("議論終了です。これより処刑投票に移ります。", 'system');
            return;
        }
    }

    const speaker = alivePlayers[turnIndex];
    setState(prev => ({ ...prev, activeSpeakerId: speaker.id }));

    try {
      // Use the player's specific model
      const text = await generateDiscussion(speaker, players, logs, GamePhase.DAY_DISCUSSION, dayCount, speaker.model, openRouterKey);
      addLog(text, 'chat', speaker.id);
      
      // --- TTS TRIGGER ---
      if (isTtsEnabled) {
          const audioData = await generateSpeech(text, speaker.voiceName);
          if (audioData) {
              await playRawAudio(audioData);
          }
      }

    } catch (e: any) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      addLog(`（エラー発生: ${errorMsg}）`, 'system', speaker.id);
    }

    setState(prev => ({ ...prev, activeSpeakerId: null, turnIndex: prev.turnIndex + 1 }));
  };

  const handleDayVote = async () => {
    const { players, logs, turnIndex, dayCount } = state;
    const alivePlayers = players.filter(p => p.isAlive);

    if (turnIndex >= alivePlayers.length) {
      // Tally votes
      const votes: Record<string, number> = {};
      let maxVotes = 0;
      let executedPlayerId: string | null = null;
      let tie = false;

      players.filter(p => p.isAlive).forEach(p => {
        if (p.voteTargetId) {
          votes[p.voteTargetId] = (votes[p.voteTargetId] || 0) + 1;
        }
      });

      Object.entries(votes).forEach(([targetId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          executedPlayerId = targetId;
          tie = false;
        } else if (count === maxVotes) {
          tie = true;
        }
      });

      if (executedPlayerId && !tie) {
        const victim = players.find(p => p.id === executedPlayerId);
        if (victim) {
          addLog(`投票の結果、${victim.name} が処刑されます。`, 'death');
          const updatedPlayers = players.map(p => 
            p.id === executedPlayerId ? { ...p, isAlive: false } : p
          );
          updatePlayers(() => updatedPlayers);
          if (checkWinCondition(updatedPlayers)) return;
        }
      } else {
        addLog("投票が割れたため、本日の処刑は見送られました。", 'system');
      }

      setState(prev => ({ 
        ...prev, 
        phase: GamePhase.NIGHT_ACTION, 
        turnIndex: 0 
      }));
      addLog("恐ろしい夜がやってきます... 能力者は行動してください。", 'system');
      
      updatePlayers(curr => curr.map(p => ({ ...p, voteTargetId: undefined, protected: false })));
      return;
    }

    const voter = alivePlayers[turnIndex];
    setState(prev => ({ ...prev, activeSpeakerId: voter.id }));

    try {
      // Use voter's specific model
      const action = await generateAction(voter, players, logs, GamePhase.DAY_VOTE, dayCount, voter.model, openRouterKey);
      const target = players.find(p => p.id === action.targetId);
      addLog(`${target?.name} に投票。理由: ${action.reasoning}`, 'action', voter.id);
      
      updatePlayers(curr => curr.map(p => p.id === voter.id ? { ...p, voteTargetId: action.targetId } : p));
    } catch (e: any) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      addLog(`（投票エラー: ${errorMsg}）`, 'system', voter.id);
    }

    setState(prev => ({ ...prev, activeSpeakerId: null, turnIndex: prev.turnIndex + 1 }));
  };

  const handleNightAction = async () => {
    const { players, logs, turnIndex, dayCount } = state;
    const actingPlayers = players.filter(p => 
      p.isAlive && (p.role === Role.WEREWOLF || p.role === Role.SEER || p.role === Role.BODYGUARD)
    );

    if (turnIndex >= actingPlayers.length) {
      // Resolve Night
      const wolfTargets = players.filter(p => p.role === Role.WEREWOLF && p.isAlive && p.voteTargetId).map(p => p.voteTargetId);
      const bgTargets = players.filter(p => p.role === Role.BODYGUARD && p.isAlive && p.voteTargetId).map(p => p.voteTargetId);
      
      let killTargetId: string | null = null;
      if (wolfTargets.length > 0) {
        killTargetId = wolfTargets.sort((a,b) => 
          wolfTargets.filter(v => v===a).length - wolfTargets.filter(v => v===b).length
        ).pop() || null;
      }

      let currentPlayers = [...players];

      if (killTargetId) {
        const isProtected = bgTargets.includes(killTargetId);
        const victim = players.find(p => p.id === killTargetId);
        
        if (victim && !isProtected) {
          currentPlayers = currentPlayers.map(p => p.id === killTargetId ? { ...p, isAlive: false } : p);
          addLog(`昨晩、${victim.name} が無惨な姿で発見されました...`, 'death');
        } else if (victim && isProtected) {
          addLog(`昨晩、${victim.name} は何者かに襲われましたが、一命を取り留めました！`, 'action');
        }
      } else {
        addLog(`昨晩は誰も襲われませんでした。平和な朝です。`, 'system');
      }

      updatePlayers(() => currentPlayers);
      if (checkWinCondition(currentPlayers)) return;

      setState(prev => ({ 
        ...prev, 
        phase: GamePhase.DAY_DISCUSSION, 
        dayCount: prev.dayCount + 1, 
        turnIndex: 0,
        currentDiscussionRound: 1, // Reset discussion round for next day
      }));
      addLog(`${dayCount + 1} 日目の朝です。議論を開始してください。`, 'system');
      
      updatePlayers(curr => curr.map(p => ({ ...p, voteTargetId: undefined })));
      return;
    }

    const actor = actingPlayers[turnIndex];
    setState(prev => ({ ...prev, activeSpeakerId: actor.id }));

    try {
      // Use actor's specific model
      const action = await generateAction(actor, players, logs, GamePhase.NIGHT_ACTION, dayCount, actor.model, openRouterKey);
      
      updatePlayers(curr => curr.map(p => p.id === actor.id ? { ...p, voteTargetId: action.targetId } : p));
      
      // LOG VISIBILITY LOGIC FOR PRIVATE CHANNELS
      const target = players.find(p => p.id === action.targetId);

      if (actor.role === Role.SEER) {
        const isWolf = target?.role === Role.WEREWOLF;
        // Visible only to Seer
        addLog(`(占い結果) ${target?.name} は ${isWolf ? '【黒(人狼)】' : '【白(人間)】'} でした。`, 'action', actor.id, [actor.id]);
      } else if (actor.role === Role.WEREWOLF) {
        // Visible only to Wolves
        const allWolves = players.filter(p => p.role === Role.WEREWOLF).map(p => p.id);
        addLog(`(襲撃セット) ${target?.name} を狙います。`, 'action', actor.id, allWolves);
      } else if (actor.role === Role.BODYGUARD) {
        // Visible only to Bodyguard
        addLog(`(護衛セット) ${target?.name} を守ります。`, 'action', actor.id, [actor.id]);
      }
      
    } catch (e: any) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      addLog(`（行動エラー: ${errorMsg}）`, 'system', actor.id);
    }

    setState(prev => ({ ...prev, activeSpeakerId: null, turnIndex: prev.turnIndex + 1 }));
  };

  const proceed = useCallback(async () => {
    if (processingRef.current || state.phase === GamePhase.GAME_OVER || state.phase === GamePhase.SETUP) return;
    processingRef.current = true;
    
    switch (state.phase) {
      case GamePhase.DAY_DISCUSSION:
        await handleDayDiscussion();
        break;
      case GamePhase.DAY_VOTE:
        await handleDayVote();
        break;
      case GamePhase.NIGHT_ACTION:
        await handleNightAction();
        break;
    }
    processingRef.current = false;
  }, [state, openRouterKey, isTtsEnabled]); 

  return {
    state,
    selectedModel,
    setSelectedModel, // Updates global default
    setAllPlayerModels, // Updates global + all players
    updatePlayerModel, // Updates single player
    roleCounts, // Expose role counts
    setRoleCounts, // Expose setter
    initGame,
    proceed,
    setDiscussionRounds,
    isTtsEnabled,
    setIsTtsEnabled
  };
};