import { useState, useMemo } from 'react';
import { Player, GameState } from '@/types';
import { GameActionType } from '@/features/game/components/InspectionModal';
import { useLanguage } from '@/app/LanguageContext';
import { MdArrowUpward, MdShield, MdFlashOn } from 'react-icons/md';
import React from 'react';

interface UseGameInteractionResult {
  inspectedCard: { card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number } | null;
  setInspectedCard: (val: any) => void;
  onCardClick: (card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number) => void;
  inspectionActions: { type: GameActionType; label: string; icon: React.ReactNode }[];
  executeAction: (actionType: GameActionType) => void;
  onDragStart: (event: React.DragEvent, card: Player, cardIndex: number) => void; 
  onDropCard: (dropFieldIndex: number) => void; 
}

export const useGameInteraction = (
  gameState: GameState | null,
  selectedBoostId: string | null,
  setSelectedBoostId: (id: string | null) => void,
  handlePlayCard: (idx: number) => void,
  handleAttack: (id: string) => void,
  handleBlock: (blockerId: string, boostId: string | null) => void
): UseGameInteractionResult => {
  
  const { t } = useLanguage();
  
  const [inspectedCard, setInspectedCard] = useState<{ 
    card: Player, 
    side: 'player' | 'opponent', 
    zone: 'hand' | 'field', 
    idx: number 
  } | null>(null);
  
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);

  const onCardClick = (card: Player, side: 'player' | 'opponent', zone: 'hand' | 'field', idx: number) => {
    if (!gameState) return;
    // SUPPRESSION DE LA CONDITION gameState.winner
    // On permet l'inspection pour le "Review Match"
    setInspectedCard({ card, side, zone, idx });
  };

  const executeAction = (actionType: GameActionType) => {
      if (!inspectedCard) return;
      const { idx, card } = inspectedCard;
      
      if (actionType === 'PLAY') {
          handlePlayCard(idx);
      } else if (actionType === 'ATTACK') {
          handleAttack(card.instanceId!);
      } else if (actionType === 'BLOCK') {
          handleBlock(card.instanceId!, selectedBoostId);
      } else if (actionType === 'BOOST') {
          setSelectedBoostId(selectedBoostId === card.instanceId ? null : card.instanceId!);
      }
      
      setInspectedCard(null);
  };

  const inspectionActions = useMemo(() => {
      // Si le match est fini, aucune action n'est possible, on retourne une liste vide
      if (!inspectedCard || inspectedCard.side !== 'player' || !gameState || gameState.winner) return [];
      
      const actions: { type: GameActionType; label: string; icon: React.ReactNode }[] = [];
      const { zone, card } = inspectedCard;
      const { phase, turn } = gameState;
      
      if (phase === 'MAIN' && turn === 'player') {
          if (zone === 'hand') {
            actions.push({ type: 'PLAY', label: t('game.play') || 'JOUER', icon: <MdArrowUpward /> });
          } else if (zone === 'field' && !card.hasActed && !card.isFlipped) {
              const playerField = gameState.player?.field || [];
              const visibleCount = playerField.filter(c => c && !c.isFlipped).length;
              const opponentVisibleCount = (gameState.opponent?.field || []).filter(c => c && !c.isFlipped).length;
              const canGkAttack = card.pos === 'GK' ? (visibleCount === 1 || opponentVisibleCount === 0) : true;
              if (canGkAttack) {
                actions.push({ type: 'ATTACK', label: t('game.attack') || 'ATTAQUER', icon: <MdArrowUpward /> });
              }
          }
      }
      else if (phase === 'ATTACK_DECLARED' && turn === 'player') {
          if (zone === 'field' && !card.isFlipped) {
              actions.push({ type: 'BLOCK', label: t('game.block') || 'BLOQUER', icon: <MdShield /> });
          } else if (zone === 'hand') {
              const isBoostCard = card.effects?.some(eff => eff === 'BOOST1' || eff === 'BOOST2');
              if (isBoostCard) {
                  actions.push({ type: 'BOOST', label: t('game.boost') || 'BOOST', icon: <MdFlashOn /> });
              }
          }
      }
      
      return actions;
  }, [inspectedCard, gameState, t]);

  const onDragStart = (event: React.DragEvent, card: Player, cardIndex: number) => {
    if (!gameState || gameState.winner || gameState.turn !== 'player' || gameState.phase !== 'MAIN') return;
    
    if (gameState.player.field.length >= 5) {
        event.preventDefault();
        return;
    }

    event.dataTransfer.setData("text/plain", String(cardIndex));
    setDraggedCardIndex(cardIndex);
  };

  const onDropCard = (dropFieldIndex: number) => {
    if (!gameState || draggedCardIndex === null) return;

    if (gameState.player.field[dropFieldIndex]) return;
    if (gameState.player.field.length >= 5) return;

    handlePlayCard(draggedCardIndex);
    setDraggedCardIndex(null);
  };

  return {
    inspectedCard,
    setInspectedCard,
    onCardClick,
    inspectionActions,
    executeAction,
    onDragStart,
    onDropCard
  };
};
