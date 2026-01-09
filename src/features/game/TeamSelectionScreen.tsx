import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useLanguage } from '@/app/LanguageContext';
import NATIONAL_TEAMS from '@/data/national_teams.json';
import { Player } from '@/types';
import { MdClose, MdSportsSoccer, MdFlashOn } from 'react-icons/md';

interface TeamSelectionProps {
  onBack: () => void;
}

const TeamSelectionScreen: React.FC<TeamSelectionProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { initMatch, quitMatch, gameState } = useGameStore();
  
  const teams = useMemo(() => {
    return NATIONAL_TEAMS.slice(0, 12).sort((a, b) => {
        const nameA = t(`teams.${a.id}`).toLowerCase();
        const nameB = t(`teams.${b.id}`).toLowerCase();
        return nameA.localeCompare(nameB);
    });
  }, [t]);
  
  const [playerChoice, setPlayerChoice] = useState(teams[0].id);
  const [opponentChoice, setOpponentChoice] = useState(teams[1].id);

  const handleStart = () => {
    // RÈGLE : Si un match est déjà en cours, on l'archive dans les sauvegardes avant d'en créer un nouveau
    if (gameState) {
        quitMatch(true); 
    }

    let playerDeck: Player[] = [];
    let opponentDeck: Player[] = [];
    let pName = "";
    let oName = "";

    const pTeam = teams.find(t => t.id === playerChoice);
    if (pTeam) {
        playerDeck = pTeam.players.map(p => ({
            ...p,
            fullName: p.name,
            nat: pTeam.id,
            rating: 0,
            effects: p.effects || []
        })) as Player[];
        pName = t(`teams.${pTeam.id}`);
    }

    const oTeam = teams.find(t => t.id === opponentChoice);
    if (oTeam) {
        opponentDeck = oTeam.players.map(p => ({
            ...p,
            fullName: p.name,
            nat: oTeam.id,
            rating: 0,
            effects: p.effects || []
        })) as Player[];
        oName = t(`teams.${oTeam.id}`);
    }

    initMatch(opponentDeck, playerDeck, [], [], { player: pName, opponent: oName });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="w-full h-full bg-[#080808] text-white flex flex-col items-center overflow-hidden relative"
    >
      <div className="w-full max-w-2xl flex justify-between items-center px-6 py-6 z-10 shrink-0">
        <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <MdFlashOn className="text-[#afff34]" />
                {t('selection.title')}
            </h1>
            <div className="w-16 h-1 bg-[#afff34] rounded-full mt-0.5"></div>
        </div>
        <button onClick={onBack} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <MdClose size={20} className="text-white/70" />
        </button>
      </div>

      <div className="flex-1 w-full max-w-2xl flex flex-col gap-6 overflow-y-auto px-6 custom-scrollbar pb-40 pt-2">
        <motion.div variants={itemVariants} className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-red-500 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-10 h-px bg-red-500/30"></span>
                    {t('selection.opponent')}
                </h2>
                <MdSportsSoccer className="text-red-500/30" size={18} />
            </div>
            <div className="grid grid-cols-3 gap-3 p-1">
                {teams.map(team => (
                    <button 
                        key={team.id} 
                        onClick={() => setOpponentChoice(team.id)} 
                        className={`
                            h-17 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all relative border-2 flex flex-col items-center justify-center gap-1.5
                            ${opponentChoice === team.id 
                                ? 'bg-red-500/10 border-red-500 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10 text-white' 
                                : 'bg-[#111] border-white/5 text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300'}
                        `}
                    >
                        <div className="w-10 h-1.5 rounded-full mb-1" style={{ backgroundColor: team.color }}></div>
                        <span className="truncate w-full px-1 text-center">{t(`teams.${team.id}`)}</span>
                    </button>
                ))}
            </div>
        </motion.div>

        <div className="flex items-center gap-3 py-1 opacity-20">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
            <span className="text-sm font-black italic">VS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>

        <motion.div variants={itemVariants} className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[#afff34] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <MdSportsSoccer className="text-[#afff34]/30" size={18} />
                    {t('selection.you')}
                    <span className="w-10 h-px bg-[#afff34]/30"></span>
                </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 p-1">
                {teams.map(team => (
                    <button 
                        key={team.id} 
                        onClick={() => setPlayerChoice(team.id)} 
                        className={`
                            h-17 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all relative border-2 flex flex-col items-center justify-center gap-1.5
                            ${playerChoice === team.id 
                                ? 'bg-[#afff34]/10 border-[#afff34] scale-105 shadow-[0_0_20px_rgba(175,255,52,0.3)] z-10 text-white' 
                                : 'bg-[#111] border-white/5 text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300'}
                        `}
                    >
                        <div className="w-10 h-1.5 rounded-full mb-1" style={{ backgroundColor: team.color }}></div>
                        <span className="truncate w-full px-1 text-center">{t(`teams.${team.id}`)}</span>
                    </button>
                ))}
            </div>
        </motion.div>
      </div>

      {/* Footer - Ajout de pointer-events-auto et z-index élevé pour garantir l'interaction */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-[100] flex justify-center pointer-events-none">
          <motion.button 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-lg bg-[#afff34] text-black text-xl font-black uppercase tracking-tighter py-4 rounded-xl shadow-[0_10px_40px_rgba(175,255,52,0.4)] transition-all flex items-center justify-center gap-3 border-4 border-black group pointer-events-auto" 
            onClick={(e) => {
                e.stopPropagation();
                handleStart();
            }}
          >
            {t('selection.kickoff')} ➜
          </motion.button>
      </div>
    </motion.div>
  );
};

export default TeamSelectionScreen;