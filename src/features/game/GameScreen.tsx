// src/features/game/GameScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../app/LanguageContext';
import { getKeywordPowerDetails } from '../../core/rules/keywords';
import useAI from '../../core/ai/useAI';
import Card from '../../components/card/Card';
import GoalAnimation from '../../components/ui/GoalAnimation';
import ExplosionAnimation from '../../components/ui/ExplosionAnimation';
import BoostAnimation from '../../components/ui/BoostAnimation'; 
import { Player } from '../../types';
import { GAME_RULES } from '../../core/rules/settings';
import { 
    MdMenuBook, MdExitToApp, MdLayers, MdDeleteSweep, MdFlashOn, MdShield, 
    MdArrowUpward, MdMic, MdReplay, MdAssessment, MdClose
} from 'react-icons/md';

import LogsModal from './components/LogsModal';
import StatsModal from './components/StatsModal';
import InspectionModal, { GameActionType } from './components/InspectionModal';

const GameScreen: React.FC<{ onQuit: () => void }> = ({ onQuit }) => {
  const { t } = useLanguage();
  const { 
    gameState, 
    selectedAttackerId, setSelectedAttackerId,
    selectedBoostId, setSelectedBoostId,
    handlePlayCard, handleAttack, handleBlock, resumeGame, clearExplosion, clearBoost, handlePass
  } = useGameStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false); 
  const [logsCopied, setLogsCopied] = useState(false);
  
  const [inspectedCard, setInspectedCard] = useState<{ 
    card: Player, 
    side: 'player' | 'opponent',
    zone: 'hand' | 'field',
    idx: number
  } | null>(null);

  useAI();

  const isPlayerTurn = gameState?.turn === 'player';
  const mustBlock = gameState?.phase === 'ATTACK_DECLARED' && gameState?.turn === 'player';
  const attackerCard = mustBlock ? gameState?.opponent.field.find(c => c.instanceId === gameState.attackerInstanceId) : null;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (gameState?.winner) {
        timer = setTimeout(() => setShowResultOverlay(true), 1500);
    }
    return () => clearTimeout(timer);
  }, [gameState?.winner]);

  const copyLogs = useCallback(async () => {
    if (!gameState?.log) return;
    const text = gameState.log.map(l => t(l.key, l.params)).join('\n');
    let timer: ReturnType<typeof setTimeout>;
    const success = () => { 
      setLogsCopied(true); 
      timer = setTimeout(() => setLogsCopied(false), 2000); 
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try { await navigator.clipboard.writeText(text); success(); } catch (err) { fallbackCopy(text, success); }
    } else { fallbackCopy(text, success); }
    return () => { if (timer) clearTimeout(timer); };
  }, [gameState?.log, t]);

  const fallbackCopy = (text: string, onSuccess: () => void) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus(); textArea.select();
      try { if (document.execCommand('copy')) onSuccess(); } catch (err) {}
      document.body.removeChild(textArea);
  };

  const formatLogText = (key: string, params: any) => {
    const translatedParams = { ...params };
    if (params) {
        Object.keys(params).forEach(k => {
            const val = params[k];
            if (typeof val === 'string' && val.startsWith('logs.')) {
                translatedParams[k] = t(val);
            }
        });
    }

    let fullText = t(key, translatedParams);
    if (!params || !gameState) return <span>{fullText}</span>; 

    const sideYou = t('logs.side_you');
    const sideOpp = t('logs.side_opp');
    const parts = fullText.split(new RegExp(`(\\b${sideYou}\\b|\\b${sideOpp}\\b)`, 'g'));
    
    return (
      <span className="font-bold">
        {parts.map((part, i) => {
            let colorClass = 'text-white';
            const isPlayerLabel = part === sideYou;
            const isOpponentLabel = part === sideOpp;
            const isPlayerCard = gameState.player?.field.some(p => p.name === part) || gameState.player?.hand.some(p => p.name === part);
            const isOpponentCard = gameState.opponent?.field.some(p => p.name === part) || gameState.opponent?.hand.some(p => p.name === part);
            
            if (isPlayerLabel || isPlayerCard) colorClass = 'text-[#afff34]';
            else if (isOpponentLabel || isOpponentCard) colorClass = 'text-red-500';

            return <span key={i} className={colorClass}>{part}</span>;
        })}
      </span>
    );
  };

  const getVisualBonus = (card: Player, side: 'player' | 'opponent') => {
    if (!gameState || card.isFlipped) return 0;
    const sideData = gameState[side];
    const phase = gameState.phase;
    let isAttackingSide = (phase === 'MAIN' && gameState.turn === side) || (phase === 'ATTACK_DECLARED' && gameState.turn !== side);
    if (isAttackingSide) {
        return getKeywordPowerDetails(card, 'attacker', sideData.field).bonus;
    } else {
        let total = getKeywordPowerDetails(card, 'defender', sideData.field).bonus;
        if (side === 'player' && phase === 'ATTACK_DECLARED' && selectedBoostId) {
             const boostCard = gameState.player.hand.find(c => c.instanceId === selectedBoostId);
             if (boostCard) total += boostCard.effects.includes("BOOST2") ? 2 : 1;
        }
        return total;
    }
  };

  if (!gameState || !gameState.player || !gameState.opponent) return <div className="flex h-full items-center justify-center bg-black text-white">Loading...</div>;

  const onCardClick = (card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number) => {
    if (gameState.winner) return;
    setInspectedCard({ card, side, zone, idx });
  };

  const executeAction = (actionType: GameActionType) => {
      if (!inspectedCard) return;
      const { idx, card } = inspectedCard;
      switch (actionType) {
          case 'PLAY': handlePlayCard(idx); break;
          case 'ATTACK': handleAttack(card.instanceId!); break;
          case 'BLOCK': handleBlock(card.instanceId!, selectedBoostId); break;
          case 'BOOST': setSelectedBoostId(selectedBoostId === card.instanceId ? null : card.instanceId!); break;
      }
      setInspectedCard(null);
  };

  const inspectionActions = useMemo(() => {
      if (!inspectedCard || inspectedCard.side !== 'player') return [];
      const actions: { type: GameActionType; label: string; icon: React.ReactNode }[] = [];
      const { zone, card } = inspectedCard;
      const { phase, turn } = gameState;
      if (zone === 'hand' && phase === 'MAIN' && turn === 'player') actions.push({ type: 'PLAY', label: t('game.play') || 'JOUER', icon: <MdArrowUpward /> });
      if (zone === 'field' && phase === 'MAIN' && turn === 'player' && !card.hasActed && !card.isFlipped) actions.push({ type: 'ATTACK', label: t('game.attack') || 'ATTAQUER', icon: <MdArrowUpward /> });
      
      if (zone === 'field' && phase === 'ATTACK_DECLARED' && turn === 'player' && !card.isFlipped) {
          actions.push({ type: 'BLOCK', label: t('game.block') || 'BLOQUER', icon: <MdShield /> });
      }
      if (zone === 'hand' && phase === 'ATTACK_DECLARED' && turn === 'player') actions.push({ type: 'BOOST', label: t('game.boost') || 'BOOST', icon: <MdFlashOn /> });
      return actions;
  }, [inspectedCard, gameState, t]);

  const renderFieldSlot = (sideKey: 'player' | 'opponent', i: number) => {
    const side = gameState[sideKey];
    const card = side.field[i];
    const isAttacking = gameState.attackerInstanceId === card?.instanceId;
    const isSelected = sideKey === 'player' && selectedAttackerId === card?.instanceId;
    const canBlock = gameState.turn === sideKey && gameState.phase === 'ATTACK_DECLARED' && card && !card.isFlipped;
    return (
        <div key={`slot-${sideKey}-${i}`} className="flex-1 aspect-[2/3] max-w-[19%] bg-black/20 rounded-lg border border-white/5 flex items-center justify-center relative shadow-inner overflow-visible">
            {!card && <div className="w-1.5 h-1.5 rounded-full bg-white/5" />}
            <AnimatePresence>
                {card && (
                    <motion.div key={card.instanceId} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-10 p-0.5">
                        <Card 
                            data={card} isMomentum={card.isFlipped} 
                            isAttacking={isAttacking} isSelected={isSelected} canBlock={canBlock}
                            hasActed={card.hasActed} bonus={getVisualBonus(card, sideKey)} 
                            onClick={() => onCardClick(card, sideKey, 'field', i)}
                            teamColor={sideKey === 'player' ? '#afff34' : '#ef4444'} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

  const renderHUD = (sideKey: 'player' | 'opponent') => {
    const side = gameState[sideKey];
    const isPlayer = sideKey === 'player';
    const isCurrentTurn = gameState.turn === sideKey;
    const accentColor = isPlayer ? 'text-[#afff34]' : 'text-red-500';
    const borderColor = isCurrentTurn ? (isPlayer ? 'border-[#afff34]' : 'border-red-500') : 'border-white/10';
    const bgOpacity = isCurrentTurn ? 'bg-black/95' : 'bg-black/85';

    return (
      <motion.div layout className={`w-full flex items-center justify-between px-10 h-12 shrink-0 ${bgOpacity} backdrop-blur-3xl border-y transition-all duration-300 ${borderColor} ${isCurrentTurn ? (isPlayer ? 'shadow-[0_0_30px_rgba(175,255,52,0.15)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.15)]') : ''} z-20`}>
        <div className="flex items-center gap-4 min-w-[120px]">
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${accentColor}`}>{side.teamName}</span>
            {isCurrentTurn && <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className={`w-1.5 h-1.5 rounded-full ${isPlayer ? 'bg-[#afff34]' : 'bg-red-500'}`} />}
        </div>
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-6">
                <span className={`text-2xl md:text-3xl font-black tabular-nums leading-none ${isPlayer ? 'text-[#afff34]' : 'text-white'}`}>{side.score}</span>
             </div>
        </div>
        <div className="flex items-center gap-6 min-w-[120px] justify-end">
            <div className="flex items-center gap-2"><MdLayers className={`${accentColor} opacity-50`} size={16} /><span className="text-xs md:text-sm font-mono font-black text-white/80">{side.deck.length}</span></div>
            <div className="flex items-center gap-2"><MdDeleteSweep className="text-gray-600" size={16} /><span className="text-xs md:text-sm font-mono font-black text-gray-600">{side.discard.length}</span></div>
        </div>
      </motion.div>
    );
  };

  const commentaryBox = useMemo(() => {
    if (!gameState?.log || gameState.log.length === 0) return null;
    const lastLog = gameState.log[0];
    const isTurnPlayer = gameState.turn === 'player';
    const turnColor = isTurnPlayer ? 'border-[#afff34]/40' : 'border-red-500/40';
    return (
        <motion.div key={lastLog.id} initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0 }} className={`bg-black/90 px-8 py-3 rounded-2xl border-2 ${turnColor} backdrop-blur-2xl text-center flex items-center gap-4 max-w-[95%] relative overflow-hidden shadow-2xl`}>
            <MdMic className={isTurnPlayer ? 'text-[#afff34] animate-pulse' : 'text-red-500 animate-pulse'} size={24} />
            <div className="flex flex-col items-center min-w-[200px]">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isTurnPlayer ? 'text-[#afff34]' : 'text-red-500'}`}>{t('game.live')} • {isTurnPlayer ? t('selection.you') : t('selection.opponent')}</span>
                </div>
                <div className="text-xs md:text-sm text-white/90 leading-tight">{formatLogText(lastLog.key, lastLog.params)}</div>
            </div>
        </motion.div>
    );
  }, [gameState?.log, gameState?.turn, t]);

  return (
    <div className="relative w-full h-full bg-[#0c0c0c] overflow-hidden flex flex-col font-sans text-white">
      <ExplosionAnimation active={!!gameState.explosionEvent?.active} onComplete={clearExplosion} />
      <BoostAnimation active={!!gameState.boostEvent?.active} val={gameState.boostEvent?.val || 0} side={gameState.boostEvent?.side || 'player'} onComplete={clearBoost} />

      {mustBlock && (
        <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="absolute top-12 left-0 right-0 z-[100] bg-red-600 text-white py-2 text-center font-black uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center border-b border-white/20">
           <div className="flex items-center gap-4">
              <MdShield size={24} className="animate-pulse" />
              {t('game.must_block') || 'À VOUS DE BLOQUER !'}
              <div className="text-[10px] bg-black/20 px-2 py-0.5 rounded">{attackerCard?.name} ATTAQUE</div>
           </div>
           <div className="text-[9px] opacity-70 mt-1">{t('game.select_blocker_instruction')}</div>
        </motion.div>
      )}

      {renderHUD('opponent')}

      <div className="flex-1 relative flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a6d41] via-[#3a8d56] to-[#2a6d41] z-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-30 contrast-125"></div>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full"></div>
        </div>

        <div className="h-32 shrink-0 flex justify-center items-center px-8 relative z-40">
            <div className="flex gap-2 justify-center items-center w-full">
                {gameState.opponent.hand.map((_, i) => (
                    <div key={`opp-h-${i}`} className="relative w-[18%] max-w-[85px] aspect-[2/3] opacity-40">
                        <Card isHidden={true} teamColor="#ef4444" />
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 relative z-10">
            <div className="w-full flex justify-center gap-3">
                {Array.from({ length: GAME_RULES.FIELD_SIZE }).map((_, i) => renderFieldSlot('opponent', i))}
            </div>
        </div>

        <div className="h-20 shrink-0 flex items-center justify-center px-4 relative z-20">
             <AnimatePresence mode="wait">{commentaryBox}</AnimatePresence>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 relative z-10">
            <div className="w-full flex justify-center gap-3">
                {Array.from({ length: GAME_RULES.FIELD_SIZE }).map((_, i) => renderFieldSlot('player', i))}
            </div>
        </div>

        <div className="h-32 shrink-0 flex justify-center items-center px-8 relative z-40">
            <div className="flex gap-2 justify-center items-end w-full">
                <AnimatePresence>
                    {gameState.player.hand.map((c, i) => (
                        <motion.div key={c.instanceId} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="relative w-[18%] max-w-[85px] aspect-[2/3] hover:z-50 shadow-2xl">
                            <Card data={c} isSelected={selectedBoostId === c.instanceId} onClick={() => onCardClick(c, 'player', 'hand', i)} teamColor="#afff34" isInHand={true}/>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

      </div>

      {renderHUD('player')}

      <div className="h-14 bg-[#0a0a0a] border-t border-white/10 flex justify-between items-center px-10 shrink-0 relative z-[60]">
          <div className="flex gap-8">
              <button onClick={() => setShowLogModal(true)} className="text-white/40 hover:text-white transition-colors p-2"><MdMenuBook size={24} /></button>
              <button onClick={() => setShowStatsModal(true)} className="text-white/40 hover:text-white transition-colors p-2"><MdAssessment size={24} /></button>
          </div>
          
          {isPlayerTurn && (gameState.meneurActive || gameState.stoppageTimeAction === 'player' || gameState.phase === 'ATTACK_DECLARED') && (
              <button onClick={() => handlePass('player')} className="bg-[#afff34]/10 text-[#afff34] px-4 py-1.5 rounded-full border border-[#afff34]/30 animate-pulse flex items-center gap-2 font-black text-xs">
                {gameState.phase === 'ATTACK_DECLARED' ? (t('game.pass') || 'NE PAS BLOQUER') : (t('game.skip_meneur') || 'PASSER')} <MdReplay size={18} className="rotate-90" />
              </button>
          )}

          <button onClick={() => setShowQuitConfirm(true)} className="text-white/40 hover:text-red-500 transition-colors p-2"><MdExitToApp size={24} /></button>
      </div>

      <AnimatePresence>
          {showLogModal && <LogsModal key="logs-modal" isOpen={showLogModal} onClose={() => setShowLogModal(false)} logs={gameState.log} copyLogs={copyLogs} logsCopied={logsCopied} formatLogText={formatLogText} />}
          {showStatsModal && <StatsModal key="stats-modal" isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} player={gameState.player} opponent={gameState.opponent} goals={gameState.goals} />}
          {inspectedCard && <InspectionModal key="inspect-modal" inspectedCard={inspectedCard} onClose={() => setInspectedCard(null)} actions={inspectionActions} onAction={executeAction} />}
      </AnimatePresence>

       {gameState.goalEvent && gameState.goalEvent.type !== 'GAME_OVER' && !showResultOverlay && (
        <GoalAnimation 
          type={gameState.goalEvent.type} scorer={gameState.goalEvent.scorer} scorerName={gameState.goalEvent.scorerName} reason={gameState.goalEvent.reason}
          winner={gameState.winner} playerScore={gameState.player.score} opponentScore={gameState.opponent.score}
          teamNames={{ player: gameState.player.teamName, opponent: gameState.opponent.teamName }}
          onBackToMenu={resumeGame} 
        />
      )}

       <AnimatePresence>
        {showResultOverlay && gameState.winner && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6">
                <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-[#111] border-2 border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 max-w-md w-full relative">
                    <button onClick={() => setShowResultOverlay(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"><MdClose size={24} /></button>
                    <div className="text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{gameState.winner === 'player' ? '🏆' : gameState.winner === 'opponent' ? '💀' : '🤝'}</div>
                    <h2 className={`text-4xl font-black uppercase tracking-tighter text-center`}>{gameState.winner === 'player' ? t('game.win') : gameState.winner === 'opponent' ? t('game.lose') : t('game.draw')}</h2>
                    <div className="flex items-center gap-8 text-3xl font-black">
                        <div className="flex flex-col items-center"><span className="text-[#666] text-xs uppercase tracking-widest mb-1">{gameState.player.teamName}</span><span className="text-[#afff34]">{gameState.player.score}</span></div>
                        <span className="text-[#333]">-</span>
                        <div className="flex flex-col items-center"><span className="text-[#666] text-xs uppercase tracking-widest mb-1">{gameState.opponent.teamName}</span><span className="text-white">{gameState.opponent.score}</span></div>
                    </div>
                    <button onClick={onQuit} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ccc] transition-colors flex items-center justify-center gap-2 shadow-xl"><MdReplay size={24} /> {t('game.replay')}</button>
                </motion.div>
            </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
};

export default GameScreen;