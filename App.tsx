import React, { useState, useEffect } from 'react';
import { GamePhase } from './types';
import { PlayerCard } from './components/PlayerCard';
import { GameLog } from './components/GameLog';
import { useGameMaster } from './hooks/useGameMaster';
import { SettingsModal } from './components/SettingsModal';
import { MODELS } from './constants';

const App: React.FC = () => {
  // UI Local State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGodMode, setIsGodMode] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(2000); 
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [openRouterKey, setOpenRouterKey] = useState<string>('');

  // Use the new Game Master hook
  const { 
      state, 
      selectedModel, 
      setSelectedModel, 
      setAllPlayerModels,
      updatePlayerModel,
      roleCounts,
      setRoleCounts,
      initGame, 
      proceed, 
      setDiscussionRounds,
      isTtsEnabled,
      setIsTtsEnabled
  } = useGameMaster(openRouterKey);
  
  const { players, phase, logs, dayCount, winner, activeSpeakerId, currentDiscussionRound, maxDiscussionRounds } = state;

  // Auto-play trigger
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (autoPlay && !isPaused && phase !== GamePhase.GAME_OVER && phase !== GamePhase.SETUP) {
       timer = setTimeout(() => {
           proceed();
       }, gameSpeed);
    }
    return () => clearTimeout(timer);
  }, [autoPlay, isPaused, phase, gameSpeed, proceed]);


  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="https://raw.githubusercontent.com/Sunwood-ai-labs/image-box/refs/heads/main/AI-Werewolf-Village_header.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-50 blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/70"></div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        updatePlayerModel={updatePlayerModel}
        setAllPlayerModels={setAllPlayerModels}
        players={players}
        maxDiscussionRounds={maxDiscussionRounds}
        setDiscussionRounds={setDiscussionRounds}
        gameSpeed={gameSpeed}
        setGameSpeed={setGameSpeed}
        isGodMode={isGodMode}
        setIsGodMode={setIsGodMode}
        openRouterKey={openRouterKey}
        setOpenRouterKey={setOpenRouterKey}
        roleCounts={roleCounts}
        setRoleCounts={setRoleCounts}
        isTtsEnabled={isTtsEnabled}
        setIsTtsEnabled={setIsTtsEnabled}
      />

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        
        {/* Status Bar */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 shadow-xl z-20 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            
            <div className="flex items-center gap-3">
               <div className="text-2xl filter drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">🌕</div>
               <h1 className="font-horror text-2xl text-indigo-400 tracking-widest font-bold drop-shadow-sm">AI 人狼村</h1>
            </div>

            <div className="flex items-center gap-4 text-sm bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-800">
               <div className="flex flex-col items-end">
                  <span className="font-bold text-amber-500 uppercase tracking-widest text-[8px]">フェーズ</span>
                  <span className="text-sm font-bold">
                      {phase === GamePhase.DAY_DISCUSSION && "昼：議論"}
                      {phase === GamePhase.DAY_VOTE && "夕方：投票"}
                      {phase === GamePhase.NIGHT_ACTION && "夜：行動"}
                      {phase === GamePhase.GAME_OVER && "終了"}
                      {phase === GamePhase.SETUP && "準備中"}
                  </span>
               </div>
               {phase === GamePhase.DAY_DISCUSSION && (
                   <div className="flex flex-col items-end animate-in fade-in">
                      <span className="font-bold text-slate-500 uppercase tracking-widest text-[8px]">ラウンド</span>
                      <span className="text-sm font-mono text-indigo-300">{currentDiscussionRound} / {maxDiscussionRounds}</span>
                   </div>
               )}
               <div className="h-6 w-px bg-slate-700 mx-1"></div>
               <div className="flex flex-col items-end">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[8px]">日数</span>
                  <span className="text-sm font-mono">{dayCount}日目</span>
               </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          
          {/* Left: Game Board */}
          <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
             
             {/* Controls */}
             <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex flex-wrap gap-4 items-center justify-between backdrop-blur-md shrink-0 shadow-lg">
                <div className="flex gap-2">
                   {phase === GamePhase.SETUP ? (
                      <button onClick={initGame} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
                         ゲーム開始
                      </button>
                   ) : (
                      <>
                        <button onClick={() => setAutoPlay(!autoPlay)} className={`px-4 py-2 rounded-lg font-bold border transition-colors ${autoPlay ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}>
                           {autoPlay ? '⏸ 自動再生 ON' : '▶ 自動再生 OFF'}
                        </button>
                        <button onClick={() => proceed()} disabled={autoPlay || phase === GamePhase.GAME_OVER} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold border border-slate-600 transition-colors">
                           次へ進む
                        </button>
                        <button onClick={() => initGame()} className="text-red-400 hover:text-red-300 px-4 py-2 text-sm">
                           リセット
                        </button>
                      </>
                   )}
                </div>

                <div className="flex items-center">
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors"
                    >
                      <span>⚙️ 設定</span>
                    </button>
                </div>
             </div>

             {/* Visualization Area */}
             <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-8 flex items-center justify-center relative min-h-[400px] shrink-0 backdrop-blur-sm shadow-xl">
                
                {players.length === 0 ? (
                    <div className="text-center space-y-4">
                        <div className="text-7xl animate-bounce filter drop-shadow-lg">🐺</div>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-slate-200">AI人狼村へようこそ</h2>
                          <p className="text-slate-400 max-w-md mx-auto">
                            <span className="text-indigo-400 font-bold border-b border-indigo-400/30 pb-0.5">ゲーム開始</span> をクリックして、<br/>
                            AIたちによる命がけの推理ゲームを始めましょう。
                          </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                        {players.map(player => (
                            <PlayerCard 
                              key={player.id} 
                              player={player} 
                              isGodMode={isGodMode || phase === GamePhase.GAME_OVER} 
                              isSpeaking={player.id === activeSpeakerId}
                            />
                        ))}
                    </div>
                )}

                {/* Phase Indicator Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none opacity-60">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${phase === GamePhase.DAY_DISCUSSION ? 'bg-yellow-400 shadow-[0_0_10px_orange] scale-125' : 'bg-slate-700'}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${phase === GamePhase.DAY_VOTE ? 'bg-red-500 shadow-[0_0_10px_red] scale-125' : 'bg-slate-700'}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${phase === GamePhase.NIGHT_ACTION ? 'bg-indigo-500 shadow-[0_0_10px_indigo] scale-125' : 'bg-slate-700'}`}></div>
                </div>

                {winner && (
                    <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center rounded-2xl backdrop-blur-md animate-in fade-in duration-700 p-8 text-center">
                        <div className="mb-6 text-6xl">{winner === 'WEREWOLVES' ? '🐺' : '🧑‍🌾'}</div>
                        <h2 className={`text-4xl sm:text-6xl font-horror mb-4 font-bold tracking-wider ${winner === 'WEREWOLVES' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]'}`}>
                            {winner === 'WEREWOLVES' ? 'WEREWOLVES WIN' : 'VILLAGERS WIN'}
                        </h2>
                        <p className="text-slate-300 mb-8 text-xl font-bold">
                            {winner === 'WEREWOLVES' ? '人狼チームの勝利' : '村人チームの勝利'}
                        </p>
                        <button onClick={initGame} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform hover:bg-indigo-500 shadow-lg shadow-indigo-900/50">
                            もう一度プレイ
                        </button>
                    </div>
                )}
             </div>
          </div>

          {/* Right: Logs - Flex column to fill remaining height */}
          <div className="lg:col-span-1 flex flex-col h-full overflow-hidden shadow-2xl rounded-lg">
             <GameLog logs={logs} players={players} activeSpeakerId={activeSpeakerId} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;