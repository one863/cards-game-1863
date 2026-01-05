import React from 'react';
import { useLanguage } from '../../../app/LanguageContext';

interface GameControlsProps {
  turn: 'player' | 'opponent';
  phase: 'MAIN' | 'ATTACK_DECLARED';
  selectedAttackerId: string | null;
  selectedBoostId: string | null;
  winner: string | null;
  onAttack: (id: string) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  turn, phase, selectedAttackerId, selectedBoostId, winner, onAttack 
}) => {
  const { t } = useLanguage();

  return (
    <div className="game-controls" style={{ height: '70px', padding: '10px', flexShrink: 0 }}>
       {turn === 'player' && phase === 'MAIN' ? (
         <div style={{ color: '#888', textAlign: 'center', width: '100%', fontSize: '0.9rem' }}>
            {selectedAttackerId ? (
                <button onClick={() => onAttack(selectedAttackerId)} className="control-btn" style={{background: 'var(--accent-color)', color: 'black', height: '100%', width:'100%', fontSize:'1.1rem'}}>
                    ⚔️ {t('game.attack')}
                </button>
            ) : t('game.instruction')}
         </div>
       ) : (
         <div style={{width: '100%', textAlign: 'center', color: '#fff', fontSize: '0.9rem'}}>
           {winner ? 'MATCH OVER' : (
               phase === 'ATTACK_DECLARED' ? (
                   <div style={{background:'rgba(220,20,60,0.2)', padding:'5px', borderRadius:'8px'}}>
                        ⚠️ {selectedBoostId ? t('game.use_boost') : t('game.must_block')}
                        <div style={{fontSize:'0.7rem', opacity:0.8}}>{selectedBoostId ? t('game.select_blocker_instruction') : t('game.select_boost_instruction')}</div>
                   </div>
               ) : t('game.opponent_turn')
           )}
         </div>
       )}
    </div>
  );
};

export default GameControls;
