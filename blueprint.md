# **ONE863 - DOCUMENT DE RÉFÉRENCE (BLUEPRINT)**

Ce document définit les règles officielles du jeu et la logique comportementale de l'IA.

---

## **I. RÈGLES DU JEU (GAMEPLAY)**

### **1. Initialisation**
*   **Deck** : 16 cartes par joueur.
*   **Main de départ** : 4 cartes piochées.
*   **Engagement** : Le joueur à domicile commence.

### **2. Cycle du Tour**
Au début de chaque tour, le joueur actif :
1.  **Pioche** : Complète sa main jusqu'à 4 cartes.
2.  **Réinitialisation** : Tous les joueurs sur le terrain sont "frais" (pas de fatigue).
3.  **Action Unique Obligatoire** : Le joueur **doit** effectuer une action. Il n'est pas possible de passer son tour normalement.
    *   **JOUER** : Placer une carte de sa main sur le terrain. Le tour passe à l'adversaire après la pose, sauf effet `MENEUR`.
    *   **ATTAQUER** : Choisir un joueur sur son terrain (face visible) pour attaquer.
4.  **Exception (Meneur)** : Si une carte avec l'effet `MENEUR` est jouée, elle offre une action d'attaque immédiate supplémentaire avec un autre joueur. Dans ce cas précis (et uniquement celui-là), le joueur peut choisir de **PASSER** s'il ne souhaite pas utiliser cette action bonus.
5.  **Temps Additionnel** : En fin de partie, si un joueur n'a plus de cartes, l'autre joueur peut effectuer une dernière action ou passer s'il ne peut rien faire.

### **3. Phase d'Attaque et Blocage**
*   **Déclaration** : L'attaquant est sélectionné.
*   **Blocage Obligatoire** : L'adversaire **doit** proposer un bloqueur s'il possède au moins un joueur face visible.
*   **Boost de Défense** : Le défenseur peut utiliser une carte avec l'effet `BOOST` de sa main pour augmenter son score de défense.
*   **But Automatique (But Ouvert)** : Si l'adversaire n'a aucun joueur face visible, le but est marqué immédiatement.

### **4. Résolution du Duel (ATT vs DEF)**
On compare la puissance finale (VAEP + Bonus + Capacités).

#### **Pouvoirs par Poste (Fixes)**
*   **GK (Gardien)** : +2 DEF.
*   **CB (Défenseur Central)** : +1 DEF.
*   **LB / RB (Latéraux)** : +1 ATT / +1 DEF.
*   **CDM (Milieu Déf.)** : +1 DEF.
*   **CM (Milieu Central)** : +1 DEF à tous les alliés visibles.
*   **CAM (Meneur)** : `MENEUR` (Effet JOUÉE : Permet une attaque immédiate avec un **AUTRE** joueur).
*   **LM / RM (Milieux Lat.)** : +1 ATT.
*   **LW / RW (Ailiers)** : +1 ATT.
*   **ST (Buteur)** : +2 ATT.

#### **Capacités Spéciales**
*   **`MENEUR`** : Lorsqu'il est joué, permet d'effectuer une attaque immédiate avec un autre joueur déjà présent sur le terrain. Le Meneur lui-même ne peut pas attaquer durant ce tour bonus. Possibilité de passer l'action bonus.
*   **`AGRESSIF`** : Si ce joueur perd un duel, la carte adverse qui a gagné le duel est également défaussée.
*   **`BOOST1/2`** : Cartes utilisables depuis la main en défense (+1 ou +2 VAEP).

#### **Résultats du Duel**
*   **ATT > DEF (Victoire Attaque)** : Le défenseur est **retourné** (Momentum). L'attaquant reste.
*   **ATT < DEF (Victoire Défense)** : L'attaquant est **défaussé**. Le défenseur reste et "nettoie" une de ses propres cartes retournées (si présente).
*   **ATT = DEF (Match Nul)** : L'attaquant ET le défenseur sont **défaussés**.

### **5. Le But (⚽)**
Un but est marqué par "But Ouvert" ou "Momentum" (3 cartes retournées).
*   **Conséquence** : L'attaquant est défaussé, le défenseur défausse toutes ses cartes retournées. Engagement au joueur qui a encaissé.

---

## **II. RÈGLES DE COMPORTEMENT DE L'IA**

### **1. Playmaker / Meneur**
*   L'IA utilise l'effet Meneur pour déclencher une attaque si elle a un avantage. Sinon, elle passe pour terminer son tour.

### **2. Absence de passage de tour générique**
*   L'IA comprend qu'elle doit jouer une carte ou attaquer à chaque tour, sauf cas du Meneur.
