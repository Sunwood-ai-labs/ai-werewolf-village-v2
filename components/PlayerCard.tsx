import React from 'react';
import { Player, ROLE_EMOJIS, ROLE_LABELS, ROLE_LABELS_EN, Role, Language } from '../types';
import { MODELS, UI_STRINGS } from '../constants';

interface PlayerCardProps {
  player: Player;
  isGodMode: boolean;
  isSpeaking: boolean;
  language: Language;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isGodMode, isSpeaking, language }) => {
  const isDead = !player.isAlive;
  const labels = language === 'en' ? ROLE_LABELS_EN : ROLE_LABELS;
  const t = UI_STRINGS[language];

  // Determine what to show for role
  // Show role if: God Mode is on, OR player is dead, OR it's me (conceptually, but here we are observer)
  // For this "Simulation" style, God Mode toggles visibility.
  const showRole = isGodMode || isDead;

  // Resolve model name
  const modelInfo = MODELS.find(m => m.id === player.model);
  const displayModelName = modelInfo ? modelInfo.name.split(' (')[0] : 'Unknown Model';

  return (
    <div 
      className={`
        relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300
        ${isSpeaking ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105 z-10' : 'border-slate-700 shadow-lg'}
        ${isDead ? 'opacity-50 grayscale bg-slate-800' : 'bg-slate-800'}
      `}
    >
      <div className="relative">
        <img 
          src={player.avatar} 
          alt={player.name} 
          className={`
            w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2
            ${isDead ? 'border-red-900' : 'border-indigo-400'}
          `} 
        />
        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <span className="text-xl font-bold text-red-500 font-sans">{t.dead}</span>
          </div>
        )}
        {showRole && (
          <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1 border border-slate-600 text-lg" title={labels[player.role]}>
            {ROLE_EMOJIS[player.role]}
          </div>
        )}
      </div>

      <div className="mt-2 text-center w-full">
        <h3 className="font-bold text-slate-200 text-sm sm:text-base">{player.name}</h3>
        
        {/* Model Name Display */}
        <div className="text-[10px] text-slate-500 truncate max-w-[100px] mx-auto mb-1">
            {displayModelName}
        </div>

        {showRole ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            player.role === Role.WEREWOLF ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'
          }`}>
            {labels[player.role]}
          </span>
        ) : (
          <span className="text-xs text-slate-500">{t.unknown}</span>
        )}
      </div>
      
      {/* Speech Bubble Arrow if speaking */}
      {isSpeaking && (
         <div className="absolute -top-4 text-yellow-400 animate-bounce">
            💬
         </div>
      )}
    </div>
  );
};