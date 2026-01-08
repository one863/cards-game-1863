// src/features/game/GameScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { useLanguage } from '@/app/LanguageContext';
import { getEffectValue, calculateTotalPowerBonus } from '@/core/engine/effectSystem';
import useAI from '@/core/ai/useAI';
import { Player } from '@/types';
import { 
    MdMic, MdReplay, MdShield
} from 'react-icons/md';

import { 
    GameHUD, GameField, GameHand, 
    LogsModal, StatsModal, InspectionModal, PauseModal, MatchResultModal, VisualEffectsLayer, LogMessage 
} from './components';
import DiscardPileModal from './components/DiscardPileModal';
import DeckPileModal from './components/DeckPileModal';

import { useGameInteraction } from './useGameInteraction';

const GameScreen: React.FC<{ onQuit: () => void }> = ({ onQuit }) => {
  const { t } = useLanguage();
  const { 
    gameState, 
    selectedAttackerId, 
    selectedBoostId, setSelectedBoostId,
    setDeckOpen, setDiscardOpen,
    handlePlayCard, handleAttack, handleBlock, resumeGame, handlePass,
    initMatch 
  } = useGameStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false); 
  const [logsCopied, setLogsCopied] = useState(false);

  const { inspectedCard, setInspectedCard, onCardClick, inspectionActions, executeAction, onDragStart, onDropCard } = useGameInteraction(
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
        <motion.div key={lastLog.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className={`bg-black/90 px-4 py-1.5 rounded-lg border ${turnColor} backdrop-blur-md text-center flex items-center gap-2 max-w-full relative overflow-hidden shadow-2xl`}>
            <MdMic className={isTurnPlayer ? 'text-[#afff34] animate-pulse' : 'text-red-500 animate-pulse'} size={16} />
            <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-1">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isTurnPlayer ? 'text-[#afff34]' : 'text-red-500'}`}>{t('game.live')} • {isTurnPlayer ? t('selection.you') : t('selection.opponent')}</span>
                </div>
                <div className="text-[10px] md:text-xs text-white font-medium leading-tight">
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
        <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="absolute top-20 left-0 right-0 z-[100] bg-red-600 text-white py-1 text-center font-black uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center border-b border-white/20">
           <div className="flex items-center gap-2">
              <MdShield size={16} className="animate-pulse" />
              <span className="text-[10px]">{t('game.must_block')}</span>
           </div>
        </motion.div>
      )}

      {/* Main game area using grid for 6 rows */}
      <div className="flex-1 relative grid grid-rows-6 gap-1 w-full max-w-[450px] mx-auto pb-2">
        
        {/* Fond du terrain avec couleur claire */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4CAF50] via-[#81C784] to-[#4CAF50] z-0 opacity-50">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-20 contrast-125"></div>
        </div>

        {/* Rond central du terrain (séparé des commentaires) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/10 rounded-full z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full z-0"></div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10 z-0"></div>

        {/* LIGNE 1 : HUD (Scoreboard) - Alignement central */}
        <div className="relative z-10 flex items-center justify-center pt-4">
            <GameHUD onMenuClick={() => setShowPauseMenu(true)} />
        </div>

        {/* LIGNE 2 : MAIN ADVERSAIRE */}
        <div className="relative z-10 flex items-center justify-center">
            <GameHand 
                hand={gameState.opponent.hand} sideKey="opponent" selectedBoostId={null} 
                deckCount={gameState.opponent.deck.length} discardCount={gameState.opponent.discard.length}
                onCardClick={onCardClick} 
            />
        </div>

        {/* LIGNE 3 : TERRAIN ADVERSAIRE */}
        <div className="relative z-10 flex items-center justify-center">
            <GameField field={gameState.opponent.field} sideKey="opponent" attackerInstanceId={gameState.attackerInstanceId || null} selectedAttackerId={selectedAttackerId} turn={gameState.turn} phase={gameState.phase} getVisualBonus={getVisualBonus} onCardClick={onCardClick} onDropCard={onDropCard} />
        </div>
            
        {/* LIGNE 4 : TERRAIN JOUEUR */}
        <div className="relative z-10 flex items-center justify-center">
            <GameField field={gameState.player.field} sideKey="player" attackerInstanceId={gameState.attackerInstanceId || null} selectedAttackerId={selectedAttackerId} turn={gameState.turn} phase={gameState.phase} isMeneurActive={gameState.meneurActive} getVisualBonus={getVisualBonus} onCardClick={onCardClick} onDropCard={onDropCard} />
        </div>
        
        {/* LIGNE 5 : MAIN JOUEUR */}
        <div className="relative z-10 flex items-center justify-center">
            <GameHand 
                hand={gameState.player.hand} sideKey="player" selectedBoostId={selectedBoostId} 
                deckCount={gameState.player.deck.length} discardCount={gameState.player.discard.length}
                onCardClick={onCardClick} onDragStart={onDragStart}
                onDeckClick={() => setDeckOpen(true)} onDiscardClick={() => setDiscardOpen(true)}
            />
        </div>

        {/* LIGNE 6 : COMMENTAIRES LIVE */}
        <div className="relative z-20 flex items-center justify-center h-full"> {/* Increased height and centered content */}
             <div className="scale-100 w-full">
                <AnimatePresence mode="wait">{commentaryBox}</AnimatePresence>
             </div>
        </div>

      </div>

      {/* Barre d'action joueur */}
      <AnimatePresence>
        {isPlayerTurn && (gameState.meneurActive || gameState.stoppageTimeAction === 'player' || gameState.phase === 'ATTACK_DECLARED') && (
            <motion.div 
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[60]"
            >
                <button onClick={() => handlePass('player')} className="bg-black/90 backdrop-blur-md text-[#afff34] px-4 py-1.5 rounded-full border border-[#afff34]/30 shadow-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                    {gameState.phase === 'ATTACK_DECLARED' ? t('game.pass') : t('game.skip_meneur')} 
                    <MdReplay size={14} className="rotate-90" />
                </button>
            </motion.div>
        )}
      </AnimatePresence>
      
      <DiscardPileModal /> 
      <DeckPileModal />

      <AnimatePresence>
          {showLogModal && <LogsModal key="logs-modal" isOpen={showLogModal} onClose={() => setShowLogModal(false)} logs={gameState.log} copyLogs={copyLogs} logsCopied={logsCopied} />}
          {showStatsModal && <StatsModal key="stats-modal" isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} player={gameState.player} opponent={gameState.opponent} goals={gameState.goals} />}
          {showPauseMenu && (
              <PauseModal 
                key="pause-modal" isOpen={showPauseMenu} 
                onResume={() => setShowPauseMenu(false)} 
                onRestart={handleRestart}
                onQuit={onQuit} 
                onShowLogs={() => { setShowPauseMenu(false); setShowLogModal(true); }}
                onShowStats={() => { setShowPauseMenu(false); setShowStatsModal(true); }}
              />
          )}
          {inspectedCard && (
              <InspectionModal 
                key="inspect-modal" 
                card={inspectedCard.card} 
                side={inspectedCard.side} 
                onClose={() => setInspectedCard(null)} 
                actions={inspectionActions} 
                onAction={executeAction} 
              />
          )}
          {showResultOverlay && gameState.winner && (
              <MatchResultModal key="result-modal" winner={gameState.winner} playerScore={gameState.player.score} opponentScore={gameState.opponent.score} onRematch={handleRestart} onMenu={onQuit} />
          )}
      </AnimatePresence>
    </div>
  );
};

export default GameScreen;