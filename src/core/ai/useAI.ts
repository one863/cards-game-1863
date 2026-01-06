const handleDefensivePhase = (state: GameState) => {
  const attackerId = state.attackerInstanceId;
  if (!attackerId) return;
  
  const attackerCard = state.player.field.find(c => c.instanceId === attackerId);
  const blockers = state.opponent.field.filter((c: Player) => !c.isFlipped);

  // Si aucun bloqueur ou pas d'attaquant valide, on passe
  if (!blockers.length || !attackerCard) { 
      handlePass('opponent', true);
      return; 
  }

  // Calcul de la puissance d'attaque réelle (VAEP + Bonus)
  const attPower = attackerCard.vaep + calculateTotalPowerBonus(state, attackerCard, 'player', 'attacker').bonus;
  
  // Évaluation de chaque bloqueur potentiel
  const processedBlockers = blockers.map((b: Player) => ({
    card: b,
    power: b.vaep + calculateTotalPowerBonus(state, b, 'opponent', 'defender').bonus,
    isAggressive: b.effects?.includes("AGRESSIF")
  })).sort((a: any, b: any) => a.power - b.power);

  // 1. STRATÉGIE : LE GAGNANT LE MOINS CHER
  // On cherche la carte la plus faible capable de gagner ou de faire match nul.
  const winnerBlocker = processedBlockers.find((b: any) => b.power >= attPower);
  if (winnerBlocker) {
      handleBlock(winnerBlocker.card.instanceId!);
      return;
  }

  // 2. STRATÉGIE : LE SACRIFICE UTILE (KAMIKAZE)
  // Si on va perdre, on vérifie si on a un joueur "AGRESSIF". 
  // Grâce à son effet, il sera éliminé MAIS il emportera l'attaquant adverse avec lui.
  const aggressiveBlocker = processedBlockers.find((b: any) => b.isAggressive);
  if (aggressiveBlocker) {
      handleBlock(aggressiveBlocker.card.instanceId!);
      return;
  }

  // 3. STRATÉGIE : LE "NO BLOCK" TACTIQUE (ANTI-MOMENTUM)
  // Si on ne peut pas gagner et qu'on n'est pas agressif :
  // Bloquer nous ferait juste "flipper" (retourner) une carte, nous rapprochant du Momentum Goal.
  // Mieux vaut laisser passer l'attaque pour garder nos défenseurs actifs au prochain tour.
  
  const flippedCount = state.opponent.field.filter(c => c.isFlipped).length;
  
  // Si on a déjà des cartes retournées, on refuse catégoriquement de bloquer un duel perdu
  if (flippedCount >= 1) {
      handlePass('opponent', true); // true = passage en phase défensive
      return;
  }

  // Par défaut, si le duel est perdu d'avance, on préserve la santé physique de nos joueurs.
  handlePass('opponent', true);
};