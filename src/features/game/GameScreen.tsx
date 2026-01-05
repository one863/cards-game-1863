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
import { Player } from '../../types';
import { GAME_RULES } from '../../core/rules/settings';
import { 
    MdMenuBook, MdExitToApp, MdClose, MdContentCopy, 
    MdLayers, MdDeleteSweep, MdCheck, MdFlashOn, MdShield, 
    MdArrowUpward, MdVisibility, MdMic, MdReplay, MdArrowBack,
    MdAssessment, MdSportsKabaddi 
} from 'react-icons/md';

// Import des modaux extraits et types
import LogsModal from './components/LogsModal';
import StatsModal from './components/StatsModal';
import InspectionModal, { GameActionType } from './components/InspectionModal';

const GameScreen: React.FC<{ onQuit: () => void }> = ({ onQuit }) => {
  const { t } = useLanguage();
  const { 
    gameState, 
    selectedAttackerId, setSelectedAttackerId,
    selectedBoostId, setSelectedBoostId,
    handlePlayCard, handleAttack, handleBlock, resumeGame, clearExplosion, handlePass
  } = useGameStore();

  const [persistentLog, setPersistentLog] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [boostAnim, setBoostAnim] = useState<{ val: number, side: string } | null>(null);
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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (gameState?.log && gameState.log.length > 0) {
      const lastEvent = gameState.log[0];
      if (lastEvent.key === 'logs.use_boost') {
          setBoostAnim({ val: lastEvent.params.val, side: gameState.turn });
          timer = setTimeout(() => setBoostAnim(null), 2000);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState?.log, gameState?.turn]);

  useEffect(() => {
    if (gameState?.log && gameState.log.length > 0) {
      const lastEvent = gameState.log[0];
      setPersistentLog(t(lastEvent.key, lastEvent.params));
    }
  }, [gameState?.log, t]);

  useEffect(() => {
    if (gameState?.winner) setShowResultOverlay(true);
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
    let text = t(key, params);
    if (!params) return <span>{text}</span>;
    const parts = text.split(/(\{[^}]+\})/g);
    return (
      <span className="font-bold">
        {parts.map((part, i) => {
          if (part.startsWith('{') && part.endsWith('}')) {
              const paramKey = part.slice(1, -1);
              const name = params[paramKey];
              if (!name) return <span key={i}>{part}</span>;
              
              const isPlayerTeam = name === gameState.player.teamName;
              const isOpponentTeam = name === gameState.opponent.teamName;
              
              const isPlayerCard = gameState.player.field.some(p => p.name === name) || 
                                   gameState.player.hand.some(p => p.name === name) || 
                                   gameState.player.discard.some(p => p.name === name);
              
              const isOpponentCard = gameState.opponent.field.some(p => p.name === name) || 
                                     gameState.opponent.hand.some(p => p.name === name) || 
                                     gameState.opponent.discard.some(p => p.name === name);
              
              let colorClass = 'text-white';
              if (isPlayerTeam || isPlayerCard) colorClass = 'text-[#afff34]';
              else if (isOpponentTeam || isOpponentCard) colorClass = 'text-red-500';
              
              return <span key={i} className={colorClass}>{name}</span>;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const getVisualBonus = (card: Player, side: 'player' | 'opponent') => {
    if (!gameState || card.isFlipped) return 0;
    
    const sideData = gameState[side];
    const phase = gameState.phase;

    let isAttackingSide = false;
    if (phase === 'MAIN') {
        isAttackingSide = (gameState.turn === side);
    } else if (phase === 'ATTACK_DECLARED') {
        isAttackingSide = (gameState.turn !== side);
    }

    if (isAttackingSide) {
        const details = getKeywordPowerDetails(card, 'attacker', sideData.field);
        return details.bonus;
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
          case 'PLAY':
              handlePlayCard(idx);
              break;
          case 'ATTACK':
              handleAttack(card.instanceId!);
              break;
          case 'BLOCK':
              handleBlock(card.instanceId!, selectedBoostId);
              break;
          case 'BOOST':
              setSelectedBoostId(selectedBoostId === card.instanceId ? null : card.instanceId!);
              break;
      }
      setInspectedCard(null);
  };

  const inspectionActions = useMemo(() => {
      if (!inspectedCard || inspectedCard.side !== 'player') return [];
      const actions: { type: GameActionType; label: string; icon: React.ReactNode }[] = [];
      const { zone, card } = inspectedCard;
      const { phase, turn } = gameState;

      if (zone === 'hand' && phase === 'MAIN' && turn === 'player') {
          actions.push({ type: 'PLAY', label: t('game.play') || 'JOUER', icon: <MdArrowUpward /> });
      }
      if (zone === 'field' && phase === 'MAIN' && turn === 'player' && !card.hasActed && !card.isFlipped) {
          actions.push({ type: 'ATTACK', label: t('game.attack') || 'ATTAQUER', icon: <MdArrowUpward /> });
      }
      if (zone === 'field' && phase === 'ATTACK_DECLARED' && turn === 'player' && !card.hasActed && !card.isFlipped) {
          actions.push({ type: 'BLOCK', label: t('game.block') || 'BLOQUER', icon: <MdShield /> });
      }
      if (zone === 'hand' && phase === 'ATTACK_DECLARED' && turn === 'player') {
          actions.push({ type: 'BOOST', label: t('game.boost') || 'BOOST', icon: <MdFlashOn /> });
      }
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
    
    return (
      <motion.div 
        layout 
        className={`
            flex items-center gap-6 px-6 py-2 bg-black/60 backdrop-blur-xl border-2 transition-all duration-300
            ${isCurrentTurn 
                ? (isPlayer ? 'border-[#afff34] shadow-[0_0_20px_rgba(175,255,52,0.3)] scale-110' : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-110') 
                : (isPlayer ? 'border-[#afff34]/20 opacity-60' : 'border-red-500/20 opacity-60')} 
            rounded-full z-20
        `}
      >
        <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${isPlayer ? 'text-[#afff34]' : 'text-red-500'}`}>{side.teamName}</span>
        <div className="flex items-center justify-center bg-black/40 px-3 py-0.5 rounded-lg border border-white/5">
             <span className={`text-2xl font-black leading-none ${isPlayer ? 'text-[#afff34]' : 'text-white'}`}>{side.score}</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="flex items-center gap-2">
          <MdLayers className={isPlayer ? 'text-[#afff34]' : 'text-red-500'} size={18} />
          <span className="text-sm font-mono font-black">{side.deck.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdDeleteSweep className="text-gray-500" size={18} />
          <span className="text-sm font-mono font-black text-gray-500">{side.discard.length}</span>
        </div>
      </motion.div>
    );
  };

  const commentaryBox = useMemo(() => {
    if (!gameState?.log || gameState.log.length === 0) return null;
    const lastLog = gameState.log[0];
    const isPlayerTurn = gameState.turn === 'player';
    const turnColor = isPlayerTurn ? 'border-[#afff34]/40' : 'border-red-500/40';
    const turnGlow = isPlayerTurn ? 'shadow-[0_0_30px_rgba(175,255,52,0.2)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.2)]';

    return (
        <motion.div 
            key={lastLog.id}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`
                bg-black/90 px-8 py-3 rounded-2xl border-2 ${turnColor} ${turnGlow}
                backdrop-blur-2xl text-center flex items-center gap-4 max-w-[95%] relative overflow-hidden
            `}
        >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#afff34] to-transparent opacity-50 animate-pulse"></div>
            <MdMic className={isPlayerTurn ? 'text-[#afff34] animate-pulse' : 'text-red-500 animate-pulse'} size={24} />
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isPlayerTurn ? 'text-[#afff34]' : 'text-red-500'}`}>
                        {t('game.live')} • {isPlayerTurn ? t('selection.you') : t('selection.opponent')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <div className="text-xs md:text-sm text-white/90 leading-tight">
                    {formatLogText(lastLog.key, lastLog.params)}
                </div>
            </div>
        </motion.div>
    );
  }, [gameState?.log, gameState?.turn, t]);

  const isMeneurTurn = useMemo(() => {
      if (!gameState || gameState.turn !== 'player' || gameState.phase !== 'MAIN' || gameState.hasActionUsed) return false;
      const lastLog = gameState.log[0];
      return lastLog?.key === 'logs.meneur_trigger';
  }, [gameState]);

  return (
    <div className="relative w-full h-full bg-[#0c0c0c] overflow-hidden flex flex-col font-sans text-white">
      <ExplosionAnimation active={!!gameState.explosionEvent?.active} onComplete={clearExplosion} />
      
      <div className="flex-1 relative flex flex-col w-full overflow-hidden">
        {/* --- TERRAIN (Ajusté pour occuper tout l'espace au dessus du menu) --- */}
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a4d2e] via-[#246b3a] to-[#1a4d2e] -z-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-20 contrast-125"></div>
             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full"></div>
        </div>

        {/* --- ANIMATION BOOST --- */}
        <AnimatePresence>
            {boostAnim && (
                <motion.div 
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1.2, y: 0, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    className={`absolute z-[60] left-1/2 -translate-x-1/2 flex flex-col items-center ${boostAnim.side === 'player' ? 'bottom-[30%]' : 'top-[30%]'}`}
                >
                    <div className="bg-[#afff34] text-black px-6 py-2 rounded-full font-black text-2xl shadow-[0_0_30px_rgba(175,255,52,0.8)] flex items-center gap-2">
                        <MdFlashOn size={32} />
                        BOOST +{boostAnim.val}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- ZONE ADVERSAIRE (Descendue) --- */}
        <div className="flex-1 flex flex-col justify-start relative z-10 pt-4">
            <div className="w-full flex justify-center py-1">{renderHUD('opponent')}</div>
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-2 justify-center px-8 items-start min-h-[80px]">
                    {gameState.opponent.hand.map((_, i) => (
                        <div key={`opp-h-${i}`} className="w-[14%] max-w-[60px] aspect-[2/3] z-10 scale-90 -translate-y-2 opacity-40">
                            <Card isHidden={true} teamColor="#ef4444" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-3 w-full px-6 mt-4">
                    {Array.from({ length: GAME_RULES.FIELD_SIZE }).map((_, i) => renderFieldSlot('opponent', i))}
                </div>
            </div>
        </div>

        {/* --- BOITE DE COMMENTAIRE (Milieu) --- */}
        <div className="h-16 flex items-center justify-center relative z-20 shrink-0">
             <AnimatePresence mode="wait">
                {commentaryBox}
             </AnimatePresence>
        </div>

        {/* --- ZONE JOUEUR (Montée) --- */}
        <div className="flex-1 flex flex-col justify-end relative z-10 pb-4">
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-center gap-3 w-full px-6 mb-4">
                    {Array.from({ length: GAME_RULES.FIELD_SIZE }).map((_, i) => renderFieldSlot('player', i))}
                </div>
                <div className="w-full px-8 flex justify-center items-end min-h-[100px]">
                    <div className="flex gap-2 justify-center items-end w-full">
                        <AnimatePresence>
                            {gameState.player.hand.map((c, i) => (
                                <motion.div key={c.instanceId} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="relative w-[18%] max-w-[80px] aspect-[2/3] z-10 hover:z-50 -mb-4">
                                    <Card 
                                        data={c} isSelected={selectedBoostId === c.instanceId} 
                                        onClick={() => onCardClick(c, 'player', 'hand', i)} 
                                        teamColor="#afff34"
                                        isInHand={true}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center py-1">{renderHUD('player')}</div>
        </div>
      </div>

      {/* --- MENU DU BAS --- */}
      <div className="h-12 bg-black/95 border-t border-white/5 flex justify-between items-center px-8 shrink-0 z-40 backdrop-blur-md">
          <div className="flex gap-6">
              <button onClick={() => setShowLogModal(true)} className="flex flex-col items-center gap-0.5 text-[#444] hover:text-white transition-colors">
                <MdMenuBook size={20} /> 
              </button>
              <button onClick={() => setShowStatsModal(true)} className="flex flex-col items-center gap-0.5 text-[#444] hover:text-white transition-colors">
                <MdAssessment size={20} /> 
              </button>
          </div>
          {isMeneurTurn && (
              <button onClick={() => handlePass('player')} className="flex flex-col items-center gap-0.5 text-[#afff34] animate-pulse transition-colors">
                <MdReplay size={20} className="rotate-90" />
              </button>
          )}
          {gameState.winner && (
              <button onClick={() => setShowResultOverlay(true)} className="flex flex-col items-center gap-0.5 text-[#afff34] hover:text-white transition-colors">
                <MdVisibility size={20} />
              </button>
          )}
          <button onClick={() => setShowQuitConfirm(true)} className="flex flex-col items-center gap-0.5 text-[#444] hover:text-red-500 transition-colors">
             <MdExitToApp size={20} />
          </button>
      </div>

      {/* ... (Modaux inchangés) */}
      <AnimatePresence>
          {showLogModal && (
              <LogsModal 
                isOpen={showLogModal} 
                onClose={() => setShowLogModal(false)} 
                logs={gameState.log} 
                copyLogs={copyLogs} 
                logsCopied={logsCopied} 
                formatLogText={formatLogText} 
              />
          )}
          {showStatsModal && (
              <StatsModal 
                isOpen={showStatsModal} 
                onClose={() => setShowStatsModal(false)} 
                player={gameState.player} 
                opponent={gameState.opponent} 
                goals={gameState.goals} 
              />
          )}
          {inspectedCard && (
              <InspectionModal 
                inspectedCard={inspectedCard} 
                onClose={() => setInspectedCard(null)} 
                actions={inspectionActions} 
                onAction={executeAction} 
              />
          )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showQuitConfirm && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#111] border-2 border-white/10 text-white px-8 py-8 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col items-center gap-6 z-[100] w-[85%] max-w-sm backdrop-blur-2xl">
                <span className="font-black text-lg text-center uppercase tracking-tight">{t('game.quit_confirm')}</span>
                <div className="flex gap-4 w-full">
                    <button onClick={onQuit} className="flex-1 bg-[#afff34] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(175,255,52,0.3)]">{t('game.yes')}</button>
                    <button onClick={() => setShowQuitConfirm(false)} className="flex-1 bg-[#222] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">{t('game.no')}</button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
       <AnimatePresence>
        {showResultOverlay && gameState.winner && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6">
                <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-[#111] border-2 border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 max-w-md w-full relative">
                    <button onClick={() => setShowResultOverlay(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"><MdClose size={24} /></button>
                    <div className="text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{gameState.winner === 'player' ? '🏆' : gameState.winner === 'opponent' ? '💀' : '🤝'}</div>
                    <h2 className={`text-4xl font-black uppercase tracking-tighter text-center ${gameState.winner === 'player' ? t('game.win') : gameState.winner === 'opponent' ? t('game.lose') : t('game.draw')}`}>{gameState.winner === 'player' ? t('game.win') : gameState.winner === 'opponent' ? t('game.lose') : t('game.draw')}</h2>
                    <div className="flex items-center gap-8 text-3xl font-black">
                        <div className="flex flex-col items-center"><span className="text-[#666] text-xs uppercase tracking-widest mb-1">{gameState.player.teamName}</span><span className="text-[#afff34]">{gameState.player.score}</span></div>
                        <span className="text-[#333]">-</span>
                        <div className="flex flex-col items-center"><span className="text-[#666] text-xs uppercase tracking-widest mb-1">{gameState.opponent.teamName}</span><span className="text-white">{gameState.opponent.score}</span></div>
                    </div>
                    <div className="w-full h-px bg-white/5 my-2"></div>
                    <button onClick={onQuit} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ccc] transition-colors flex items-center justify-center gap-2 shadow-xl"><MdReplay size={24} /> {t('game.replay')}</button>
                </motion.div>
            </motion.div>
        )}
       </AnimatePresence>
       {gameState.goalEvent && gameState.goalEvent.type !== 'GAME_OVER' && !showResultOverlay && (
        <GoalAnimation 
          type={gameState.goalEvent.type} scorer={gameState.goalEvent.scorer} scorerName={gameState.goalEvent.scorerName} reason={gameState.goalEvent.reason}
          winner={gameState.winner} playerScore={gameState.player.score} opponentScore={gameState.opponent.score}
          teamNames={{ player: gameState.player.teamName, opponent: gameState.opponent.teamName }}
          onBackToMenu={resumeGame} 
        />
      )}
    </div>
  );
};

export default GameScreen;