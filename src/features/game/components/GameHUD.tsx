import React from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useLanguage } from '@/app/LanguageContext';
import { MdMenu } from 'react-icons/md';

interface GameHUDProps {
  onMenuClick: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ onMenuClick }) => {
  const { t } = useLanguage();
  const gameState = useGameStore(state => state.gameState);
  
  const playerScore = gameState?.player.score || 0;
  const opponentScore = gameState?.opponent.score || 0;
  const playerTeamName = gameState?.player.teamName || 'YOU';
  const opponentTeamName = gameState?.opponent.teamName || 'OPP';

  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
      {/* Scoreboard - Centré et Sans Chrono */}
      <div className="flex flex-col gap-2 pointer-events-auto mx-auto"> 
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-2 shadow-2xl min-w-[200px]">
              <div className="flex justify-between items-center w-full">
                  
                  {/* Joueur */}
                  <div className="flex flex-col items-center">
                      <span className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-1">{t(playerTeamName)}</span>
                      <span className="text-3xl font-black text-[#afff34] leading-none drop-shadow-lg">{playerScore}</span>
                  </div>

                  <div className="h-8 w-px bg-white/10 mx-4"></div>

                  {/* Adversaire */}
                  <div className="flex flex-col items-center">
                      <span className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-1">{t(opponentTeamName)}</span>
                      <span className="text-3xl font-black text-red-500 leading-none drop-shadow-lg">{opponentScore}</span>
                  </div>

              </div>
          </div>
      </div>

      {/* Menu Button */}
      <button 
          onClick={onMenuClick}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95 shadow-xl absolute right-4 top-4"
      >
          <MdMenu size={24} />
      </button>
    </div>
  );
};

export default GameHUD;