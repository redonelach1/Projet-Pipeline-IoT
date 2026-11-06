# Pipeline IIoT End-to-End & Poste de Conduite SCADA Temps Réel
### Master & Ingénierie Industrie 4.0 — ENSAM Rabat (2026–2027)
**Projet Académique & Industriel de Fin d'Études**  
**Encadrement : Professeure Maria ZEMZAMI**

---

[![Status](https://img.shields.io/badge/Status-Production--Ready-00F59B?style=flat-square&logo=git)](https://github.com)
[![Docker](https://img.shields.io/badge/Deployment-Docker--Compose_v2-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![Architecture](https://img.shields.io/badge/Architecture-Edge_Computing_%2B_SCADA-0A0E0C?style=flat-square)](docs/architecture.md)
[![Python](https://img.shields.io/badge/Python-3.12_Pydantic_v2-3776AB?style=flat-square&logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/SCADA-Next.js_14_shadcn%2Fui-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Mosquitto](https://img.shields.io/badge/MQTT-Mosquitto_2.0_QoS1-9C27B0?style=flat-square&logo=eclipse-mosquitto)](https://mosquitto.org)
[![InfluxDB](https://img.shields.io/badge/Time--Series-InfluxDB_v2.7-22ADF6?style=flat-square&logo=influxdb)](https://www.influxdata.com)
[![Cybersecurity](https://img.shields.io/badge/Compliance-NIST_SP_800--82_Rev.3-FF3B30?style=flat-square)](docs/security.md)

---

## Sommaire

1. [Résumé Exécutif & Problématique Industrielle](#1-résumé-exécutif--problématique-industrielle)
2. [Architecture Globale du Système](#2-architecture-globale-du-système)
3. [Cycle de Vie d'une Trame de Télémétrie](#3-cycle-de-vie-dune-trame-de-télémétrie)
4. [Passerelle Edge Intelligente & Traitements de Données](#4-passerelle-edge-intelligente--traitements-de-données)
5. [Moteur de Simulation Multi-Équipements & Modèles Physiques](#5-moteur-de-simulation-multi-équipements--modèles-physiques)
6. [Poste de Conduite SCADA Temps Réel (Next.js & shadcn/ui)](#6-poste-de-conduite-scada-temps-réel-nextjs--shadcnui)
7. [Persistance Chronologique & Modélisation InfluxDB v2](#7-persistance-chronologique--modélisation-influxdb-v2)
8. [Résultats Empiriques & Benchmarks de Performance](#8-résultats-empiriques--benchmarks-de-performance)
9. [Cybersécurité Industrielle & Conformité NIST SP 800-82 Rev. 3](#9-cybersécurité-industrielle--conformité-nist-sp-800-82-rev-3)
10. [Guide de Déploiement & Démarrage Pas à Pas](#10-guide-de-déploiement--démarrage-pas-à-pas)
11. [Scénario de Démonstration Orale (Soutenance 7 à 10 min)](#11-scénario-de-démonstration-orale-soutenance-7-à-10-min)
12. [Tests Automatisés & Assurance Qualité](#12-tests-automatisés--assurance-qualité)
13. [Arborescence du Répertoire & Organisation](#13-arborescence-du-répertoire--organisation)
14. [Dossier Documentaire d'Ingénierie](#14-dossier-documentaire-dingénierie)

---

## 1. Résumé Exécutif & Problématique Industrielle

Dans une usine connectée (**Usine 4.0**), la convergence entre les réseaux opérationnels (**OT** - *Operational Technology*) et les systèmes informatiques décisionnels (**IT** - *Information Technology*) représente un défi majeur. Les automates programmables industriels (API/PLC), capteurs et machines tournantes produisent des volumes considérables de télémétrie hétérogène à haute cadence. L'acheminement direct et passif de ce flux brut vers le Cloud ou des bases de données centrales souffre de limites critiques :
- **Saturation de la bande passante** et latences imprévisibles incompatibles avec la surveillance critique.
- **Vulnérabilité aux coupures réseau** entraînant des pertes de traçabilité irréversibles.
- **Manque de réactivité des IHM traditionnelles** basées sur des requêtes HTTP périodiques (polling) toutes les quelques secondes, inaptes à signaler une anomalie mécanique en temps réel.

### Objectifs Clés du Projet
Pour répondre à ce cahier des charges académique et industriel à l'**ENSAM Rabat**, ce projet conçoit, industrialise et conteneurise un **pipeline cyber-physique complet de bout en bout** intégrant :
1. **Simulation physique multi-machines** : 5 actifs industriels distincts modélisés avec distribution gaussienne réaliste, bruits thermomécaniques et graines pseudo-aléatoires déterministes.
2. **Messagerie industrielle standardisée** : Protocole OASIS MQTT 5.0 avec garanties de livraison QoS 1 (At Least Once) et double écouteur TCP (1883) et WebSockets natif (9001).
3. **Passerelle Edge Computing résiliente** : Nœud de calcul autonome réalisant la validation stricte de schémas (Pydantic v2), la déduplication idempotente par cache LRU, l'agrégation statistique fenêtrée sur 10 secondes, la détection déterministe d'anomalies (norme vibratoire ISO 10816), et un mécanisme de résilience *Store-and-Forward* sur disque local SQLite en cas de défaillance du réseau ou de la base.
4. **Persistance chronologique partitionnée** : Base de séries temporelles InfluxDB v2 avec compartimentation stricte entre données haute fréquence brutes (`iiot_telemetry`) et séries agrégées (`iiot_aggregates`).
5. **Poste de conduite SCADA haute performance** : Interface sur-mesure développée en **Next.js 14**, Tailwind CSS et **shadcn/ui**, connectée directement au broker en **WebSockets MQTT**, affichant le flux opérationnel avec une **latence sub-100ms** et intégrant un banc d'essai d'injection interactive de défaillances.

---

## 2. Architecture Globale du Système

L'architecture distribuée respecte la séparation en couches étanches selon le standard international **ISA-95** :

```mermaid
flowchart TD
    subgraph Layer_Simulation ["1. Couche Simulation et Terrain (Python)"]
        M1["motor-01 (Moteur induction 15 kW)"]
        M2["motor-02 (Moteur induction 22 kW)"]
        P1["pump-01 (Pompe centrifuge haute pression)"]
        C1["compressor-01 (Compresseur d'air industriel)"]
        V1["conveyor-01 (Convoyeur d'ensachage)"]
        CMD_SUB["Écouteur de Consignes et Pannes (Topic: ensam/iiot/+/+/+/command)"]
    end

    subgraph Layer_Messaging ["2. Couche Messagerie Industrielle (Mosquitto 2.0)"]
        TCP_1883["Port TCP 1883 (Télémétrie terrain et Edge QoS 1)"]
        WS_9001["Port WebSockets 9001 (Flux Web direct sub-100ms)"]
    end

    subgraph Layer_Edge ["3. Couche Passerelle Edge (Python 3.12)"]
        V_VAL["1. Validation Schéma et Bornes Physiques (Pydantic v2)"]
        V_DEDUP["2. Cache de Déduplication LRU 10 000 clés (QoS 1)"]
        V_NORM["3. Normalisation et Calcul Latence Réception"]
        V_AGG["4. Agrégateur Fenêtres Glissantes 10s"]
        V_RULE["5. Moteur Déterministe d'Anomalies (ISO 10816)"]
        V_BUF["6. Buffer Résilience Disque SQLite (Store-and-Forward)"]
    end

    subgraph Layer_Storage ["4. Couche Persistance Séries Temporelles (InfluxDB v2)"]
        BUCKET_RAW[("Bucket: iiot_telemetry (Mesures brutes normalisées)")]
        BUCKET_AGG[("Bucket: iiot_aggregates (Agrégats fenêtrés 10s)")]
    end

    subgraph Layer_SCADA ["5. Poste de Conduite SCADA (Next.js et shadcn/ui)"]
        UI_OVERVIEW["Synoptique Usine et Statut Parc (5/5)"]
        UI_CHART["Courbes Temps Réel Spline Recharts (Gradient)"]
        UI_GAUGE["Jauges Radiales Circulaires SVG (Santé Machine)"]
        UI_ALERTS["Console d'Incidents et Workflow ACK Opérateur"]
        UI_LAB["Centre d'Injection Interactive de Pannes (Jury)"]
        UI_HEALTH["Métriques Pipeline et Diagnostic Latence p95"]
    end

    M1 -->|MQTT Publish: 1883| TCP_1883
    M2 -->|MQTT Publish: 1883| TCP_1883
    P1 -->|MQTT Publish: 1883| TCP_1883
    C1 -->|MQTT Publish: 1883| TCP_1883
    V1 -->|MQTT Publish: 1883| TCP_1883
    TCP_1883 -.->|Commandes reçues| CMD_SUB

    TCP_1883 -->|MQTT Subscribe: 1883| V_VAL
    V_VAL --> V_DEDUP
    V_DEDUP --> V_NORM
    V_NORM --> V_AGG
    V_NORM --> V_RULE
    V_RULE --> V_BUF
    V_BUF -->|Line Protocol Ingestion| BUCKET_RAW
    V_AGG -->|Line Protocol Ingestion| BUCKET_AGG
    V_RULE -.->|Publish Alerte MQTT: event| TCP_1883

    WS_9001 -->|Live Push sub-100ms| UI_OVERVIEW
    WS_9001 -->|Live Push sub-100ms| UI_CHART
    WS_9001 -->|Live Push sub-100ms| UI_GAUGE
    WS_9001 -->|Live Push sub-100ms| UI_ALERTS
    BUCKET_RAW -->|Requêtes Flux API| UI_CHART
    BUCKET_AGG -->|Requêtes Flux API| UI_HEALTH
    UI_LAB -->|Publish Commandes Pannes| WS_9001
```

---

## 3. Cycle de Vie d'une Trame de Télémétrie

Le diagramme de séquence ci-après illustre le flux bidirectionnel complet entre l'émetteur physique, le filtre Edge, la base chronologique et le poste de conduite SCADA :

```mermaid
sequenceDiagram
    autonumber
    participant Sim as Simulateur Multi-Machines
    participant Mosq as Broker Mosquitto (TCP 1883)
    participant Edge as Passerelle Edge (Python 3.12)
    participant Influx as InfluxDB v2 (Time-Series)
    participant WS as Mosquitto WebSockets (Port 9001)
    participant SCADA as SCADA Dashboard (Next.js 14)

    Sim->>Mosq: MQTT Publish QoS 1 (Payload JSON télémétrie)
    Mosq-->>Sim: MQTT PUBACK (Acquittement de réception réseau)
    Mosq->>Edge: Dispatch du message vers le topic abonné
    
    activate Edge
    Note over Edge: Validation Pydantic v2 (bornes physiques), déduplication LRU, calcul latence transit, agrégation 10s et analyse ISO 10816
    
    alt Fonctionnement Nominal
        Edge->>Influx: Ingestion Line Protocol (Bucket: iiot_telemetry)
    else Dépassement de Seuil Critique (ex: Température > 90°C)
        Edge->>Mosq: MQTT Publish Alerte (Topic: .../event QoS 1)
        Edge->>Influx: Ingestion de la mesure critique
    end
    deactivate Edge

    Mosq->>WS: Relais des flux télémétrie et alarmes
    WS->>SCADA: Push WebSocket sub-100ms (Client React useMqttStream)
    SCADA->>SCADA: Rafraîchissement synoptique, courbe spline & jauge radiale

    opt Workflow d'Acquittement Opérateur (ACK)
        SCADA->>WS: Publish ACK avec note opérateur (Topic: .../event/ack)
        WS->>Mosq: Relais MQTT QoS 1
        Mosq->>Edge: Traçabilité et clôture de l'incident
    end
```

---

## 4. Passerelle Edge Intelligente & Traitements de Données

La passerelle Edge (`edge/src/main.py`) constitue le cœur logique du traitement en bordure de réseau. Elle réalise 6 opérations séquentielles à haute valeur ajoutée sans dépendre d'un serveur central distant :

```mermaid
flowchart TD
    MSG["Message Télémétrie MQTT"] --> JSON_DEC["Décodage JSON UTF-8"]
    JSON_DEC --> VAL_CHECK{"Validation Pydantic v2"}
    
    VAL_CHECK -->|Invalide / Hors Bornes| QUARANTINE["Rejet immédiat & Incrémentation métrique d'erreur"]
    VAL_CHECK -->|Valide| DEDUP_CHECK{"Cache LRU 10 000 clés"}
    
    DEDUP_CHECK -->|Doublon déjà traité| DROP_DUP["Suppression doublon (Idempotence QoS 1)"]
    DEDUP_CHECK -->|Nouvelle séquence| NORM["Normalisation & Calcul Latence Réception"]
    
    NORM --> WIN_AGG["Agrégateur Fenêtres Glissantes 10s (Moyenne, Min, Max, Ecart-type)"]
    NORM --> RULE_ENG{"Moteur Déterministe d'Anomalies (ISO 10816)"}
    
    RULE_ENG -->|Seuil critique franchi| ALARM_PUB["Publication Alarme MQTT (Topic: .../event)"]
    RULE_ENG -->|Fonctionnement nominal| BUFFER_MGR{"Vérification Connexion InfluxDB"}
    ALARM_PUB --> BUFFER_MGR
    
    BUFFER_MGR -->|Connexion active| FLUSH_INFLUX["Écriture InfluxDB v2 (Line Protocol)"]
    BUFFER_MGR -->|InfluxDB indisponible| SQLITE_STORE["Enregistrement Buffer Disque SQLite (Store-and-Forward)"]
    
    SQLITE_STORE -.->|Rétablissement réseau| DRAIN_TASK["Dépilage & Rejeu asynchrone des lots SQLite"]
    DRAIN_TASK --> FLUSH_INFLUX
```

### 4.1 Description Détaillée des Modules Edge

| Module Python | Fichier Source | Rôle & Algorithme Appliqué |
|---|---|---|
| **Validation & Intégrité** | [`validation.py`](edge/src/validation.py) | Contrôle syntaxique JSON et typage strict via **Pydantic v2**. Vérification des bornes de plausibilité physique :<br/>- Température : $[-30.0^\circ\text{C}, 180.0^\circ\text{C}]$<br/>- Pression : $[0.0\text{ bar}, 50.0\text{ bar}]$<br/>- Vibration RMS : $[0.0\text{ mm/s}, 50.0\text{ mm/s}]$<br/>- Humidité : $[0.0\%, 100.0\%]$ |
| **Déduplication Idempotente** | [`deduplication.py`](edge/src/deduplication.py) | En protocole MQTT QoS 1, les acquittements perdus provoquent des renvois légitimes. Un **cache LRU** borné à 10 000 clés indexé sur le couple `(device_id, sequence)` neutralise les doublons sans altérer les métriques statistiques. |
| **Normalisation & Transit** | [`normalization.py`](edge/src/normalization.py) | Horodatage de réception UTC précis (`edge_received_at`) et calcul instantané de la latence réseau de transit :<br/>$$\text{Latence Transit} = T_{\text{Edge}} - T_{\text{Capteur}}$$ |
| **Agrégation Glissante 10s** | [`aggregation.py`](edge/src/aggregation.py) | Maintien en mémoire d'une fenêtre temporelle glissante de 10 secondes par équipement. Calcul statistique en continu : $\mu$ (Moyenne), $\min$, $\max$, $\sigma$ (Écart-type) et volume d'échantillons. Injection dédiée dans le compartiment `iiot_aggregates`. |
| **Moteur d'Anomalies** | [`anomaly_rules.py`](edge/src/anomaly_rules.py) | Moteur de règles déterministes explicables :<br/>- **Thermique** : Warning $> 80^\circ\text{C}$, Critical $> 90^\circ\text{C}$<br/>- **Vibratoire (ISO 10816-3)** : Warning $> 4.0\text{ mm/s}$, Critical $> 5.5\text{ mm/s}$ (rupture imminente)<br/>- **Pression** : Warning $< 2.5\text{ bar}$ ou $> 9.5\text{ bar}$ |
| **Buffer Store-and-Forward** | [`storage.py`](edge/src/storage.py) | Tolérance aux pannes certifiée NIST SP 800-82 : bascule instantanée sur base persistante SQLite locale (`/app/data/edge_buffer.db`) en cas de coupure InfluxDB, puis vidage ordonné automatique par lots de 500 points à la reprise. |

### 4.2 Machine à États de la Résilience *Store-and-Forward*

```mermaid
stateDiagram-v2
    [*] --> Mode_Nominal : Démarrage Passerelle Edge
    
    state Mode_Nominal {
        [*] --> Ingestion_Directe
        Ingestion_Directe --> InfluxDB_Flush : Écriture Line Protocol directe (Port 8086)
    }
    
    Mode_Nominal --> Mode_Bufferise : Détection coupure InfluxDB (Erreur HTTP / Timeout)
    
    state Mode_Bufferise {
        [*] --> Ecriture_SQLite
        Ecriture_SQLite --> File_Attente : Insertion transactionnelle (/app/data/edge_buffer.db)
        File_Attente --> Test_Ping : Sondage périodique santé InfluxDB
    }
    
    Mode_Bufferise --> Phase_Reconciliation : InfluxDB opérationnel (Ping HTTP 204 OK)
    
    state Phase_Reconciliation {
        [*] --> Depilage_Lots
        Depilage_Lots --> Rejeu_Chronologique : Envoi par lots ordonnés de 500 points
        Rejeu_Chronologique --> Purge_Disque : Validation acquittement écriture
    }
    
    Phase_Reconciliation --> Mode_Nominal : Buffer SQLite entièrement vidé
```

---

## 5. Moteur de Simulation Multi-Équipements & Modèles Physiques

Le simulateur industriel (`simulator/src/`) est développé en Python 3.12 asynchrone (`asyncio`). Il émule le comportement de 5 actifs de production avec dynamique physique continue, injection de bruit blanc gaussien et répétabilité exacte grâce à des graines déterministes (`seed`).

### 5.1 Calibrage des Équipements de la Flotte

| Identifiant Machine | Type d'Actif Industriel | Emplacement ISA-95 | Température ($\mu \pm \sigma$) | Pression ($\mu \pm \sigma$) | Vibration RMS ($\mu \pm \sigma$) | Humidité ($\mu \pm \sigma$) | Fréquence |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| `motor-01` | Moteur induction 15 kW | `site-a/line-1` | $65.0 \pm 1.8^\circ\text{C}$ | $1.00 \pm 0.05\text{ bar}$ | $2.10 \pm 0.15\text{ mm/s}$ | $42.0 \pm 1.2\%$ | 1.0 Hz |
| `motor-02` | Moteur induction 22 kW | `site-a/line-2` | $72.0 \pm 2.2^\circ\text{C}$ | $1.02 \pm 0.04\text{ bar}$ | $2.60 \pm 0.20\text{ mm/s}$ | $44.0 \pm 1.5\%$ | 1.0 Hz |
| `pump-01` | Pompe centrifuge HP | `site-a/line-1` | $58.0 \pm 1.5^\circ\text{C}$ | $6.20 \pm 0.30\text{ bar}$ | $1.80 \pm 0.12\text{ mm/s}$ | $52.0 \pm 1.8\%$ | 1.0 Hz |
| `compressor-01` | Compresseur d'air bi-étagé | `site-a/line-2` | $78.0 \pm 2.5^\circ\text{C}$ | $8.40 \pm 0.35\text{ bar}$ | $3.20 \pm 0.25\text{ mm/s}$ | $36.0 \pm 1.0\%$ | 1.0 Hz |
| `conveyor-01` | Convoyeur d'ensachage | `site-a/line-2` | $45.0 \pm 1.0^\circ\text{C}$ | $1.00 \pm 0.02\text{ bar}$ | $1.40 \pm 0.10\text{ mm/s}$ | $40.0 \pm 1.0\%$ | 1.0 Hz |

### 5.2 Formule de Synthèse Physique
Pour chaque variable $X$, la valeur générée à l'instant $t$ obéit à la loi :
$$X(t) = \mu_X + \sigma_X \cdot \mathcal{N}(0, 1) + \Delta_{\text{anomalie}}(t)$$
où $\Delta_{\text{anomalie}}(t)$ est activé dynamiquement par l'écouteur de consignes `CMD_SUB` sur le topic `ensam/iiot/+/+/+/command`.

---

## 6. Poste de Conduite SCADA Temps Réel (Next.js & shadcn/ui)

Le tableau de bord de supervision SCADA (`dashboard/`) s'affranchit des rafraîchissements HTTP lents pour adopter une architecture **réactive en temps réel sub-100ms** pilotée par WebSockets MQTT.

```mermaid
flowchart TB
    subgraph Browser_Client ["Client Web Navigateur (Port 3000)"]
        direction TB
        Hook["useMqttStream.ts (Client MQTT over WebSockets 9001)"]
        State["État Réactif Global (Machines, Télémétrie, Alarmes, KPIs)"]
        
        subgraph UI_Components ["Composants SCADA shadcn/ui"]
            C_Nav["Sidebar & TopBar (Navigation & Statut de connexion)"]
            C_Kpi["KpiMetricBar (4 compteurs temps réel)"]
            C_Chart["TelemetryAreaChart (Courbes Spline Recharts & Gradients)"]
            C_Gauge["RadialGauge (Indice de santé global SVG)"]
            C_Alerts["IncidentResponseTable (Journal d'alarmes & Modal ACK)"]
            C_Lab["TestLabPanel (Injection interactive de consignes de pannes)"]
        end
    end

    Broker_WS["Mosquitto Broker WebSockets (Port 9001)"] <-->|Streaming sub-100ms| Hook
    Hook --> State
    State --> C_Nav
    State --> C_Kpi
    State --> C_Chart
    State --> C_Gauge
    State --> C_Alerts
    C_Lab -->|Publication Ordre de Panne| Hook
```

### 6.1 Spécifications Ergonomiques & Charte Graphique
- **Palette Visuelle** : Thème sombre matte (fond charbon `#070B09`, cartes `#0D1411`, délimitations `#1A2821`) avec accents néon vert menthe / émeraude (`#00F59B` / `#10B981`).
- **Contraste & Accessibilité** : Ratio de contraste mesuré à **13.56:1**, surpassant largement les exigences **WCAG AA** (minimum 4.5:1).
- **Courbes Spline Recharts** : Tracé continu lissé (`monotone`) avec dégradés vert néon semi-transparents (`opacity: 0.25 -> 0.00`).
- **Jauge Circulaire Radiale** : Indicateur de santé machine circulaire SVG calculé en temps réel selon la sévérité des dérives mécaniques.
- **Workflow ACK Opérateur** : Boîte de dialogue modale permettant à l'opérateur d'acquitter une alarme avec horodatage et consignation de son motif d'intervention.

---

## 7. Persistance Chronologique & Modélisation InfluxDB v2

L'architecture sépare hermétiquement les données brutes haute fréquence des agrégats statistiques pour préserver la mémoire et accélérer les requêtes d'analyse :

| Compartiment (Bucket) | Rétention Configurée | Fréquence d'Écriture | Rôle & Usage | Format Line Protocol |
|---|---|---|---|---|
| `iiot_telemetry` | 7 jours | 1.0 Hz (Continu) | Diagnostic fin, analyse post-mortem et tracé temps réel des signaux bruts. | `telemetry,device_id=motor-01,site_id=site-a,line_id=line-1 temperature_c=68.42,pressure_bar=1.02,vibration_mm_s=2.15,transit_latency_ms=1.45 1730907000125000000` |
| `iiot_aggregates` | 90 jours | 0.1 Hz (Toutes les 10s) | Tableaux de bord de tendances, calculs d'OEE (*Overall Equipment Effectiveness*) et métriques long terme. | `telemetry_10s_agg,device_id=motor-01,metric=temperature_c mean=68.12,min=65.40,max=70.80,stddev=1.24,count=10i 1730907010000000000` |

---

## 8. Résultats Empiriques & Benchmarks de Performance

Les performances ont été mesurées rigoureusement sur la pile conteneurisée via le banc d'essai automatisé [`scripts/run_benchmark.py`](scripts/run_benchmark.py). Les résultats démontrent la supériorité opérationnelle du protocole MQTT QoS 1 :

| Critère de Performance | Mode QoS 0 (At Most Once) | Mode QoS 1 (At Least Once + PUBACK) | Exigence Cahier des Charges | Conformité |
|---|:---:|:---:|:---:|:---:|
| **Taux de Livraison Réseau** | **100.0 %** | **100.0 %** | $\ge 99.0\%$ | **CONFORME** |
| **Débit Soutenu d'Ingestion** | **93.87 msg/s** | **89.90 msg/s** | $\ge 10.0\text{ msg/s}$ | **CONFORME (+799%)** |
| **Latence Moyenne ($\mu$)** | **2.07 ms** | **28.86 ms** | $< 100\text{ ms}$ | **CONFORME** |
| **Latence Médiane (p50)** | **2.01 ms** | **31.73 ms** | $< 100\text{ ms}$ | **CONFORME** |
| **Latence 95ᵉ Centile (p95)** | **3.43 ms** | **53.71 ms** | **$< 100.0\text{ ms}$ (NF-01)** | **CONFORME (Marge 46.3%)** |
| **Latence 99ᵉ Centile (p99)** | **4.56 ms** | **78.10 ms** | $< 150.0\text{ ms}$ | **CONFORME** |
| **Taux de Perte de Paquets** | **0.00 %** | **0.00 %** | $0.00\%$ | **CONFORME** |
| **Déduplication Idempotente** | Non applicable | **100.0 % des doublons filtrés** | $100.0\%$ | **CONFORME** |

> [!NOTE]
> Le rapport complet des mesures empiriques et des tests de résilience réseau est disponible dans le document [`docs/experiments.md`](docs/experiments.md).

---

## 9. Cybersécurité Industrielle & Conformité NIST SP 800-82 Rev. 3

Le système intègre nativement les principes de sécurité des réseaux industriels OT définis par le **NIST SP 800-82 Rev. 3** :

```mermaid
flowchart LR
    subgraph Zone_Interne ["Réseau Privé Interne OT - iiot_network"]
        SIM["Simulateur Python (appuser)"]
        EDGE["Passerelle Edge Python (appuser)"]
        MOSQ["Mosquitto Broker TCP 1883"]
        INFLUX["InfluxDB Time-Series 8086"]
    end

    subgraph Zone_DMZ_Web ["Zone de Supervision - Hôte Local"]
        DASH["Dashboard SCADA Next.js (nextjs)"]
        BROWSER["Navigateur Opérateur :3000"]
    end

    SIM -->|Port 1883 - Télémétrie brute| MOSQ
    MOSQ -->|Port 1883 - Ingestion filtrée| EDGE
    EDGE -->|Port 8086 - Ingestion Line Protocol| INFLUX
    EDGE -.->|Port 1883 - Événements alarmes| MOSQ

    MOSQ -->|Port 9001 - WebSockets Live Stream| DASH
    INFLUX -->|Port 8086 - Requêtes Flux Historique| DASH
    BROWSER <-->|Port 3000 - HTTP IHM| DASH
```

### Matrice de Défense en Profondeur
1. **Segmentation Réseau Docker (`iiot_network`)** : Le port binaire MQTT 1883 n'est exposé à aucun réseau public externe ; les conteneurs communiquent sur un sous-réseau privé isolé.
2. **Moindre Privilège (*Least Privilege*)** : Aucun conteneur ne tourne en utilisateur `root`. Le code Python s'exécute sous `appuser` (UID 1000) et le frontend Next.js sous `nextjs` (UID 1001).
3. **Validation Stricte des Entrées** : Le parseur Pydantic v2 rejette immédiatement toute tentative d'injection de trame corrompue sans impacter la mémoire vive ni la base de données.
4. **Idempotence & Anti-Rejeu** : La clé composite `(device_id, sequence)` mémorisée sur 10 000 clés prévient toute injection frauduleuse de paquets rejoués.

---

## 10. Guide de Déploiement & Démarrage Pas à Pas

### Prérequis Système
- **Docker Engine** : version 24.0 ou supérieure.
- **Docker Compose** : version v2.20 ou supérieure.
- **Ressources Minimales** : 4 Go de mémoire RAM, 2 cœurs CPU, 5 Go d'espace disque disponible.

### Déploiement Complet en Une Seule Commande
À la racine du projet cloné, exécutez :

```bash
docker compose up -d --build
```

Cette commande démarre les 5 conteneurs orchestrés avec gestion automatique des dépendances et healthchecks :
- `ensam_iiot_mosquitto` : Broker MQTT 5.0 (ports 1883 et 9001)
- `ensam_iiot_influxdb` : Base de séries temporelles v2 (port 8086)
- `ensam_iiot_simulator` : Générateur de télémétrie multi-machines
- `ensam_iiot_edge` : Passerelle de calcul et détection d'anomalies
- `ensam_iiot_dashboard` : IHM SCADA Next.js (port 3000)

### Matrice des Points d'Accès & Identifiants

| Service | Protocole & Port | URL / Point d'Accès | Identifiants d'Authentification |
|---|---|---|---|
| **Supervision SCADA Web** | HTTP (3000) | [http://localhost:3000](http://localhost:3000) | Accès direct libre (Rôle Opérateur SCADA) |
| **Console InfluxDB v2** | HTTP (8086) | [http://localhost:8086](http://localhost:8086) | **Utilisateur** : `ensam_admin`<br/>**Mot de passe** : `ensam_industrie40_password`<br/>**Organisation** : `ensam`<br/>**Token API** : `ensam_super_secret_admin_token_2026_industrie40` |
| **Broker MQTT (Télémétrie)** | TCP (1883) | `localhost:1883` | Réservé aux échanges M2M conteneurisés |
| **Broker MQTT (WebSockets)** | WS (9001) | `ws://localhost:9001` | Utilisé par le hook React `useMqttStream.ts` |

Pour stopper proprement l'ensemble des conteneurs :
```bash
docker compose down
```

Pour réinitialiser complètement la pile et les volumes de données :
```bash
docker compose down -v
```

---

## 11. Scénario de Démonstration Orale (Soutenance 7 à 10 min)

Ce protocole pas-à-pas est spécialement conçu pour guider la présentation devant le jury d'examen de l'ENSAM :

| Minute | Phase de Démonstration | Actions Concrètes à Réaliser | Message Clé à Transmettre au Jury |
|:---:|---|---|---|
| **0 - 1** | **Introduction & Architecture** | Présenter le schéma global ISA-95 et expliquer le rôle de l'Edge Computing pour éviter la saturation du Cloud. | Continuité numérique OT/IT sans goulot d'étranglement. |
| **1 - 2** | **Poste de Conduite SCADA** | Ouvrir [http://localhost:3000](http://localhost:3000). Montrer la vue **Plant Overview** avec les 5 machines actives en vert `RUNNING`. | Streaming WebSockets natif sub-100ms sans aucun rafraîchissement passif par polling. |
| **2 - 4** | **Exploration d'un Actif** | Cliquer sur `motor-01`. Examiner les courbes spline Recharts en dégradé émeraude et la jauge radiale de santé. | Analyse multi-variables physique avec précision industrielle. |
| **4 - 6** | **Laboratoire d'Injection de Pannes** | 1. Naviguer vers l'onglet **Test Lab & Fault Injector**.<br/>2. Cibler `motor-01` et cliquer sur **Inject Thermal Fault** ($T > 90^\circ\text{C}$).<br/>3. Observer le basculement instantané du voyant d'alarme sur l'IHM. | Réactivité immédiate du moteur de règles déterministes Edge. |
| **6 - 7** | **Workflow d'Acquittement (ACK)** | Ouvrir la **Console d'Incidents**, ouvrir la fenêtre modale d'acquittement, renseigner le motif *« Intervention mécanique effectuée »*, et valider. | Traçabilité rigoureuse conforme aux exigences d'exploitation industrielle. |
| **7 - 8** | **Filtrage de Sécurité Quarantaine** | Dans le Test Lab, cliquer sur **Inject Bad Payload**. Afficher les logs de la passerelle (`docker logs ensam_iiot_edge --tail 10`). | Prouver l'interception et le rejet par Pydantic sans crash ni pollution de base. |
| **8 - 9** | **Tolérance aux Pannes & Résilience** | Stopper InfluxDB (`docker stop ensam_iiot_influxdb`). Observer le buffer SQLite actif. Relancer InfluxDB et constater le rejeu immédiat sans perte. | Résilience *Store-and-Forward* conforme NIST SP 800-82. |
| **9 - 10** | **Conclusion & Métriques** | Ouvrir l'onglet **Pipeline Health** pour synthétiser les KPIs : 0% de perte, latence p95 = 53.71 ms, débit > 90 msg/s. | Respect à 100% du cahier des charges ENSAM Industrie 4.0. |

---

## 12. Tests Automatisés & Assurance Qualité

### 12.1 Suite de Tests Unitaires Python (pytest)
Couvre l'intégralité des algorithmes de validation, normalisation, déduplication et règles d'anomalies :

```bash
python -m pytest tests/ -v
```

Rapport d'exécution validé :
```text
tests/test_anomaly_rules.py::test_temperature_critical_alert PASSED      [  9%]
tests/test_anomaly_rules.py::test_vibration_warning_alert PASSED         [ 18%]
tests/test_anomaly_rules.py::test_window_aggregator_calculation PASSED   [ 27%]
tests/test_simulator.py::test_device_initialization_and_reproducibility PASSED [ 36%]
tests/test_simulator.py::test_thermal_overheat_scenario PASSED           [ 45%]
tests/test_simulator.py::test_vibration_spike_scenario PASSED            [ 54%]
tests/test_simulator.py::test_corrupted_payload_scenario PASSED          [ 63%]
tests/test_validation.py::test_valid_payload_ingestion PASSED            [ 72%]
tests/test_validation.py::test_malformed_json_rejected PASSED            [ 81%]
tests/test_validation.py::test_physical_bounds_violation_rejected PASSED [ 90%]
tests/test_validation.py::test_idempotent_deduplication PASSED           [100%]

============================= 11 passed in 1.41s ==============================
```

### 12.2 Suite de Tests E2E SCADA Dashboard
Vérifie 115 assertions d'interface, d'ergonomie, de rendu des composants et d'accessibilité WCAG AA :

```bash
cd dashboard && node scripts/run_e2e_tests.mjs
```

---

## 13. Arborescence du Répertoire & Organisation

```text
.
├── docs/                               # Dossier documentaire d'ingénierie
│   ├── architecture.md                 # Document d'architecture système détaillée
│   ├── data_model.md                   # Spécification formelle du modèle de données & topics ISA-95
│   ├── security.md                     # Analyse cybersécurité OT conforme NIST SP 800-82 Rev. 3
│   └── experiments.md                  # Rapport d'expérimentations, benchmarks et résilience
├── dashboard/                          # Poste de conduite SCADA (Next.js 14, Tailwind, shadcn/ui)
│   ├── src/
│   │   ├── app/                        # App Router (layout.tsx, page.tsx, globals.css, not-found.tsx)
│   │   ├── components/                 # Composants d'interface modulaires
│   │   │   ├── layout/                 # Sidebar.tsx, TopBar.tsx
│   │   │   ├── scada/                  # KpiMetricBar.tsx, TelemetryAreaChart.tsx, RadialGauge.tsx,
│   │   │   │                           # TestLabPanel.tsx, IncidentResponseTable.tsx
│   │   │   └── views/                  # PlantOverview, DeviceDetail, AlertConsole, TestLab, PipelineMetrics
│   │   ├── hooks/                      # useMqttStream.ts (Client WebSocket MQTT sub-100ms)
│   │   └── types/                      # Interfaces TypeScript strictes (iiot.ts)
│   ├── Dockerfile                      # Image Docker multi-stage optimisée standalone
│   └── package.json
├── edge/                               # Passerelle Edge Computing (Python 3.12)
│   ├── src/
│   │   ├── validation.py               # Contrôles de schémas et bornes physiques (Pydantic v2)
│   │   ├── deduplication.py            # Filtre de déduplication LRU 10 000 entrées (Idempotence)
│   │   ├── normalization.py            # Horodatage UTC et calcul de latence de transit
│   │   ├── aggregation.py              # Calculs statistiques sur fenêtres glissantes de 10s
│   │   ├── anomaly_rules.py            # Moteur de règles ISO 10816 et seuils thermiques
│   │   ├── storage.py                  # Client InfluxDB v2 & file de résilience SQLite Store-and-Forward
│   │   ├── edge_models.py              # Modèles de données typés de la passerelle
│   │   └── main.py                     # Boucle asynchrone et consommateur MQTT
│   └── Dockerfile
├── simulator/                          # Simulateur d'équipements industriels (Python 3.12)
│   ├── src/
│   │   ├── devices.py                  # Modèles physiques (Moteurs, Pompe, Compresseur, Convoyeur)
│   │   ├── sim_models.py               # Schémas de télémétrie et commandes
│   │   ├── mqtt_publisher.py           # Publication MQTT QoS 1 & écouteur d'injections
│   │   └── main.py                     # Point d'entrée de la simulation multi-machines
│   └── Dockerfile
├── infrastructure/
│   └── mosquitto/
│       └── config/mosquitto.conf       # Configuration Mosquitto (Ports 1883 TCP + 9001 WS)
├── tests/                              # Suite de tests automatisés pytest
│   ├── test_simulator.py
│   ├── test_validation.py
│   └── test_anomaly_rules.py
├── scripts/
│   └── run_benchmark.py                # Banc de mesure automatisé de débit et latence
├── docker-compose.yml                  # Déploiement multi-conteneurs unifié
├── .env.example                        # Gabarit des variables d'environnement
├── Specifications_Guide_Projet_IIoT_ENSAM.md # Spécifications maîtresse détaillée du projet
└── README.md                           # Ce document
```

---

## 14. Dossier Documentaire d'Ingénierie

Pour approfondir les détails de conception et les analyses spécialisées, consulter les documents de référence :
- [Document d'Architecture Système](docs/architecture.md) : Diagrammes de flux, modélisation détaillée et comparatif MQTT / OPC UA / Sparkplug B.
- [Modèle de Données & Schémas JSON](docs/data_model.md) : Arborescence ISA-95 des topics MQTT, validation Pydantic v2 et calibrage physique nominal.
- [Rapport de Cybersécurité OT](docs/security.md) : Modélisation des menaces et conformité aux directives NIST SP 800-82 Rev. 3.
- [Campagne de Mesures & Benchmarks](docs/experiments.md) : Analyse comparative QoS 0 vs QoS 1, latence p95, débit et validation de la résilience *Store-and-Forward*.
- [Spécifications Générales ENSAM](Specifications_Guide_Projet_IIoT_ENSAM.md) : Cahier des charges exhaustif du projet de master.
