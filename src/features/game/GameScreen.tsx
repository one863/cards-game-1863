// src/features/game/GameScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../app/LanguageContext';
import { getEffectValue, calculateTotalPowerBonus } from '../../core/engine/effectSystem';
import useAI from '../../core/ai/useAI';
import { Player } from '../../types';
import { 
    MdMenuBook, MdExitToApp, MdMic, MdReplay, MdAssessment, MdClose, MdShield
} from 'react-icons/md';

import { 
    GameHUD, GameField, GameHand, 
    LogsModal, StatsModal, InspectionModal, PauseModal, MatchResultModal, VisualEffectsLayer, LogMessage 
} from './components';
import DiscardPileModal from './components/DiscardPileModal';
import DeckPileModal from './components/DeckPileModal'; // --- NOUVEAU IMPORT ---

import { useGameInteraction } from './useGameInteraction';

const GameScreen: React.FC<{ onQuit: () => void }> = ({ onQuit }) => {
  const { t } = useLanguage();
  const { 
    gameState, 
    selectedAttackerId, 
    selectedBoostId, setSelectedBoostId,
    handlePlayCard, handleAttack, handleBlock, resumeGame, handlePass,
    initMatch 
  } = useGameStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false); 
  const [logsCopied, setLogsCopied] = useState(false);

  const { inspectedCard, setInspectedCard, onCardClick, inspectionActions, executeAction } = useGameInteraction(
      gameState, selectedBoostId, setSelectedBoostId, handlePlayCard, handleAttack, handleBlock
  );

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

  const handleRestart = () => {
      if (!gameState) return;
      const allPlayerCards = [...gameState.player.deck, ...gameState.player.hand, ...gameState.player.field, ...gameState.player.discard];
      const allOpponentCards = [...gameState.opponent.deck, ...gameState.opponent.hand, ...gameState.opponent.field, ...gameState.opponent.discard];
      
      initMatch(
          allOpponentCards.map(c => ({...c, instanceId: undefined, isFlipped: false, hasActed: false})),
          allPlayerCards.map(c => ({...c, instanceId: undefined, isFlipped: false, hasActed: false})),
          undefined, undefined,
          { player: gameState.player.teamName, opponent: gameState.opponent.teamName }
      );
      setShowPauseMenu(false);
      setShowResultOverlay(false);
  };

  const getVisualBonus = (card: Player, side: 'player' | 'opponent') => {
    if (!gameState || card.isFlipped) return 0;
    const phase = gameState.phase;
    let isAttackingSide = (phase === 'MAIN' && gameState.turn === side) || (phase === 'ATTACK_DECLARED' && gameState.turn !== side);
    let details = calculateTotalPowerBonus(gameState, card, side, isAttackingSide ? 'attacker' : 'defender');
    let total = details.bonus;
    if (side === 'player' && phase === 'ATTACK_DECLARED' && selectedBoostId) {
            const boostCard = gameState.player.hand.find(c => c.instanceId === selectedBoostId);
            if (boostCard) {
                total += getEffectValue(boostCard, 'value');
            }
    }
    return total;
  };
  
  const commentaryBox = useMemo(() => {
    if (!gameState?.log || gameState.log.length === 0) return null;
    const lastLog = gameState.log[0];
    const isTurnPlayer = gameState.turn === 'player';
    const turnColor = isTurnPlayer ? 'border-[#afff34]/40' : 'border-red-500/40';
    return (
        <motion.div key={lastLog.id} initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0 }} className={`bg-black/90 px-8 py-3 rounded-2xl border-2 ${turnColor} backdrop-blur-sm text-center flex items-center gap-4 max-w-[95%] relative overflow-hidden shadow-2xl`}>
            <MdMic className={isTurnPlayer ? 'text-[#afff34] animate-pulse' : 'text-red-500 animate-pulse'} size={24} />
            <div className="flex flex-col items-center min-w-[200px]">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isTurnPlayer ? 'text-[#afff34]' : 'text-red-500'}`}>{t('game.live')} • {isTurnPlayer ? t('selection.you') : t('selection.opponent')}</span>
                </div>
                <div className="text-xs md:text-sm text-white/90 leading-tight">
                    <LogMessage logKey={lastLog.key} params={lastLog.params} />
                </div>
            </div>
        </motion.div>
    );
  }, [gameState?.log, gameState?.turn, t]);

  if (!gameState || !gameState.player || !gameState.opponent) return <div className="flex h-full items-center justify-center bg-black text-white">Loading...</div>;

  return (
    <div className="relative w-full h-full bg-[#0c0c0c] overflow-hidden flex flex-col font-sans text-white">
      <VisualEffectsLayer onResumeGame={resumeGame} />
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
      <GameHUD side={gameState.opponent} sideKey="opponent" isCurrentTurn={gameState.turn === 'opponent'} />
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a6d41] via-[#3a8d56] to-[#2a6d41] z-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-30 contrast-125"></div>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full"></div>
        </div>
        <GameHand hand={gameState.opponent.hand} sideKey="opponent" selectedBoostId={null} onCardClick={onCardClick} />
        <GameField field={gameState.opponent.field} sideKey="opponent" attackerInstanceId={gameState.attackerInstanceId || null} selectedAttackerId={selectedAttackerId} turn={gameState.turn} phase={gameState.phase} getVisualBonus={getVisualBonus} onCardClick={onCardClick} />
        <div className="h-20 shrink-0 flex items-center justify-center px-4 relative z-20">
             <AnimatePresence mode="wait">{commentaryBox}</AnimatePresence>
        </div>
        <GameField field={gameState.player.field} sideKey="player" attackerInstanceId={gameState.attackerInstanceId || null} selectedAttackerId={selectedAttackerId} turn={gameState.turn} phase={gameState.phase} isMeneurActive={gameState.meneurActive} getVisualBonus={getVisualBonus} onCardClick={onCardClick} />
        <GameHand hand={gameState.player.hand} sideKey="player" selectedBoostId={selectedBoostId} onCardClick={onCardClick} />
      </div>
      <GameHUD side={gameState.player} sideKey="player" isCurrentTurn={gameState.turn === 'player'} />
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
          <button onClick={() => setShowPauseMenu(true)} className="text-white/40 hover:text-red-500 transition-colors p-2"><MdExitToApp size={24} /></button>
      </div>
      
      {/* Modales de Piles */}
      <DiscardPileModal /> 
      <DeckPileModal />

      <AnimatePresence>
          {showLogModal && <LogsModal key="logs-modal" isOpen={showLogModal} onClose={() => setShowLogModal(false)} logs={gameState.log} copyLogs={copyLogs} logsCopied={logsCopied} />}
          {showStatsModal && <StatsModal key="stats-modal" isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} player={gameState.player} opponent={gameState.opponent} goals={gameState.goals} />}
          {showPauseMenu && <PauseModal key="pause-modal" isOpen={showPauseMenu} onClose={() => setShowPauseMenu(false)} onRestart={handleRestart} onQuit={onQuit} />}
          {inspectedCard && <InspectionModal key="inspect-modal" inspectedCard={inspectedCard} onClose={() => setInspectedCard(null)} actions={inspectionActions} onAction={executeAction} />}
          {showResultOverlay && gameState.winner && (
              <MatchResultModal key="result-modal" winner={gameState.winner} player={gameState.player} opponent={gameState.opponent} onRestart={handleRestart} onQuit={onQuit} onClose={() => setShowResultOverlay(false)} />
          )}
      </AnimatePresence>
    </div>
  );
};

export default GameScreen;