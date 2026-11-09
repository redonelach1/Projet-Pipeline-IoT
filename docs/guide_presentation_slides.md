# Guide de Réalisation du Diaporama de Soutenance (19 Slides)
## Pipeline IIoT End-to-End & Poste de Conduite SCADA Temps Réel
### Master & Ingénierie Industrie 4.0 — ENSAM Rabat (2026–2027)
**Encadrement : Professeure Maria ZEMZAMI**  
**Équipe de Projet : 6 Intervenants** | **Durée Totale : 18 à 20 minutes**

---

> [!IMPORTANT]
> Ce guide fournit la trame intégrale pour concevoir les diapositives de présentation (PowerPoint, Google Slides, Canva ou LaTeX Beamer). Chaque slide est documentée avec son titre, son orateur assigné, sa disposition graphique recommandée, son contenu textuel exact, son script oratoire (*verbatim*) et la phrase de transition vers l'intervenant suivant.

---

## Sommaire

1. [Charte Graphique & Règles de Conception Visuelle](#1-charte-graphique--règles-de-conception-visuelle)
2. [Matrice de Répartition des Rôles (6 Personnes)](#2-matrice-de-répartition-des-rôles-6-personnes)
3. [Fiches Détaillées Diapositive par Diapositive (Slides 1 à 19)](#3-fiches-détaillées-diapositive-par-diapositive-slides-1-à-19)
   - [Bloc 1 : Cadrage & Architecture Globale (Étudiant 1)](#bloc-1--cadrage--architecture-globale-étudiant-1)
   - [Bloc 2 : Modélisation Physique & Simulation Terrain (Étudiant 2)](#bloc-2--modélisation-physique--simulation-terrain-étudiant-2)
   - [Bloc 3 : Messagerie Industrielle & Réseau (Étudiant 3)](#bloc-3--messagerie-industrielle--réseau-étudiant-3)
   - [Bloc 4 : Passerelle Edge Computing & Résilience (Étudiant 4)](#bloc-4--passerelle-edge-computing--résilience-étudiant-4)
   - [Bloc 5 : Stockage Chronologique & Poste SCADA (Étudiant 5)](#bloc-5--stockage-chronologique--poste-scada-étudiant-5)
   - [Bloc 6 : Benchmarks, Cybersécurité, Démo Live & Conclusion (Étudiant 6)](#bloc-6--benchmarks-cybersécurité-démo-live--conclusion-étudiant-6)
4. [Protocole de Démonstration en Direct (Régie & Manipulation)](#4-protocole-de-démonstration-en-direct-régie--manipulation)
5. [Stratégie Collective pour la Session de Questions / Réponses](#5-stratégie-collective-pour-la-session-de-questions--réponses)

---

## 1. Charte Graphique & Règles de Conception Visuelle

Pour assurer une cohérence visuelle parfaite entre le diaporama et le poste de conduite SCADA développé :

- **Palette de Couleurs** :
  - *Arrière-plan principal* : Noir charbon profond (`#070B09`) ou gris anthracite très sombre (`#0D1411`).
  - *Cartes et conteneurs* : Fond sombre légèrement contrasté (`#121B16`) avec bordures fines capillaires (`#1A2821`).
  - *Couleur d'accent primaire* : Vert menthe néon émeraude (`#00F59B` ou `#10B981`) pour les titres majeurs, métriques positives et validations.
  - *Couleur d'alerte critique* : Rouge vif (`#FF4D4D`) pour les pannes et les seuils critiques ISO 10816.
  - *Typographie* : Police sans-serif moderne, épurée et géométrique (Inter, Montserrat, ou Roboto).
- **Règle d'or de composition** :
  - **Moins de texte, plus de schémas** : Ne jamais mettre de paragraphes entiers. Privilégier des listes à puces de 3 à 5 mots-clés forts par puce.
  - **Mise en valeur des métriques** : Les chiffres d'ingénierie majeurs (ex: `53.71 ms`, `90 msg/s`, `100%`) doivent être écrits en grand format (taille 36 à 48 pt) en vert néon.
  - **Diagrammes clairs** : Exporter les diagrammes d'architecture et de flux en haute résolution (PNG avec fond transparent ou SVG).

---

## 2. Matrice de Répartition des Rôles (6 Personnes)

| Intervenant | Rôle d'Ingénierie Spécialisé | Périmètre Technique | Slides Assignées | Temps de Parole |
|:---:|---|---|:---:|:---:|
| **Étudiant 1** | **Architecte Système & Coordinateur** | Cadrage stratégique, problématique de rupture OT/IT, objectifs ENSAM et architecture globale ISA-95 | **Slides 1, 2, 3** | **3 min 00 s** |
| **Étudiant 2** | **Ingénieur Simulation Cyber-Physique** | Modélisation physique des 5 équipements, distribution gaussienne, déterminisme et récepteur d'injections | **Slides 4, 5, 6** | **2 min 45 s** |
| **Étudiant 3** | **Ingénieur Réseaux & Protocoles IIoT** | Messagerie OASIS MQTT 5.0, fiabilité QoS 1, architecture double écouteur TCP/WS et taxonomie ISA-95 | **Slides 7, 8, 9** | **2 min 45 s** |
| **Étudiant 4** | **Ingénieur Edge Computing & Résilience** | Pipeline Edge (Pydantic v2, déduplication LRU, agrégats 10s, ISO 10816) et résilience *Store-and-Forward* | **Slides 10, 11, 12** | **3 min 30 s** |
| **Étudiant 5** | **Ingénieur Time-Series & Lead SCADA** | Persistance InfluxDB v2 (*Dual-Bucket*), comparatif Next.js vs Grafana, streaming WebSockets et IHM shadcn/ui | **Slides 13, 14, 15** | **3 min 30 s** |
| **Étudiant 6** | **Ingénieur Validation, Sécurité & QA** | Résultats empiriques (p95 = 53.71 ms), cybersécurité NIST SP 800-82, pilotage de la démo live et conclusion | **Slides 16, 17, 18, 19** | **4 min 00 s** |

---

## 3. Fiches Détaillées Diapositive par Diapositive (Slides 1 à 19)

---

### Bloc 1 : Cadrage & Architecture Globale (Étudiant 1)

#### Slide 1 : Titre & Identification du Projet
- **Orateur** : Étudiant 1
- **Disposition visuelle** : Logo ENSAM Rabat en haut à gauche, titre percutant au centre en vert néon `#00F59B`, badges technologiques au bas (Docker, Python 3.12, MQTT 5.0, InfluxDB v2, Next.js 14, NIST SP 800-82), liste des 6 étudiants et mention de l'encadrement par la Professeure Maria ZEMZAMI.
- **Contenu textuel** :
  - *Titre* : Pipeline IIoT End-to-End & Poste de Conduite SCADA Temps Réel
  - *Sous-titre* : Architecture Cyber-Physique Distribuée, Edge Computing Résilient et Supervision Industrielle sub-100ms
  - *Cadre* : Master & Diplôme d'Ingénieur — Industrie 4.0 (Promotion 2026–2027)
  - *Établissement* : ENSAM Rabat (École Nationale Supérieure d'Arts et Métiers)
  - *Encadrante* : Pr. Maria ZEMZAMI
- **Script oratoire (Verbatim)** :
  > « Madame la Professeure, honorables membres du jury, bonjour. Nous avons le plaisir de vous présenter aujourd'hui l'aboutissement de notre projet d'ingénierie Industrie 4.0 consacré à la mise en œuvre d'un pipeline cyber-physique complet de bout en bout. Notre objectif a été de concevoir un système industriel distribué, 100% conteneurisé, capable d'ingérer et d'analyser la télémétrie de machines en périphérie Edge, tout en offrant aux opérateurs un poste de conduite SCADA réactif sous les 100 millisecondes. »

---

#### Slide 2 : Contexte Industriel & Défi de la Rupture OT / IT
- **Orateur** : Étudiant 1
- **Disposition visuelle** : Schéma en sablier divisé en deux mondes : en bas le monde opérationnel OT (automates, capteurs haute fréquence, criticité temps réel), en haut le monde informationnel IT (cloud, bases de données, décisionnel). Au milieu, matérialiser les 3 verrous technologiques par des icônes d'avertissement.
- **Contenu textuel** :
  - **Volume & Fréquence massifs** : Télémétrie brute continue générant des gigaoctets de bruit non qualifié.
  - **Saturation de la bande passante** : L'envoi aveugle de flux bruts vers le Cloud asphyxie les liens réseau industriels.
  - **Latence d'alerte inadmissible** : Délais de plusieurs secondes des IHM traditionnelles incompatibles avec l'arrêt d'urgence.
  - **Pertes sur coupure réseau** : Absence de mémoire tampon locale détruisant la continuité de traçabilité.
- **Script oratoire (Verbatim)** :
  > « Dans l'usine moderne, la convergence entre l'OT et l'IT se heurte à des verrous majeurs. Déverser passivement les flux bruts de capteurs vers des serveurs centraux ou le Cloud est une erreur d'ingénierie : cela sature la bande passante, encombre les bases de données d'échantillons redondants, et surtout, en cas de perturbation réseau, des pans entiers de production deviennent aveugles. Il est impératif de décentraliser le traitement, d'assainir la donnée à la périphérie et de garantir la réactivité locale. »

---

#### Slide 3 : Architecture Globale du Système (Modèle ISA-95)
- **Orateur** : Étudiant 1
- **Disposition visuelle** : Le grand schéma d'architecture en 5 couches étanches avec flèches directionnelles et protocoles annotés.
- **Contenu textuel** :
  - **1. Couche Simulation OT** : 5 équipements industriels distincts avec dynamique physique continue.
  - **2. Messagerie Industrielle** : Broker Mosquitto 2.0 (Port TCP 1883 pour flux M2M + Port WebSockets 9001).
  - **3. Passerelle Edge Computing** : Validation Pydantic v2, déduplication LRU, agrégats 10s et buffer SQLite.
  - **4. Persistance Chronologique** : InfluxDB v2 avec compartimentage double (*Dual-Bucket*).
  - **5. Poste SCADA Temps Réel** : Dashboard Next.js 14 / shadcn/ui avec streaming direct sub-100ms.
- **Script oratoire (Verbatim)** :
  > « Pour répondre à ce défi, nous avons conçu cette architecture distribuée conforme au standard international ISA-95. La donnée naît sur le terrain simulé, transite via un broker MQTT Mosquitto avec double écouteur TCP et WebSockets, subit un traitement rigoureux sur notre passerelle Edge Python, alimente une base de séries temporelles InfluxDB, et s'affiche instantanément sur notre poste de conduite SCADA. Je cède la parole à [Nom Étudiant 2] pour vous présenter la modélisation de notre parc de machines. »
- **Transition** :
  > « Je passe la parole à [Nom Étudiant 2], qui va vous détailler la couche terrain et la modélisation physique de nos équipements. »

---

## Bloc 2 : Modélisation Physique & Simulation Terrain (Étudiant 2)

#### Slide 4 : Approche Cyber-Physique & Rigueur Scientifique
- **Orateur** : Étudiant 2
- **Disposition visuelle** : Graphique comparatif entre un bruit blanc aléatoire uniforme (courbe erratique en pointillés rouges) et une vraie dynamique physique avec inertie thermique et bruit gaussien (courbe continue verte lissée). Encadré avec la formule mathématique de Box-Muller.
- **Contenu textuel** :
  - **Simulation physique réaliste** : Modélisation mathématique continue avec bruit gaussien $\mathcal{N}(0, 1)$.
  - **Déterminisme scientifique** : Graines pseudo-aléatoires fixes (`seed`) assurant la répétabilité stricte des campagnes de test.
  - **Moteur asynchrone non-bloquant** : Développé en Python 3.12 (`asyncio`) pour garantir la cadence de 1 Hz sans dérive temporelle.
- **Script oratoire (Verbatim)** :
  > « Merci [Nom Étudiant 1]. En ingénierie de pointe, un simulateur ne doit jamais être un simple générateur d'entiers aléatoires. Les grandeurs mécaniques et thermiques d'une machine tournante obéissent aux lois de la thermodynamique et présentent des bruits de mesure gaussiens. Nous avons donc modélisé nos équipements selon une loi normale centrée sur leur point de fonctionnement nominal. Pour satisfaire à la rigueur de la démarche académique demandée par l'ENSAM, chaque équipement est initialisé avec une graine fixe, assurant la parfaite répétabilité de nos benchmarks. »

---

#### Slide 5 : Calibrage Nominal de la Flotte des 5 Actifs Industriels
- **Orateur** : Étudiant 2
- **Disposition visuelle** : Tableau structuré présentant les 5 équipements avec leurs icônes vectorielles, affectation ISA-95 (Site A, Lignes 1 & 2) et paramètres nominaux ($\mu \pm \sigma$).
- **Contenu textuel** :
  - `motor-01` (15 kW) : $T = 65.0 \pm 1.8^\circ\text{C}$ | Vibration RMS = $2.10 \pm 0.15\text{ mm/s}$
  - `motor-02` (22 kW) : $T = 72.0 \pm 2.2^\circ\text{C}$ | Vibration RMS = $2.60 \pm 0.20\text{ mm/s}$
  - `pump-01` (Pompe HP) : $P = 6.20 \pm 0.30\text{ bar}$ | $T = 58.0 \pm 1.5^\circ\text{C}$
  - `compressor-01` : $P = 8.40 \pm 0.35\text{ bar}$ | Vibration RMS = $3.20 \pm 0.25\text{ mm/s}$
  - `conveyor-01` : $T = 45.0 \pm 1.0^\circ\text{C}$ | Cadence continue 1.0 Hz
- **Script oratoire (Verbatim)** :
  > « Notre parc représente une ligne de production manufacturière complète : deux moteurs d'entraînement de forte puissance, une pompe centrifuge haute pression pour le refroidissement, un compresseur d'air pour l'alimentation pneumatique et un convoyeur d'ensachage. Chaque équipement génère à chaque seconde un payload JSON v1.0 standardisé, comprenant un horodatage UTC à la milliseconde, les quatre grandeurs physiques, son statut opérationnel et un identifiant séquentiel incrémental. »

---

#### Slide 6 : Interactivité Bidirectionnelle & Récepteur d'Injections (`CMD_SUB`)
- **Orateur** : Étudiant 2
- **Disposition visuelle** : Schéma du flux de commande interactif : Déclenchement sur l'IHM $\rightarrow$ Publication MQTT sur `command` $\rightarrow$ Réception asynchrone par `CMD_SUB` $\rightarrow$ Modification de la matrice physique en temps réel.
- **Contenu textuel** :
  - **Abonnement temps réel** : Écouteur asynchrone sur `ensam/iiot/+/+/+/command`.
  - **5 Scénarios d'anomalies pilotables** :
    1. *Surchauffe thermique* : Dérive progressive au-delà de $90^\circ\text{C}$.
    2. *Balourd vibratoire* : Rupture de roulement simulant un pic $> 5.5\text{ mm/s}$.
    3. *Chute de pression* : Fuite hydraulique simulant $P < 2.0\text{ bar}$.
    4. *Trame malformée* : Injection de JSON corrompu pour test de robustesse.
    5. *Silence radio* : Coupure simulant une perte totale de communication.
- **Script oratoire (Verbatim)** :
  > « Notre simulateur n'est pas un flux passif à sens unique. Il intègre une tâche d'écoute active sur le topic de consignes. Lorsque l'opérateur ou le jury déclenche un ordre depuis le panneau de test SCADA, le simulateur intercepte l'ordre et altère dynamiquement la dynamique physique de la machine ciblée. Cela nous permet d'observer en direct la réactivité de toute la chaîne de traitement. Je laisse [Nom Étudiant 3] vous expliquer comment cette télémétrie est acheminée. »
- **Transition** :
  > « Je passe la parole à [Nom Étudiant 3] pour vous détailler la couche de messagerie industrielle et le protocole MQTT. »

---

## Bloc 3 : Messagerie Industrielle & Réseau (Étudiant 3)

#### Slide 7 : Choix du Protocole : Pourquoi OASIS MQTT 5.0 ?
- **Orateur** : Étudiant 3
- **Disposition visuelle** : Tableau comparatif sur 4 critères : MQTT 5.0 vs HTTP REST vs OPC UA vs Sparkplug B. Mettre en valeur la ligne MQTT 5.0 avec des bordures vertes néon.
- **Contenu textuel** :
  - **Légèreté de l'en-tête** : 2 octets minimum contre $> 500$ octets en HTTP avec en-têtes verbeux.
  - **Découplage Publish/Subscribe** : Absence de dépendance directe entre producteurs et consommateurs.
  - **Efficacité réseau** : Connexions TCP persistantes à faible consommation d'énergie et de bande passante.
  - **Streaming Web natif** : Encapsulation WebSockets standard sans passerelle de transcodage lourde.
- **Script oratoire (Verbatim)** :
  > « Merci [Nom Étudiant 2]. En milieu industriel, le protocole HTTP classique est exclu pour la télémétrie haute fréquence : le coût de renégociation des connexions et la taille des en-têtes asphyxient les automates. OPC UA, bien qu'excellent pour dialoguer avec des automates d'atelier, est trop complexe et inadapté au navigateur Web. Nous avons choisi le standard international OASIS MQTT 5.0. Il offre un découplage total, une empreinte réseau de seulement deux octets par trame et une compatibilité directe avec les applications modernes. »

---

#### Slide 8 : Fiabilité & Garantie de Livraison : L'Arbitrage de la QoS 1
- **Orateur** : Étudiant 3
- **Disposition visuelle** : Schéma temporel comparant les 3 niveaux de QoS : QoS 0 (perte aveugle), QoS 2 (quadruple échange lourd) et QoS 1 (échange équilibré PUBLISH $\rightarrow$ PUBACK).
- **Contenu textuel** :
  - **QoS 0 (At Most Once)** : Risque de perte silencieuse inacceptable pour des alarmes de sécurité.
  - **QoS 2 (Exactly Once)** : Surcoût de latence élevé ($> 150\text{ ms}$) lié aux 4 paquets d'échange.
  - **QoS 1 (At Least Once)** : Garantie formelle de livraison avec acquittement PUBACK immédiat.
  - **Traitement des doublons** : Neutralisés en aval par le cache de déduplication Edge.
- **Script oratoire (Verbatim)** :
  > « Le choix de la Qualité de Service (QoS) est un arbitrage d'ingénierie fondamental. En QoS 0, une micro-coupure réseau entraîne la perte définitive d'une alerte critique. À l'opposé, la QoS 2 triple la latence et divise le débit par trois en raison d'une poignée de main à quatre étapes. Nous avons retenu la QoS 1 : le broker émet un accusé de réception PUBACK pour chaque trame. Si l'accusé tarde, la trame est réémise. Et pour éliminer le risque inhérent de doublons, nous avons implémenté un filtre de déduplication sur notre passerelle Edge. »

---

#### Slide 9 : Architecture Double Écouteur & Taxonomie des Topics ISA-95
- **Orateur** : Étudiant 3
- **Disposition visuelle** : Schéma du conteneur Mosquitto 2.0 avec ses deux ports ouverts (1883 TCP et 9001 WebSockets), et arbre généalogique des topics d'usine selon la norme ISA-95.
- **Contenu textuel** :
  - **Port TCP 1883** : Échanges machine-à-machine (M2M) binaire rapide pour les conteneurs internes.
  - **Port WebSockets 9001** : Flux direct vers le navigateur Next.js sans passerelle HTTP tierce.
  - **Hiérarchie ISA-95 normalisée** :
    `ensam/iiot/{site_id}/{line_id}/{device_id}/{stream_type}`
  - **Typologie des 5 flux** : `telemetry`, `status`, `event`, `event/ack`, `command`.
- **Script oratoire (Verbatim)** :
  > « Notre broker Mosquitto 2.0 est configuré avec un double écouteur : le port 1883 en TCP binaire pour le dialogue haute cadence entre le simulateur et l'Edge, et le port 9001 en WebSockets permettant au navigateur d'ingérer le flux brut en temps réel. Nos topics sont organisés selon le modèle ISA-95, garantissant une séparation rigoureuse par site, ligne et équipement. Je cède la parole à [Nom Étudiant 4] pour vous présenter le cerveau du système : notre passerelle Edge. »
- **Transition** :
  > « Je passe la parole à [Nom Étudiant 4], qui va vous détailler l'Edge Computing et ses mécanismes de tolérance aux pannes. »

---

## Bloc 4 : Passerelle Edge Computing & Résilience (Étudiant 4)

#### Slide 10 : Pourquoi l'Edge Computing ? Le Pipeline de Calcul Local
- **Orateur** : Étudiant 4
- **Disposition visuelle** : Diagramme séquentiel des 4 premiers traitements Edge : Validation Pydantic v2 $\rightarrow$ Déduplication LRU $\rightarrow$ Normalisation & Latence $\rightarrow$ Agrégation 10s.
- **Contenu textuel** :
  - **1. Validation Pydantic v2** : Contrôle de syntaxe JSON et bornes physiques strictes (rejet sans crash).
  - **2. Déduplication Idempotente** : Cache LRU borné à 10 000 clés composite `(device_id, sequence)` en $O(1)$.
  - **3. Normalisation & Calcul de Latence** : $\Delta t_{\text{transit}} = T_{\text{Edge}} - T_{\text{Capteur}}$ conservant l'horodatage initial.
  - **4. Agrégation Temporelle Glissante 10s** : Calcul continu de $\mu, \min, \max, \sigma$ et $N$.
- **Script oratoire (Verbatim)** :
  > « Merci [Nom Étudiant 3]. La passerelle Edge constitue le nœud d'intelligence décentralisée du projet. Au lieu de stocker aveuglément des téraoctets de mesures brutes, l'Edge assainit le flux en bordure de réseau. Dès réception, Pydantic v2 valide le typage et vérifie les bornes physiques plausibles : une température aberrante de 500 degrés est immédiatement isolée. Ensuite, un cache LRU de 10 000 clés élimine les doublons de transport. L'Edge calcule alors la latence exacte de transit et met à jour des fenêtres glissantes de 10 secondes. »

---

#### Slide 11 : Détection Déterministe d'Anomalies (Norme ISO 10816-3)
- **Orateur** : Étudiant 4
- **Disposition visuelle** : Graphique de la norme vibratoire ISO 10816-3 découpé en zones de couleur (Zone A/B admissible $\le 4.0\text{ mm/s}$ en vert, Zone C dégradation $4.0 - 5.5\text{ mm/s}$ en orange, Zone D danger critique $> 5.5\text{ mm/s}$ en rouge), avec les seuils thermiques en vis-à-vis.
- **Contenu textuel** :
  - **Norme ISO 10816-3 (Machines tournantes industrielles)** :
    - $v_{\text{RMS}} \le 4.0\text{ mm/s}$ : Fonctionnement nominal admissible.
    - $4.0 < v_{\text{RMS}} \le 5.5\text{ mm/s}$ : Zone C $\rightarrow$ Seuil `WARNING` (alerte préventive).
    - $v_{\text{RMS}} > 5.5\text{ mm/s}$ : Zone D $\rightarrow$ Seuil `CRITICAL` (rupture mécanique imminente).
  - **Seuils Thermiques** : $T > 80^\circ\text{C}$ (WARNING), $T > 90^\circ\text{C}$ (CRITICAL).
  - **Publication d'alerte** : Émission instantanée sur `event` reçue en sub-100ms par le SCADA.
- **Script oratoire (Verbatim)** :
  > « Pour détecter les pannes, nous nous sommes appuyés sur la norme internationale ISO 10816-3 relative aux vibrations des machines industrielles. Au-delà de 4 mm/s RMS, le palier mécanique commence à se dégrader et l'Edge lève un avertissement. Au-delà de 5.5 mm/s, le risque de casse est critique : l'Edge émet en moins de 2 millisecondes une alarme sur le broker MQTT. Cette détection locale garantit que même si le réseau extérieur vacille, la décision de sécurité est prise instantanément au pied de la machine. »

---

#### Slide 12 : Résilience *Store-and-Forward* sur Disque SQLite
- **Orateur** : Étudiant 4
- **Disposition visuelle** : Diagramme de la machine à états : Mode Nominal (Flush InfluxDB) $\rightarrow$ Coupure réseau détectée $\rightarrow$ Mode Bufferisé (Écriture SQLite locale `/app/data/edge_buffer.db`) $\rightarrow$ Reprise réseau $\rightarrow$ Dépilage et purge ordonnée par lots de 500 points.
- **Contenu textuel** :
  - **Conformité NIST SP 800-82 Rev. 3** : Garantie de continuité de service OT.
  - **Détection d'incident** : Bascule immédiate sur SQLite local en cas d'échec HTTP d'écriture InfluxDB.
  - **Dépilage ordonné** : Taux de rejeu automatique de **> 210 points/seconde** lors de la reconnexion.
  - **Intégrité temporelle** : Conservation stricte des timestamps d'origine, aucune mesure perdue.
- **Script oratoire (Verbatim)** :
  > « Que se passe-t-il si InfluxDB s'arrête ou subit une rupture de liaison ? Dans une architecture ordinaire, les données sont perdues. Notre passerelle intègre un mécanisme Store-and-Forward certifié NIST SP 800-82 : en cas de coupure, l'Edge consigne les points dans une base SQLite locale sur disque. Dès qu'InfluxDB redevient joignable, un thread d'arrière-plan dépile chronologiquement les lots de 500 mesures à plus de 210 points par seconde. Le buffer se vide en moins d'une seconde et demie, avec zéro perte de données. Je passe la parole à [Nom Étudiant 5] pour vous présenter le stockage et l'IHM. »
- **Transition** :
  > « Je passe la parole à [Nom Étudiant 5] pour aborder la persistance chronologique et le poste de conduite SCADA. »

---

## Bloc 5 : Stockage Chronologique & Poste SCADA (Étudiant 5)

#### Slide 13 : Persistance InfluxDB v2 & Stratégie *Dual-Bucket*
- **Orateur** : Étudiant 5
- **Disposition visuelle** : Schéma comparant les deux buckets d'InfluxDB avec leurs politiques de rétention et leurs usages : `iiot_telemetry` (haute fréquence, 7 jours) vs `iiot_aggregates` (basse fréquence calculée, 90 jours).
- **Contenu textuel** :
  - **Moteur TSM (Time-Structured Merge Tree)** : Débit d'écriture optimal pour séries temporelles.
  - **Compartiment 1 (`iiot_telemetry`)** : Mesures brutes à 1 Hz, rétention 7j (diagnostic haute résolution).
  - **Compartiment 2 (`iiot_aggregates`)** : Agrégats 10s à 0.1 Hz, rétention 90j (tendances & calculs OEE).
  - **Gain de performance** : Réduction de 90% du volume disque et requêtes historiques accélérées par 10.
- **Script oratoire (Verbatim)** :
  > « Merci [Nom Étudiant 4]. Pour archiver nos données, un SGBD relationnel classique aurait été surchargé par les millions d'inserts. Nous avons déployé InfluxDB v2 avec son moteur TSM dédié aux séries temporelles. Notre innovation réside dans notre architecture Dual-Bucket : les données brutes haute fréquence sont conservées 7 jours pour le diagnostic d'incident, tandis que les agrégats calculés par l'Edge sont historisés sur 90 jours. Cette politique de Data Tiering évite l'explosion du stockage et permet d'exécuter des requêtes annuelles quasi-instantanées. »

---

#### Slide 14 : Pourquoi Remplacer Grafana par Next.js 14 et shadcn/ui ?
- **Orateur** : Étudiant 5
- **Disposition visuelle** : Tableau comparatif percutant sur 4 critères majeurs : Grafana standard vs Poste SCADA Next.js 14 développé dans le projet.
- **Contenu textuel** :
  - **Mécanisme de rafraîchissement** : Polling HTTP passif (Grafana, 1-5s) vs **WebSockets MQTT direct sub-100ms** (Next.js).
  - **Latence d'affichage** : $> 1 000\text{ ms}$ (Grafana) vs **$53.71\text{ ms}$** (Notre SCADA).
  - **Injection active de pannes** : Impossible dans Grafana (lecture seule) vs **Test Lab intégré** (Next.js).
  - **Workflow d'acquittement** : Inexistant nativement vs **Modale interactive d'ACK opérateur avec traçabilité**.
- **Script oratoire (Verbatim)** :
  > « À l'origine, le projet envisageait un tableau de bord Grafana. Or, Grafana repose sur un modèle d'interrogation périodique HTTP de la base de données : il introduit un retard incompressible de plusieurs secondes et ne permet aucune interaction. Nous avons donc pris le parti audacieux de concevoir notre propre poste de conduite SCADA sous Next.js 14 et shadcn/ui. Connecté directement au broker en WebSockets, notre SCADA affiche les mesures avec une latence de 53 millisecondes et offre un laboratoire d'injection de pannes et un système d'acquittement d'alarmes en temps réel. »

---

#### Slide 15 : Design System Industriel & Composants Opérationnels
- **Orateur** : Étudiant 5
- **Disposition visuelle** : Capture d'écran annotée du tableau de bord mettant en valeur les 4 zones : le bandeau KPI horizontal, les courbes spline Recharts avec dégradé vert émeraude, la jauge radiale SVG et la console d'incidents.
- **Contenu textuel** :
  - **Charte visuelle sombre matte** : Fond charbon (`#070B09`), accents néon vert menthe (`#00F59B`).
  - **Contraste certifié WCAG AA** : Ratio de contraste mesuré à **13.56:1** (seuil exigé : 4.5:1).
  - **Courbes Spline Recharts** : Interpolation lissée `monotone` avec remplissage `<linearGradient>` translucide.
  - **Jauge radiale circulaire SVG** : Calcul temps réel de l'indice de santé de l'installation.
  - **Console d'incidents & ACK** : Traçabilité des interventions opérateur avec publication MQTT.
- **Script oratoire (Verbatim)** :
  > « L'ergonomie a été soignée selon les critères stricts des salles de contrôle industrielles. Nous avons adopté un thème sombre matte anti-reflet avec des accents émeraude, certifié conforme aux normes d'accessibilité WCAG AA avec un ratio de contraste de 13.56 pour 1. Les courbes utilisent une interpolation spline continue sans saccade, et une jauge radiale circulaire synthétise en permanence la santé globale du parc. Je laisse [Nom Étudiant 6] vous présenter les chiffres de performance et piloter la démonstration en direct. »
- **Transition** :
  > « Je passe la parole à [Nom Étudiant 6] pour la présentation des benchmarks, de la cybersécurité et de la démonstration live. »

---

## Bloc 6 : Benchmarks, Cybersécurité, Démo Live & Conclusion (Étudiant 6)

#### Slide 16 : Banc d'Essai Expérimental & Résultats de Benchmarks
- **Orateur** : Étudiant 6
- **Disposition visuelle** : Tableau comparatif QoS 0 vs QoS 1 issu du script `run_benchmark.py` avec jauges vertes de validation des exigences ENSAM.
- **Contenu textuel** :
  - **Débit soutenu d'ingestion** : **89.90 msg/s** en QoS 1 ($\ge 10\text{ msg/s}$ exigé $\rightarrow$ **+799%**).
  - **Latence au 95ᵉ centile (p95)** : **53.71 ms** ($< 100\text{ ms}$ exigé $\rightarrow$ **Marge de 46.3%**).
  - **Taux de livraison réseau** : **100.0%** (0.00% de perte de paquets).
  - **Filtrage des doublons** : **100.0%** des paquets réémis interceptés par le cache LRU.
  - **Cadence de reprise Store & Forward** : **> 210 points/seconde** (vidage en 1.42 s).
- **Script oratoire (Verbatim)** :
  > « Merci [Nom Étudiant 5]. Pour valider empiriquement notre architecture, nous avons exécuté notre outil de benchmark automatisé. Les mesures confirment l'excellence du système : le débit soutenu atteint 90 messages par seconde, soit 9 fois la cible du cahier des charges. Surtout, la latence au 95ᵉ centile s'établit à 53.71 millisecondes, offrant une marge de sécurité de 46% sous le plafond des 100 millisecondes imposé par l'exigence NF-01, avec un taux de perte strictement nul. »

---

#### Slide 17 : Cybersécurité Opérationnelle (NIST SP 800-82 Rev. 3)
- **Orateur** : Étudiant 6
- **Disposition visuelle** : Matrice de défense en profondeur montrant le périmètre Docker isolé `iiot_network`, l'absence de privilèges root et les mécanismes de filtrage amont.
- **Contenu textuel** :
  - **Triade de sécurité OT** : Priorité absolue à la **Disponibilité (A)** et l'**Intégrité (I)** sur la Confidentialité.
  - **Segmentation réseau Docker (`iiot_network`)** : Port 1883 interne, aucun accès public depuis Internet.
  - **Principe du moindre privilège** : Conteneurs Python sous `appuser` (1000) et Next.js sous `nextjs` (1001).
  - **Défense contre les cyberattaques** :
    - *Anti-Rejeu* : Cache LRU composite `(device_id, sequence)`.
    - *Anti-Injection* : Validation Pydantic stricte des types et des bornes physiques.
    - *Anti-Déni de Service* : Tampon SQLite local Store-and-Forward.
- **Script oratoire (Verbatim)** :
  > « La cybersécurité du pipeline applique les directives du guide NIST SP 800-82 Rev. 3. Contrairement à l'informatique de gestion, les réseaux opérationnels exigent avant tout la disponibilité et l'intégrité pour garantir la sûreté physique des installations. Les échanges M2M sont isolés au sein d'un réseau privé Docker inaccessible depuis l'extérieur. Aucun conteneur ne tourne avec les privilèges root, et notre passerelle filtre nativement les injections de trames malveillantes et les attaques par rejeu. »

---

#### Slide 18 : Démonstration en Direct devant le Jury (2 à 3 minutes)
- **Orateur** : Étudiant 6 (accompagné par l'équipe pour la manipulation)
- **Disposition visuelle** : Écran partagé réel avec à gauche le SCADA Web ([http://localhost:3000](http://localhost:3000)) et à droite le terminal Docker pour afficher les logs en direct.
- **Protocole d'Exécution en 5 Étapes** :
  1. *Régime nominal* : Montrer les 5 machines en vert `RUNNING` et le débit temps réel.
  2. *Injection thermique* : Déclencher une surchauffe sur `motor-01` ($T > 90^\circ\text{C}$) et observer le basculement instantané en `CRITICAL` rouge néon.
  3. *Acquittement opérateur (ACK)* : Ouvrir la modale d'acquittement, renseigner le rapport d'intervention et valider.
  4. *Quarantaine de sécurité* : Injecter une trame malformée et montrer l'interception par Pydantic dans les logs (`docker logs ensam_iiot_edge --tail 5`).
  5. *Résilience Store & Forward* : Arrêter InfluxDB (`docker stop ensam_iiot_influxdb`), constater l'absorption locale SQLite, relancer InfluxDB et observer le rejeu immédiat sans perte.
- **Script oratoire (Verbatim)** :
  > « Nous vous proposons maintenant de constater ces performances en direct sur notre banc d'essai conteneurisé. [L'orateur commente les actions pendant qu'un coéquipier manipule la souris]. Comme vous le voyez, la détection de la panne thermique est immédiate, l'intervention humaine est tracée, le paquet corrompu est isolé sans crash, et la résilience locale préserve l'intégralité des mesures lors d'une panne du stockage central. »

---

#### Slide 19 : Bilan des Compétences, Perspectives & Conclusion
- **Orateur** : Étudiant 6 (Conclusion avec l'ensemble du groupe)
- **Disposition visuelle** : Schéma bilan synthétisant les acquis d'ingénierie ENSAM et feuille de route technologique pour le déploiement sur site industriel réel.
- **Contenu textuel** :
  - **Bilan d'ingénierie** :
    - 100% des exigences fonctionnelles et non-fonctionnelles validées.
    - 11/11 tests unitaires Python validés, 115/115 tests E2E SCADA validés.
    - Performance temps réel certifiée : **53.71 ms < 100 ms**.
  - **Perspectives industrielles** :
    - Activation de TLS 1.3 avec certificats mutuels (mTLS) sur le port 8883.
    - Intégration de modèles d'IA embarquée (*TinyML*) pour la maintenance prédictive.
    - Standardisation Sparkplug B avec payloads Google Protobuf.
- **Script oratoire (Conclusion finale)** :
  > « En conclusion, ce projet concrétise l'ensemble des enseignements de notre formation en Industrie 4.0 à l'ENSAM Rabat : de l'automatisme et la thermodynamique des machines jusqu'au développement Web réactif, en passant par le calcul distribué Edge et la cybersécurité. Notre système est conteneurisé, reproductible et prêt pour une mise à l'échelle industrielle.  
  > Nous adressons nos remerciements les plus sincères à notre encadrante, la Professeure Maria ZEMZAMI, pour son accompagnement, ainsi qu'aux membres du jury pour votre attention. Nous sommes à présent à votre disposition pour répondre à toutes vos questions. »

---

## 4. Protocole de Démonstration en Direct (Régie & Manipulation)

Pendant la présentation du **Slide 18**, la coordination entre les membres doit être millimétrée :

- **Orateur principal (Étudiant 6)** : Garde la parole, regarde le jury et commente ce qui se passe à l'écran.
- **Pilote de la souris (Étudiant 5)** : A la main sur l'interface SCADA. Il clique calmement sur les boutons au moment exact où Étudiant 6 les annonce.
- **Pilote du terminal (Étudiant 4)** : A la main sur la fenêtre PowerShell / Bash. Il exécute les commandes Docker `docker logs` et `docker stop/start ensam_iiot_influxdb`.

---

## 5. Stratégie Collective pour la Session de Questions / Réponses

Lors de la séance de questions du jury qui suit la présentation, l'**Étudiant 1** (coordinateur) distribue calmement la parole au spécialiste de la couche concernée pour démontrer la maîtrise technique de chaque membre :

| Thématique de la Question du Jury | Spécialiste Attitré | Référence pour la Réponse |
|---|:---:|---|
| Modélisation physique, inertie thermique, graines déterministes | **Étudiant 2** | `simulator/src/devices.py` & Section 5 du README |
| Protocole MQTT, poignée de main QoS 1, ports Mosquitto, topics ISA-95 | **Étudiant 3** | `docs/data_model.md` & `infrastructure/mosquitto/` |
| Traitement Edge, Pydantic v2, cache LRU, agrégats 10s, norme ISO 10816, SQLite | **Étudiant 4** | `edge/src/` & `docs/guide_soutenance.md` (Q3, Q4, Q7, Q9) |
| Time-Series InfluxDB, stratégie Dual-Bucket, choix Next.js vs Grafana | **Étudiant 5** | `docs/architecture.md` & `docs/guide_soutenance.md` (Q1, Q6) |
| Latence p95, benchmark empirique, cybersécurité NIST, reprise après panne | **Étudiant 6** | `docs/experiments.md` & `docs/security.md` |
