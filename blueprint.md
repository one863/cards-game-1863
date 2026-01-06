# Blueprint du Projet : Football Card Battle

## 1. Aperçu du Projet
Application de jeu de cartes de football stratégique où les joueurs s'affrontent avec des équipes nationales. Le gameplay est basé sur le placement tactique, les duels de puissance et la gestion d'événements aléatoires.

## 2. État Actuel du Projet

### Style et Design
- **Esthétique Moderne** : Interface sombre (dark mode) avec des dégradés profonds et des bordures subtiles.
- **Cartes Interactives** : Mini-cartes et Grandes cartes avec effets de rotation (AnimatePresence), animations de survol et feedback visuel lors des actions.
- **Typographie expressive** : Utilisation de polices larges et grasses pour les valeurs de puissance (VAEP).
- **Effets Visuels** : Animations d'explosion (pour l'effet Agressif), de but, de boost et de pénalité.

### Fonctionnalités Implémentées
- **Système de Match Complet** : Phases MAIN (jeu, attaque) et ATTACK_DECLARED (blocage, boost).
- **Gestion des Équipes** : Sélection de l'équipe nationale au début du jeu.
- **Boutique et Mercato** : Achat de packs de boosters et gestion de la collection de joueurs.
- **IA Stratégique** :
    - Mode Économie (gestion de la main).
    - Remplacement tactique (sacrifice pour libérer des slots).
    - Ciblage agressif (neutralisation des stars adverses).
    - Prudence accrue contre les défenseurs d'élite.
- **Système de Duel Avancé** :
    - Prise en compte des bonus de poste et des effets de synergie (ex: Moteur CM).
    - Gestion des buffs et débuffs dynamiques.
- **Système d'Événements Exceptionnels (Nouveau)** :
    - Déclenchement d'événements lors d'une égalité (Match Nul).
    - **Penalty** : Prioritaire si le défenseur est "AGRESSIF" (70% de chance de but).
    - Architecture prête pour Corner et Coup Franc.
- **Règles Spécifiques** :
    - **ATT > DEF** : Le défenseur est retourné (Flipped).
    - **ATT < DEF** : L'attaquant est défaussé, le défenseur reste et défausse une de ses cartes retournées.
    - **ATT = DEF** : Événement exceptionnel si condition remplie, sinon double défausse.
    - **Momentum Goal** : But automatique si un joueur a 3 cartes retournées.

### Architecture des Fichiers

Le projet suit une structure React/Vite standard, organisée pour une bonne séparation des préoccupations :

-   **`public/`** : Contient les assets statiques comme `vite.svg`.
-   **`src/`** : Le répertoire principal du code source.
    -   **`src/app/`** : Fichiers globaux de l'application (ex: `LanguageContext.tsx`).
    -   **`src/assets/`** : Ressources comme les images (ex: `react.svg`).
    -   **`src/components/`** : Composants React réutilisables.
        -   **`src/components/card/`** : Composants spécifiques aux cartes (`Card.tsx`, `MiniCard.tsx`, `LargeCard.tsx`).
        -   **`src/components/ui/`** : Composants d'interface utilisateur génériques (animations, etc.).
    -   **`src/core/`** : Logique métier fondamentale et règles du jeu.
        -   **`src/core/ai/`** : Intelligence Artificielle (`useAI.ts`, `logic/aiDecision.ts`).
        -   **`src/core/engine/`** : Moteur de jeu (système d'effets, génération de joueurs, logique de boutique).
        -   **`src/core/i18n/`** : Fichiers d'internationalisation (langues).
        -   **`src/core/rules/`** : Définition des règles du jeu (`settings.ts`).
    -   **`src/data/`** : Données statiques du jeu (boosters, équipes, joueurs).
    -   **`src/features/`** : Modules de fonctionnalités spécifiques (écrans de jeu, mercato, boutique).
        -   **`src/features/game/`** : Logique et composants de l'écran de jeu (`GameScreen.tsx`, `TeamSelectionScreen.tsx`).
        -   **`src/features/mercato/`** : Logique et composants de l'écran du mercato.
        -   **`src/features/shop/`** : Logique et composants de l'écran de la boutique.
    -   **`src/stores/`** : Gestion de l'état global avec Zustand (`useGameStore.ts`, `slices/`).
        -   **`src/stores/slices/`** : Slices spécifiques pour la gestion de l'état du jeu (actions, moteur, statut, utilisateur).
    -   **`src/styles/`** : Feuilles de style CSS (`global.css`, `game.css`, `menu.css`).
    -   **`src/test/`** : Fichiers de configuration et utilitaires de test.
    -   **`src/types/`** : Définitions de types TypeScript (interfaces, types personnalisés).
    -   **`src/utils/`** : Fonctions utilitaires diverses (générateur de deck).
    -   **`src/App.tsx`** : Composant racine de l'application.
    -   **`src/main.tsx`** : Point d'entrée principal de l'application.
-   **`.idx/`** : Fichiers de configuration spécifiques à l'environnement Firebase Studio (`dev.nix`, `icon.png`, `mcp.json`).
-   **Fichiers de configuration racine** : `package.json`, `tailwind.config.js`, `tsconfig.json`, `vite.config.js`, etc.

### Technologies Clés

Le projet est construit en utilisant les technologies modernes suivantes :

-   **React (avec TypeScript/TSX)** : La bibliothèque JavaScript pour construire l'interface utilisateur, avec TypeScript pour une meilleure robustesse du code.
-   **Zustand** : Une solution de gestion d'état légère et flexible pour l'application.
-   **Tailwind CSS** : Un framework CSS utility-first pour un stylisme rapide et personnalisable.
-   **Framer Motion** : Une bibliothèque React pour des animations fluides et interactives (utilisée notamment pour les cartes et les effets visuels).
-   **Vite** : Un outil de build rapide pour le développement front-end.

### Mots-clés des cartes et effets de poste (Synchronisation avec `src/core/engine/effectSystem.ts`)

**Mots-clés :**
- **AGRESSIF** : Si la carte est "AGRESSIF" et qu'un duel résulte en un match nul, un penalty est déclenché. Si elle perd un duel, elle élimine également l'adversaire (défausse mutuelle).
- **BOOST1 / BOOST2** : Carte de boost offrant +1 / +2 VAEP respectivement lors d'un blocage.

**Postes et leurs effets :**
- **GK (Gardien)** : +2 en DEF lorsqu'il est en position de défenseur.
- **ST (Attaquant de pointe)** : +2 en ATT lorsqu'il est en position d'attaquant.
- **CB (Défenseur Central)** : +1 en DEF lorsqu'il est en position de défenseur.
- **CDM (Milieu Défensif)** : +1 en DEF lorsqu'il est en position de défenseur.
- **LB (Latéral Gauche) / RB (Latéral Droit)** : +1 en DEF lorsqu'il est en position de défenseur.
- **LW (Ailier Gauche) / RW (Ailier Droit)** : +2 en ATT lorsqu'il est en position d'attaquant, si l'adversaire n'a pas de contre (LB, RB, LM, RM) sur le terrain.
- **LM (Milieu Gauche) / RM (Milieu Droit)** : +1 en ATT lorsqu'il est en position d'attaquant.
- **CAM (Milieu Offensif)** : En étant joué, permet à un attaquant non actionné (LW, RW, ST) de jouer une action supplémentaire durant le même tour (Meneur).
- **CM (Milieu Central)** : Octroie +1 en DEF à un autre milieu de terrain (CDM, CM, CAM, LM, RM) présent sur le terrain en défense (Moteur CM).

## 3. Plan de Développement Actuel

### Étape 1 : Expansion des Événements Exceptionnels
- [ ] Implémenter l'animation et la logique de résolution pour le **CORNER**.
- [ ] Implémenter l'animation et la logique de résolution pour le **FREE_KICK**.
- [ ] Ajouter des probabilités de déclenchement pour ces événements lors d'un match nul.

### Étape 2 : Amélioration de l'UI/UX
- [ ] Ajouter des sons d'ambiance et de feedback d'action.
- [ ] Optimiser l'affichage mobile (responsive).

### Étape 3 : Système de Progression
- [ ] Mise en place d'un système de niveaux d'utilisateur.
- [ ] Défis quotidiens pour gagner des crédits.
