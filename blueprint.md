# ⚽ 1863 FOOTBALL – RÈGLES OFFICIELLES DU JEU

> **BUT DU JEU** : Dans 1863 Football, jouez les temps forts (highlights) d'un match de football. Sélectionnez votre équipe idéale pour marquer plus de buts que l'adversaire.

---

## 🛠 MISE EN PLACE
*   **Deck** : 16 cartes.
*   **Main initiale** : Piochez **4 cartes**.
*   **Coup d'envoi** : Le joueur à **domicile** commence (avantage du terrain).

## 🎮 DÉROULEMENT DU TOUR
Au début de votre tour, piochez pour compléter votre main à **4 cartes**. Choisissez ensuite **UNE SEULE** action parmi :

1.  **JOUER** : Placez une carte de votre main face visible sur le terrain.
    *   *Limite* : Maximum **5 cartes** (actives + retournées) simultanément.
2.  **ATTAQUER** : Lancez une offensive avec un joueur déjà présent sur le terrain.

**NB** : On ne peut pas passer son tour, sauf capacité spéciale (ex: Meneur).

## ⚔️ PHASE D'ATTAQUE
L'influence (**VAEP**, de 5 à 9) détermine la probabilité de marquer ou d'encaisser.
*   **Blocage** : Si l'adversaire a des joueurs sur le terrain, il **doit** proposer un bloqueur.
*   **Modificateurs** : Les mots-clés et postes modifient les notes finales.

### Résolution du Duel
*   **ATT > DEF** : Supériorité numérique ou spatiale. La carte défenseur est **retournée** (Flipped). L'attaquant reste face visible.
*   **ATT < DEF** : L'attaquant est **défaussé**. Le défenseur reste et **défausse une carte retournée** de son camp (récupération).
*   **ATT = DEF** : Événement Exceptionnel (30-40% des buts). Sinon, les deux cartes sont **défaussées**.

## ⚽ BUTS
Il existe deux façons de marquer :
1.  **Événement spécial** : En cas de pénurie de bloqueurs ou action spécifique.
2.  **Momentum** : Dès qu'un joueur a **3 cartes retournées** ou plus sur son terrain, il encaisse un but.

### Après un But
*   La carte du **buteur** est placée dans la défausse.
*   Celui qui encaisse **défausse toutes ses cartes retournées**.
*   Le joueur qui a encaissé **reprend la main** (début de tour).

## 🏁 FIN DU MATCH
**Temps additionnel** : Déclaré si, au début de son tour, un joueur a :
*   0 carte en main AND 0 carte en pioche.
*   Maximum **1 carte active** sur le terrain (cartes retournées exclues).
Ce joueur passe son tour, offrant à l'adversaire une **ultime action** avant le sifflet final.

---

# 🏗 Blueprint du Projet : Football Card Battle

## 1. Aperçu du Projet
Application stratégique de duel de cartes de football (React/TypeScript/Zustand).

## 2. État Actuel

### 🎨 Design & UX
*   **Dark Mode** : Interface premium avec dégradés profonds.
*   **Interactivité** : Animations Framer Motion (flip, survol, feedback).
*   **Effets Visuels** : Goal, Explosion, Boost, Penalty.

### ⚙️ Moteur de Jeu
*   **Système de Duel** : Calcul dynamique incluant bonus de postes et synergies.
*   **Événements Exceptionnels** : Système de Penalty fonctionnel (déclenché par "AGRESSIF" en cas d'égalité).
*   **IA Tactique** : Gestion de l'économie, remplacement stratégique et mode survie face au Momentum.
*   **Gestion des Équipes** : Sélection nationale, boutique de packs et collection (Mercato).

### 📁 Structure des Dossiers
*   `src/core/ai` : Logique décisionnelle et hooks IA.
*   `src/core/engine` : Système d'effets (`effectSystem.ts`) et règles.
*   `src/stores/slices` : État atomique (actions, moteur, user).
*   `src/features` : Écrans fonctionnels (Game, Shop, Mercato).

### 🏷 Mots-clés & Effets de Poste (Détails)

#### **Spécialités (Keywords)**
*   **AGRESSIF** : 
    *   *En défense* : Déclenche un Penalty en cas d'égalité (ATT=DEF) si au moins une carte est retournée dans son terrain.
    *   *En duel* : Si la carte perd, elle emmène l'adversaire avec elle dans la défausse (Neutralisation).
*   **BOOST (1 ou 2)** : Carte consommable depuis la main pour ajouter +1 ou +2 à la défense lors d'un duel.
*   **AERIEN**

#### **Bonus de Poste (Défense)**
*   **GK (Gardien)** : **+2 DEF** (Le rempart ultime).
*   **CB (Défenseur Central)** : **+1 DEF**. Désactive le bonus d'un ATT adverse.
*   **LB / RB (Latéraux)** : **+1 DEF**. Également utiles pour contrer les Ailiers (LW/RW).

#### **Bonus de Poste (Milieu)**
*   **CDM (Milieu Défensif)** : **+1 DEF**.
*   **CM (Milieu central)** : Tant qu'il est actif sur le terrain, il offre **+1 DEF** à tous les autres milieux de terrain alliés (CDM, CM, CAM, LM, RM).
*   **CAM (Meneur / Meneur de Jeu)** : Lorsqu'il est joué, il permet immédiatement à un attaquant (ST, LW, RW) présent sur le terrain de lancer une action supplémentaire sans terminer le tour.

#### **Bonus de Poste (Attaque)**
*   **ST (Buteur)** : **+2 ATT** si aucun défenseur central (CB) n'est présent sur le terrain de l'adversaire, sinon **+1 ATT**.
*   **LW / RW (Ailiers)** : **+2 ATT** *uniquement* si l'adversaire ne possède aucun latéral (LB, RB, LM, RM) actif sur le terrain.
*   **LM / RM (Milieux Latéraux)** : **+1 ATT**. servent aussi de rempart contre les ailiers adverses.

## 3. Plan de Développement Actuel
1.  **Événements Statiques** : Implémenter Corner et Coup Franc (probabilités et visuels).
2.  **Audio** : Sons de stade, sifflet final, et impacts de duels.
3.  **Progression** : Niveaux, monnaie virtuelle (crédits) et déblocage de contenu.
