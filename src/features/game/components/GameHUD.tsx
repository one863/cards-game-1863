import React from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useLanguage } from '@/app/LanguageContext';
import { MdMenu } from 'react-icons/md';
import { THEME } from '@/styles/theme';

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
      {/* Scoreboard - Perfectly Centered Grid */}
      <div className="flex flex-col gap-2 pointer-events-auto mx-auto"> 
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-2 shadow-2xl min-w-[240px]">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-0">
                  
                  {/* Joueur */}
                  <div className="flex flex-col items-center justify-center">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 truncate max-w-[70px]">{t(playerTeamName)}</span>
                      <span 
                        className="text-3xl font-black leading-none drop-shadow-lg"
                        style={{ color: THEME.colors.player }}
                      >
                        {playerScore}
                      </span>
                  </div>

                  <div className="h-8 w-px bg-white/10 mx-6"></div>

                  {/* Adversaire */}
                  <div className="flex flex-col items-center justify-center">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 truncate max-w-[70px]">{t(opponentTeamName)}</span>
                      <span 
                        className="text-3xl font-black leading-none drop-shadow-lg"
                        style={{ color: THEME.colors.opponent }}
                      >
                        {opponentScore}
                      </span>
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