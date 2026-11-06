# Document d'Architecture Système — Pipeline IIoT End-to-End
## ENSAM Rabat — Industrie 4.0 (2026–2027)
**Encadrement : Professeure Maria ZEMZAMI**

---

## 1. Vue d'Ensemble Logique & Physique

L'architecture du projet concrétise le paradigme de l'**Industrie 4.0** en établissant une chaîne cyber-physique distribuée entre le terrain simulé, le traitement en périphérie (*Edge Computing*) et la supervision interactive (*SCADA Operations Center*).

```
[ Niveau Terrain - OT ]
  ├── motor-01 (Moteur induction 15 kW)      ──┐
  ├── motor-02 (Moteur induction 22 kW)      ──┤
  ├── pump-01 (Pompe centrifuge haute press.)──┼─► [ Mosquitto MQTT Broker ]
  ├── compressor-01 (Compresseur d'air)      ──┤     Ports: 1883 (TCP) / 9001 (WS)
  └── conveyor-01 (Convoyeur d'ensachage)    ──┘           ▲                ▲
                                                           │ (TCP 1883)     │ (WS 9001 Live Push)
[ Niveau Edge - Périphérie ]                               │                │
  Passerelle Edge Python 3.12 ─────────────────────────────┘                │
    ├── Validation Pydantic v2                                              │
    ├── Déduplication LRU 10 000 clés                                      │
    ├── Normalisation & calcul de latence transit                           │
    ├── Agrégateur 10s (Mean, Min, Max, StdDev)                            │
    ├── Moteur de règles d'anomalies (ISO 10816)                            │
    └── Buffer résilient Store-and-Forward SQLite                           │
          │                                                                 │
          ▼ (Line Protocol Ingestion)                                       │
[ Niveau Stockage - IT ]                                                    │
  InfluxDB v2.7 OSS                                                         │
    ├── Bucket 'iiot_telemetry' (Points bruts)                              │
    └── Bucket 'iiot_aggregates' (Fenêtres 10s)                             │
          │                                                                 │
          ▼ (Requêtes Flux / API Historique)                                │
[ Niveau Supervision - SCADA ]                                              │
  Dashboard Next.js 14/15 + Tailwind CSS + shadcn/ui ───────────────────────┘
    ├── Synoptique d'usine & statut en direct
    ├── Courbes de tendances Recharts avec gradients
    ├── Jauge radiale circulaire de santé machine
    ├── Console d'incidents & workflow d'acquittement (ACK)
    └── Test Lab interactif d'injection de pannes (Soutenance)
```

---

## 2. Décomposition des Composants & Responsabilités

### 2.1 Simulateur Multi-Équipements (`simulator/`)
- **Modélisation physique** : Génère des séries chronologiques avec distribution gaussienne réaliste ($\mu \pm \sigma$) calée sur les comportements nominaux de machines industrielles.
- **Déterminisme** : Graine pseudo-aléatoire (`seed`) configurable permettant la répétabilité exacte des campagnes de test requises par le protocole académique.
- **Interactivité bidirectionnelle** : Abonné au topic `ensam/iiot/+/+/+/command`, il intercepte les requêtes de pannes injectées depuis le SCADA (*surchauffe*, *balourd vibratoire*, *chute de pression*, *trame malformée*, *silence radio*) et modifie la dynamique physique des équipements ciblés.

### 2.2 Broker de Messagerie Mosquitto (`infrastructure/mosquitto/`)
- Conforme au standard **OASIS MQTT 5.0**.
- **Double écouteur** :
  - `listener 1883 0.0.0.0` (protocole binaire MQTT standard pour la télémétrie capteurs et la passerelle Edge).
  - `listener 9001 0.0.0.0` (protocole WebSockets pour l'interfaçage direct du navigateur Web sans passerelle HTTP tierce).
- Gestion de sessions persistantes et garantie de livraison **QoS 1** (At Least Once avec acquittement PUBACK).

### 2.3 Passerelle Edge Intelligente (`edge/`)
- Agit comme filtre et enrichisseur local : elle ne se contente pas de relayer les données, mais effectue des traitements à forte valeur ajoutée :
  1. *Sanitisation* : élimination immédiate des charges utiles corrompues.
  2. *Déduplication* : neutralisation des doublons réseau sans dégrader les calculs de KPI.
  3. *Agrégation fenêtrée* : réduction de l'empreinte de stockage à long terme.
  4. *Surveillance locale* : détection des dépassements de seuils sans dépendre du serveur central.
  5. *Tolérance aux pannes* : bascule automatique sur buffer SQLite local en cas de déconnexion d'InfluxDB.

### 2.4 Base de Séries Temporelles InfluxDB v2 (`infrastructure/influxdb/`)
- Moteur optimisé TSM (*Time-Structured Merge Tree*).
- Partitionnement des données en deux compartiments :
  - `iiot_telemetry` : conservation des mesures individuelles à haute fréquence pour analyse de diagnostic fine.
  - `iiot_aggregates` : conservation des fenêtres statistiques calculées (moyenne, min, max, écart-type) pour les tableaux de bord de tendance.

### 2.5 Poste de Conduite SCADA (`dashboard/`)
- Développé en React 18 / Next.js 14 avec typage TypeScript strict.
- Design System industriel inspiré du thème sombre à contrastes néon vert menthe (`#00F59B`).
- Architecture **hybride temps réel / historique** :
  - *Flux Live* : MQTT over WebSockets via `useMqttStream.ts` pour une latence d'affichage inférieure à 100 ms.
  - *Flux Historique* : Requêtes InfluxDB pour l'analyse des séries temporelles passées.

---

## 3. Comparatif Protocoles : MQTT vs OPC UA vs Sparkplug B

| Critère | MQTT 5.0 (Choisi pour le Socle) | OPC UA (Extension Industrielle) | Sparkplug B (Spécification MQTT) |
|---|---|---|---|
| **Modèle de communication** | Publish / Subscribe asynchrone | Client / Serveur + PubSub | Publish / Subscribe sur broker MQTT |
| **Poids de l'en-tête** | Très faible (2 octets minimum) | Élevé (requiert pile binaire complexe) | Faible (encodage binaire Google Protobuf) |
| **Modèle d'information** | Payload agnostique (JSON, binaire) | Modèle d'objets, nœuds et méthodes | Espace de nommage et métriques typées |
| **Découverte automatique** | Non native (définie par convention) | Native via *Address Space* | Native via messages `NBIRTH` / `DBIRTH` |
| **Adéquation Web / Cloud** | Excellente (support WebSockets direct) | Moyenne (nécessite passerelle REST/WS) | Excellente sur broker centralisé |
| **Justification du choix** | Idéal pour le prototype IIoT : légèreté, streaming Web sub-100ms et déploiement conteneurisé simple. | Pertinent en extension pour l'interfaçage avec des automates Siemens ou Schneider existants. | Piste future pour standardiser l'état des nœuds et le cycle de vie industriel. |

