# Football Card Battle

## Aperçu du Projet
Football Card Battle est un jeu de cartes stratégique où les joueurs s'affrontent avec des équipes nationales personnalisées. Le jeu combine le placement tactique de cartes, des duels de puissance basés sur les statistiques des joueurs et leurs effets, ainsi que la gestion d'événements exceptionnels qui peuvent renverser le cours du match.

## Technologies Clés
Le projet est développé avec des technologies modernes pour une expérience utilisateur fluide et une architecture robuste :

-   **React (avec TypeScript/TSX)** : Librairie JavaScript pour la construction de l'interface utilisateur, renforcée par TypeScript pour la typage.
-   **Zustand** : Solution de gestion d'état légère et performante.
-   **Tailwind CSS** : Framework CSS "utility-first" pour un stylisme rapide et flexible.
-   **Framer Motion** : Bibliothèque React pour des animations fluides et interactives.
-   **Vite** : Outil de build rapide pour un développement front-end efficace.

## Fonctionnalités Principales
-   **Système de Match Complet** : Phases de jeu (`MAIN`) et phases de duel (`ATTACK_DECLARED`).
-   **IA Stratégique** : Comportement de l'IA adaptable (économie, remplacement tactique, ciblage agressif, gestion des risques).
-   **Duels de Cartes Avancés** : Calculs de puissance complexes intégrant les postes, les mots-clés et les synergies d'équipe.
-   **Système d'Événements Exceptionnels** : Déclenchement de pénaltys (si défenseur agressif), corners, coups francs lors de duels nuls.
-   **Gestion d'Équipe et Collection** : Sélection d'équipe, boutique et marché des transferts pour acquérir et gérer les joueurs.

## Règles du Jeu (Résumé)
-   **ATT > DEF (Victoire Attaque)** : Le défenseur est retourné (sa puissance est réduite).
-   **ATT < DEF (Victoire Défense)** : L'attaquant est défaussé. Le défenseur reste sur le terrain et défausse une de ses propres cartes retournées (si présente).
-   **ATT = DEF (Match Nul)** : Un événement exceptionnel est déclenché (ex: Penalty si le défenseur est "AGRESSIF"). Si aucun événement exceptionnel n'est déclenché, l'attaquant ET le défenseur sont défaussés.
-   **Momentum Goal** : Un but est automatiquement marqué si un joueur accumule 3 cartes retournées sur son terrain.
