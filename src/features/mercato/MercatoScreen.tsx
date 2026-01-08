// src/features/mercato/MercatoScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/useUserStore';
import { useGameStore } from '@/stores/useGameStore';
import { useLanguage } from '@/app/LanguageContext';
import { GAME_RULES } from '@/core/rules/settings';
import { generateOpponentDeck } from '@/utils/deckGenerator';
import Card from '@/components/card/Card';
import MercatoHeader from './components/MercatoHeader';
import { Player } from '@/types';

interface MercatoScreenProps {
  onBackToMenu: () => void;
}

const MercatoScreen: React.FC<MercatoScreenProps> = ({ onBackToMenu }) => {
  const { t } = useLanguage();
  const { user, saveActiveTeam } = useUserStore();
  const { initMatch } = useGameStore();
  
  const [team, setTeam] = useState<Player[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
      if (user.activeTeam && user.activeTeam.length > 0) {
          setTeam([...user.activeTeam]);
      }
  }, [user.activeTeam]);

  const currentCost = team.reduce((sum, p) => sum + p.cost, 0);
  const isReady = team.length === GAME_RULES.DECK_SIZE;

  const filteredPlayers = useMemo(() => {
    const coll = user.collection;
    if (filter === 'ALL') return coll;
    if (filter === 'GK') return coll.filter(p => p.pos === 'GK');
    if (filter === 'DEF') return coll.filter(p => ['CB','LB','RB','RWB','LWB'].includes(p.pos));
    if (filter === 'MID') return coll.filter(p => ['CM','CDM','CAM','LM','RM'].includes(p.pos));
    if (filter === 'FWD') return coll.filter(p => ['ST','CF','RW','LW'].includes(p.pos));
    return coll;
  }, [filter, user.collection]);

  const autoFillTeam = () => {
    let newTeam: Player[] = [];
    let currentBudget = 0;
    const gks = user.collection.filter(p => p.pos === 'GK').sort((a,b) => b.vaep - a.vaep);
    if (gks.length > 0) { newTeam.push(gks[0]); currentBudget += gks[0].cost; }
    const others = user.collection.filter(p => p.id !== (newTeam[0]?.id)).sort((a,b) => b.vaep - a.vaep);
    for (let p of others) {
        if (newTeam.length < GAME_RULES.DECK_SIZE && (currentBudget + p.cost <= GAME_RULES.BUDGET_CAP)) {
            newTeam.push(p);
            currentBudget += p.cost;
        }
    }
    setTeam(newTeam);
  };

  const togglePlayer = (p: Player) => {
    const isSelected = team.find(x => x.id === p.id);
    if (isSelected) setTeam(team.filter(x => x.id !== p.id));
    else {
      if (team.length >= GAME_RULES.DECK_SIZE) return; 
      if ((currentCost + p.cost) > GAME_RULES.BUDGET_CAP) return; 
      setTeam([...team, p]);
    }
  };

  const handleBack = () => {
      saveActiveTeam(team); 
      onBackToMenu();
  };

  const startMatch = () => {
    if (isReady) {
      saveActiveTeam(team);
      const opponentDeck = generateOpponentDeck([]); 
      initMatch(opponentDeck, null, team);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full w-full bg-[#050505] text-white overflow-hidden relative"
    >
      {/* Texture & Halos */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#afff34]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <MercatoHeader 
        currentCost={currentCost} teamLength={team.length} isReady={isReady} filter={filter}
        onFilterChange={setFilter} onAutoFill={autoFillTeam} onStartMatch={startMatch} onBack={handleBack}
      />
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
        <div className="grid grid-cols-3 gap-4 pb-24">
            {filteredPlayers.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-white/20">
                    <span className="text-6xl mb-6 opacity-50">∅</span>
                    <span className="font-black uppercase tracking-widest text-[10px]">{t('mercato.empty')}</span>
                </div>
            ) : (
                filteredPlayers.map((p, i) => {
                    const isSelected = team.some(x => x.id === p.id);
                    return (
                        <motion.div 
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`relative aspect-[2/3] transition-all duration-300 ${isSelected ? 'scale-95 brightness-110' : 'hover:scale-105'}`}
                        >
                            <Card 
                                data={p} 
                                onClick={() => togglePlayer(p)} 
                                isSelected={isSelected} 
                            />
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-[#afff34] rounded-full flex items-center justify-center text-black font-black text-xs shadow-xl z-30 border-2 border-black"
                                    >
                                        ✓
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default MercatoScreen;
