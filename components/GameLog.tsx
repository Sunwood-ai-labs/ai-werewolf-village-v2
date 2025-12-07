import React, { useEffect, useRef, memo, useState } from 'react';
import { LogEntry, Role } from '../types';
import { GM_ID, GM_NAME } from '../constants';

interface GameLogProps {
  logs: LogEntry[];
  players: any[]; 
  activeSpeakerId: string | null;
}

type TabType = 'ALL' | 'PUBLIC' | 'WOLF' | 'SEER';

// Memoized Log Item to improve performance with long lists
const LogItem = memo(({ log, player }: { log: LogEntry, player: any }) => {
  const isGM = log.speakerId === GM_ID;
  const isPrivate = !!log.visibleTo && log.visibleTo.length > 0;

  if (isGM) {
    return (
       <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-500 my-4">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-2xl filter drop-shadow-md">🎭</span>
             <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">{GM_NAME}</span>
          </div>
          <div className={`
            text-sm px-6 py-2 rounded-full border text-center shadow-lg max-w-[95%]
            ${log.type === 'death' ? 'bg-red-950/60 border-red-800 text-red-200' : 
              log.type === 'action' ? 'bg-indigo-950/60 border-indigo-800 text-indigo-200' :
              'bg-slate-800/90 border-slate-600 text-slate-200'}
            ${isPrivate ? 'border-amber-500/50 bg-amber-900/20' : ''}
          `}>
            {isPrivate && <span className="mr-2 text-amber-500" title="秘密情報">🔒</span>}
            {log.content}
          </div>
       </div>
    );
  }

  return (
    <div className={`flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 group`}>
       <div className="flex flex-col items-center flex-shrink-0">
         <img 
           src={player?.avatar} 
           alt="avatar" 
           className="w-10 h-10 rounded-full border border-slate-600 object-cover shadow-sm group-hover:border-indigo-400 transition-colors"
         />
       </div>
       <div className="flex flex-col max-w-[85%]">
         <div className="flex items-baseline gap-2 mb-1 ml-1">
            <span className="text-xs text-slate-400 font-bold">{player?.name}</span>
            {log.type === 'action' && <span className="text-[10px] text-indigo-400 border border-indigo-900 px-1 rounded">ACTION</span>}
            {isPrivate && <span className="text-[10px] text-amber-500 border border-amber-900 px-1 rounded">SECRET</span>}
         </div>
         <div className={`
            px-4 py-2.5 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-md border 
            ${log.type === 'action' ? 'bg-slate-800/50 text-slate-400 border-slate-700/50 italic' : 'bg-slate-800 text-slate-200 border-slate-700/50'}
            ${isPrivate ? 'border-amber-500/30' : ''}
         `}>
           {log.content}
         </div>
       </div>
    </div>
  );
});

export const GameLog: React.FC<GameLogProps> = ({ logs, players, activeSpeakerId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  // Helper to determine visibility for tabs
  // In a real game, this would depend on the local user's role. 
  // Here, we assume "God Mode" (All) or specific filtered views.
  const filteredLogs = logs.filter(log => {
    const wolves = players.filter(p => p.role === Role.WEREWOLF).map(p => p.id);
    const seers = players.filter(p => p.role === Role.SEER).map(p => p.id);
    
    // Logic for filtering
    const isPublic = !log.visibleTo || log.visibleTo.length === 0;
    const isVisibleToWolf = log.visibleTo?.some(id => wolves.includes(id));
    const isVisibleToSeer = log.visibleTo?.some(id => seers.includes(id));

    switch (activeTab) {
        case 'ALL': return true; // Show everything
        case 'PUBLIC': return isPublic;
        case 'WOLF': return isVisibleToWolf;
        case 'SEER': return isVisibleToSeer;
        default: return true;
    }
  });

  // Auto-scroll logic
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs.length, activeSpeakerId, activeTab]);

  const activeSpeaker = activeSpeakerId ? players.find(p => p.id === activeSpeakerId) : null;

  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-lg border border-slate-700 overflow-hidden backdrop-blur-sm shadow-inner">
      
      {/* Header & Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 font-bold text-slate-300 shadow-md z-10 shrink-0">
        <div className="p-3 flex justify-between items-center">
            <span className="flex items-center gap-2">📜 ログ</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">{filteredLogs.length} 件</span>
        </div>
        
        {/* Channel Tabs */}
        <div className="flex px-2 gap-1 overflow-x-auto">
            {[
                { id: 'ALL', label: '全て', icon: '👁️' },
                { id: 'PUBLIC', label: '公開', icon: '🗣️' },
                { id: 'WOLF', label: '人狼', icon: '🐺', color: 'text-red-400' },
                { id: 'SEER', label: '占い', icon: '🔮', color: 'text-purple-400' }
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                        flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors
                        ${activeTab === tab.id 
                            ? 'bg-slate-900/50 text-white border-t border-x border-slate-700' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}
                        ${tab.color && activeTab === tab.id ? tab.color : ''}
                    `}
                >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-900/50 scroll-smooth">
        {logs.length === 0 && (
          <div className="text-center text-slate-500 italic mt-10">
            村は静まり返っています... <br/> ゲームマスターが準備をしています。
          </div>
        )}

        {/* Empty state for tabs */}
        {logs.length > 0 && filteredLogs.length === 0 && (
            <div className="text-center text-slate-600 italic mt-10 text-sm">
                このチャンネルにはまだメッセージがありません。
            </div>
        )}
        
        {filteredLogs.map((log) => (
            <LogItem key={log.id} log={log} player={players.find(p => p.id === log.speakerId)} />
        ))}

        {/* Typing Indicator - Show only on relevant tabs */}
        {activeSpeaker && activeTab === 'ALL' && (
           <div className="flex gap-3 animate-pulse opacity-80">
              <div className="flex flex-col items-center flex-shrink-0">
                 <img 
                   src={activeSpeaker.avatar} 
                   alt="avatar" 
                   className="w-10 h-10 rounded-full border-2 border-indigo-500/50 object-cover grayscale"
                 />
              </div>
               <div className="flex flex-col max-w-[85%]">
                 <span className="text-xs text-slate-400 mb-1 ml-1">{activeSpeaker.name}</span>
                 <div className="bg-slate-800/40 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none text-sm border border-slate-700/50 flex items-center gap-1.5 w-fit">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   <span className="text-xs ml-2 text-indigo-300/70">思考中...</span>
                 </div>
               </div>
           </div>
        )}

        <div ref={bottomRef} className="h-4 shrink-0" />
      </div>
    </div>
  );
};