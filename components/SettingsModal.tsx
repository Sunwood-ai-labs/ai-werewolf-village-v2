import React from 'react';
import { MODELS } from '../constants';
import { Player, ROLE_LABELS, ROLE_EMOJIS, Role } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  updatePlayerModel?: (id: string, model: string) => void;
  setAllPlayerModels?: (model: string) => void;
  players?: Player[];
  maxDiscussionRounds: number;
  setDiscussionRounds: (val: number) => void;
  gameSpeed: number;
  setGameSpeed: (val: number) => void;
  isGodMode: boolean;
  setIsGodMode: (val: boolean) => void;
  openRouterKey: string;
  setOpenRouterKey: (val: string) => void;
  roleCounts?: Record<Role, number>;
  setRoleCounts?: (counts: Record<Role, number>) => void;
  isTtsEnabled?: boolean;
  setIsTtsEnabled?: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose,
  selectedModel, setSelectedModel,
  updatePlayerModel, setAllPlayerModels, players = [],
  maxDiscussionRounds, setDiscussionRounds,
  gameSpeed, setGameSpeed,
  isGodMode, setIsGodMode,
  openRouterKey, setOpenRouterKey,
  roleCounts, setRoleCounts,
  isTtsEnabled, setIsTtsEnabled
}) => {
  if (!isOpen) return null;

  const totalPlayers = roleCounts 
    ? Object.values(roleCounts).reduce((a, b) => a + b, 0)
    : 0;

  const handleRoleCountChange = (role: Role, delta: number) => {
    if (!roleCounts || !setRoleCounts) return;
    const current = roleCounts[role];
    const next = Math.max(0, current + delta);
    setRoleCounts({ ...roleCounts, [role]: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            ⚙️ ゲーム設定
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* API Settings */}
          <section className="space-y-3">
             <div className="flex justify-between items-center">
               <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">API 設定</h3>
               <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">オプション</span>
             </div>
             <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <label className="text-xs text-slate-400">OpenRouter API Key (Claude/GPT等を使用する場合)</label>
                <input 
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-700"
                />
             </div>
          </section>

          <hr className="border-slate-800" />
          
          {/* Audio Settings */}
          {setIsTtsEnabled && (
             <section className="space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">音声設定</h3>
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isTtsEnabled} 
                            onChange={(e) => setIsTtsEnabled(e.target.checked)} 
                            className="w-5 h-5 rounded bg-slate-800 border-slate-600 accent-indigo-500"
                        />
                        <div>
                            <span className="block text-sm font-bold text-slate-200">🗣️ テキスト読み上げ (Gemini TTS)</span>
                            <span className="block text-xs text-slate-500">
                                議論の内容をAI音声で読み上げます。プレイヤーごとに声色が変わります。<br/>
                                <span className="text-yellow-500">※API使用量が増加し、再生に時間がかかる場合があります。</span>
                            </span>
                        </div>
                    </label>
                </div>
             </section>
          )}

           <hr className="border-slate-800" />

          {/* Role Config */}
          {roleCounts && setRoleCounts && (
              <section className="space-y-3">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">配役・人数設定</h3>
                    <span className="text-xs font-mono bg-indigo-900 text-indigo-100 px-2 py-1 rounded">合計: {totalPlayers}人</span>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(Role).map(role => (
                        <div key={role} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-700">
                             <div className="flex items-center gap-2">
                                 <span className="text-xl">{ROLE_EMOJIS[role]}</span>
                                 <span className="text-sm font-bold text-slate-300">{ROLE_LABELS[role]}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <button 
                                    onClick={() => handleRoleCountChange(role, -1)}
                                    className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 disabled:opacity-30"
                                    disabled={roleCounts[role] <= 0}
                                 >
                                    -
                                 </button>
                                 <span className="w-4 text-center text-sm font-mono">{roleCounts[role]}</span>
                                 <button 
                                    onClick={() => handleRoleCountChange(role, 1)}
                                    className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300"
                                 >
                                    +
                                 </button>
                             </div>
                        </div>
                    ))}
                 </div>
                 <p className="text-[10px] text-slate-500 text-right">※ 変更は次回の「ゲーム開始」または「リセット」時に反映されます。</p>
              </section>
          )}

          <hr className="border-slate-800" />

          {/* Model Settings */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">モデル設定</h3>
            
            {/* Global / GM Model */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">ゲームマスター / デフォルトモデル</label>
                <div className="flex gap-2">
                    <select 
                      value={selectedModel} 
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-2 text-sm outline-none"
                    >
                      {MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    {setAllPlayerModels && (
                        <button 
                            onClick={() => setAllPlayerModels(selectedModel)}
                            className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded transition-colors whitespace-nowrap"
                        >
                            全員に適用
                        </button>
                    )}
                </div>
            </div>

            {/* Individual Players */}
            {players.length > 0 && updatePlayerModel ? (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block">プレイヤー別 設定 (モデル / 声)</label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {players.map(player => (
                            <div key={player.id} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded border border-slate-700">
                                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-slate-600" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-200 truncate">{player.name}</span>
                                        {isGodMode && (
                                            <span className="text-[10px] bg-slate-700 px-1.5 rounded text-slate-300">
                                                {ROLE_EMOJIS[player.role]} {ROLE_LABELS[player.role]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-slate-500">
                                        <span className="truncate max-w-[80px]">{MODELS.find(m => m.id === player.model)?.name.split(' ')[0] || player.model}</span>
                                        {player.voiceName && <span className="text-indigo-400">🔊 {player.voiceName}</span>}
                                    </div>
                                </div>
                                <select 
                                  value={player.model} 
                                  onChange={(e) => updatePlayerModel(player.id, e.target.value)}
                                  className="w-32 sm:w-40 bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded px-2 py-1 outline-none"
                                >
                                  {MODELS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
                                  ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center p-4 border border-dashed border-slate-800 rounded text-slate-500 text-sm">
                    ゲームを開始すると、プレイヤーごとの詳細設定が可能になります。
                </div>
            )}
          </section>

          <hr className="border-slate-800" />

          {/* Game Parameters */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">議論の長さ (ターン数)</label>
              <div className="flex items-center gap-3">
                 <input 
                   type="range" min="1" max="10" step="1" 
                   value={maxDiscussionRounds} 
                   onChange={(e) => setDiscussionRounds(Number(e.target.value))} 
                   className="w-full accent-indigo-500"
                 />
                 <span className="text-lg font-mono text-indigo-400 w-8 text-right">{maxDiscussionRounds}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">再生速度 (ms)</label>
              <div className="flex items-center gap-3">
                 <input 
                   type="range" min="500" max="5000" step="500" 
                   value={gameSpeed} 
                   onChange={(e) => setGameSpeed(Number(e.target.value))} 
                   className="w-full accent-indigo-500"
                 />
                 <span className="text-sm font-mono text-slate-400 w-12 text-right">{gameSpeed}</span>
              </div>
            </div>
          </section>

          {/* God Mode */}
           <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isGodMode} 
                    onChange={(e) => setIsGodMode(e.target.checked)} 
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 accent-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-200">神の視点モード</span>
                    <span className="block text-xs text-slate-500">全てのプレイヤーの役職と、人狼・占い師の秘密の会話を閲覧できます。</span>
                  </div>
              </label>
           </div>

        </div>

        <div className="bg-slate-800 p-4 border-t border-slate-700 text-right shrink-0">
           <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all">
             閉じる
           </button>
        </div>

      </div>
    </div>
  );
};