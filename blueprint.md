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
3.  **Action Unique** : Le joueur doit choisir **une seule** action parmi :
    *   **JOUER** : Placer une carte de sa main sur le terrain. Le tour passe à l'adversaire après la pose, sauf effet spécial. Limite de 5 cartes sur le terrain (incluant les cartes retournées).
    *   **ATTAQUER** : Choisir un joueur sur son terrain (face visible) pour attaquer. Tout joueur peut attaquer.
4.  **Fin de tour** : Une fois l'action résolue, la main passe à l'adversaire.

### **3. Phase d'Attaque et Blocage**
*   **Déclaration** : L'attaquant est sélectionné.
*   **Blocage Obligatoire** : L'adversaire **doit** proposer un bloqueur s'il possède au moins un joueur face visible.
*   **Boost de Défense** : Le défenseur peut utiliser une carte avec l'effet `BOOST` de sa main pour augmenter son score de défense.
*   **But Automatique (But Ouvert)** : Si l'adversaire n'a aucun joueur face visible, le but est marqué immédiatement.

### **4. Résolution du Duel (ATT vs DEF)**
On compare la puissance finale (VAEP + Bonus + Capacités).

#### **Pouvoirs par Poste (Fixes)**
Chaque joueur possède un bonus automatique lié à son poste :
*   **GK (Gardien)** : +2 DEF.
*   **CB (Défenseur Central)** : +1 DEF.
*   **LB / RB (Latéraux)** : +1 ATT / +1 DEF.
*   **CDM (Milieu Déf.)** : +1 DEF.
*   **CM (Milieu Central)** : +1 DEF à tous les alliés visibles.
*   **CAM (Meneur)** : `MENEUR` (Effet JOUÉE : Permet une attaque immédiate avec un **AUTRE** joueur. Le CAM est marqué comme ayant agi).
*   **LM / RM (Milieux Lat.)** : +1 ATT.
*   **LW / RW (Ailiers)** : +1 ATT.
*   **ST (Buteur)** : +2 ATT.

#### **Capacités Spéciales**
*   **`MENEUR`** : Lorsqu'il est joué, permet d'effectuer une attaque immédiate avec un autre joueur déjà présent sur le terrain. Le Meneur lui-même ne peut pas attaquer durant ce tour bonus.
*   **`AGRESSIF`** : Si ce joueur perd un duel (qu'il soit attaquant ou bloqueur), la carte adverse qui a gagné le duel est également défaussée (élimination mutuelle).
*   **`BOOST1/2`** : Cartes utilisables depuis la main en défense (+1 ou +2 VAEP).

#### **Résultats du Duel**
*   **ATT > DEF (Victoire Attaque)** :
    *   Le défenseur est **retourné** (face cachée, devient "Momentum").
    *   L'attaquant reste sur le terrain.
    *   Si le défenseur a désormais **3 cartes ou plus retournées**, un **BUT MOMENTUM** est marqué.
*   **ATT < DEF (Victoire Défense)** :
    *   L'attaquant est **défaussé**.
    *   Le défenseur reste sur le terrain.
    *   **Récupération** : Le défenseur défausse une de ses cartes retournées (s'il en a) pour "nettoyer" son terrain.
*   **ATT = DEF (Match Nul)** :
    *   L'attaquant ET le défenseur sont **défaussés**.

### **5. Le But (⚽)**
Un but est marqué par "But Ouvert" ou "Momentum" (3 cartes retournées).
*   **Conséquence** :
    *   La carte ayant provoqué le but (Attaquant) est **défaussée**.
    *   Le joueur ayant encaissé **défausse toutes ses cartes retournées**.
    *   Engagement au joueur qui a encaissé.
    *   **Note** : Aucun effet `ON_ELIMINATE` (comme `AGRESSIF`) ne se déclenche suite à un but.

### **6. Fin du Match**
*   Le temps additionnel (Stoppage Time) se déclenche si un joueur n'a plus de cartes (main + deck) et **1 OU 0 carte sur le terrain**. Son adversaire peut alors jouer une dernière action.
*   Le joueur avec le plus de buts l’emporte.

---

## **II. RÈGLES DE COMPORTEMENT DE L'IA**

### **1. Playmaker / Meneur**
*   L'IA utilise l'effet Meneur pour déclencher une attaque avec un de ses meilleurs éléments déjà sur le terrain.
*   Elle comprend que le Meneur qui vient d'entrer ne peut pas être le porteur de l'attaque immédiate.

### **2. Défense Agressive**
*   L'IA prend en compte le mot-clé `AGRESSIF`. Elle peut choisir de bloquer un attaquant très puissant avec un joueur `AGRESSIF` plus faible pour provoquer une élimination mutuelle.

### **3. Absence de Bonus Momentum**
*   L'IA ne compte plus sur le bonus de +1 ATT par carte retournée (supprimé), elle base ses calculs de duels uniquement sur le VAEP brut et les bonus de poste/capacité.
