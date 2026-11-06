# End-to-End Industrial IoT Pipeline (IIoT 4.0)
## Capteurs Simulés → Passerelle Edge Intelligente → Supervision SCADA Temps Réel
**École Nationale Supérieure d'Arts et Métiers — ENSAM Rabat**  
**Module : Industrie 4.0 — Année Académique 2026–2027**  
**Encadrement : Professeure Maria ZEMZAMI**

---

## 1. Résumé Exécutif & Problématique Industrielle

Dans une installation industrielle moderne, les données issues des capteurs, machines tournantes et automates programmables industriels (API) sont souvent dispersées, hétérogènes et volumineuses. L'architecture **Industrie 4.0** requiert une continuité numérique sans rupture entre le niveau opérationnel (OT) et le niveau informationnel (IT).

Ce projet implémente un système cyber-physique complet, reproductible et conteneurisé démontrant la chaîne complète :
1. **Simulation de machines industrielles** produisant des signaux physiques réalistes (thermique, pression, vibration mécanique RMS, humidité) avec bruit gaussien et graines déterministes.
2. **Transport de télémétrie léger** via le protocole OASIS MQTT 5.0 avec garanties de livraison QoS 1.
3. **Traitement distribué en périphérie (Edge Computing Gateway)** : validation stricte de schémas, déduplication idempotente, calcul d'agrégats temporels glissants sur fenêtres de 10 secondes, détection d'anomalies explicable par moteur de règles, et mécanisme de résilience *Store-and-Forward* sur disque SQLite en cas d'interruption du stockage.
4. **Persistance chronologique** dans la base de séries temporelles InfluxDB v2 avec partitionnement en deux compartiments distincts (données brutes et agrégats calculés).
5. **Supervision SCADA interactive** : un tableau de bord sur-mesure développé en Next.js 14/15, Tailwind CSS et composants shadcn/ui. L'interface abandonne le modèle de rafraîchissement passif par interrogation de base de données pour adopter une connexion directe au broker via **WebSockets MQTT (port 9001)**, offrant un affichage sub-100ms ainsi qu'un laboratoire interactif d'injection de pannes pour la soutenance orale.

---

## 2. Architecture Globale du Système

```mermaid
flowchart TD
    subgraph Layer_Simulation [1. Couche Simulation & Terrain (Python)]
        M1["motor-01 (Moteur induction)"]
        M2["motor-02 (Moteur induction)"]
        P1["pump-01 (Pompe centrifuge)"]
        C1["compressor-01 (Compresseur d'air)"]
        V1["conveyor-01 (Convoyeur industriel)"]
        CMD_SUB["Écouteur de Consignes & Pannes<br/>(Sub: ensam/iiot/+/+/+/command)"]
    end

    subgraph Layer_Messaging [2. Couche Messagerie Industrielle (Mosquitto 2.0)]
        TCP_1883["Port TCP 1883<br/>(Télémétrie backend QoS 1)"]
        WS_9001["Port WebSockets 9001<br/>(Streaming IHM sub-100ms)"]
    end

    subgraph Layer_Edge [3. Couche Passerelle Edge (Python 3.12)]
        V_VAL["1. Validation Schéma & Bornes Physiques (Pydantic v2)"]
        V_DEDUP["2. Cache de Déduplication LRU 10 000 clés (QoS 1)"]
        V_NORM["3. Normalisation & Calcul Latence Réception"]
        V_AGG["4. Agrégateur Fenêtres Glissantes 10s"]
        V_RULE["5. Moteur Déterministe d'Anomalies"]
        V_BUF["6. Buffer Résilience Disque SQLite (Store-and-Forward)"]
    end

    subgraph Layer_Storage [4. Couche Persistance Séries Temporelles (InfluxDB v2)]
        BUCKET_RAW[("Bucket: iiot_telemetry<br/>(Mesures brutes normalisées)")]
        BUCKET_AGG[("Bucket: iiot_aggregates<br/>(Agrégats fenêtrés 10s)")]
    end

    subgraph Layer_SCADA [5. Poste de Conduite SCADA (Next.js + shadcn/ui)]
        UI_OVERVIEW["Synoptique Usine & Statut Parc (5/5)"]
        UI_CHART["Courbes Temps Réel Spline Recharts (Gradient)"]
        UI_GAUGE["Jauges Radiales Circulaires SVG (Santé Machine)"]
        UI_ALERTS["Console d'Incidents & Workflow ACK Opérateur"]
        UI_LAB["Centre d'Injection Interactive de Pannes (Jury)"]
        UI_HEALTH["Métriques Pipeline & Diagnostic Latence p95"]
    end

    M1 & M2 & P1 & C1 & V1 -->|MQTT Publish: 1883| TCP_1883
    TCP_1883 -.->|Commandes reçues| CMD_SUB

    TCP_1883 -->|MQTT Subscribe: 1883| V_VAL
    V_VAL --> V_DEDUP --> V_NORM --> V_AGG --> V_RULE --> V_BUF
    V_BUF -->|Line Protocol Ingestion| BUCKET_RAW
    V_AGG -->|Line Protocol Ingestion| BUCKET_AGG
    V_RULE -.->|Publish Alerte MQTT: event| TCP_1883

    WS_9001 ==>|Live Push sub-100ms| UI_OVERVIEW & UI_CHART & UI_GAUGE & UI_ALERTS
    BUCKET_RAW & BUCKET_AGG -->|Requêtes Flux API| UI_CHART & UI_HEALTH
    UI_LAB ==>|Publish Commandes Pannes| WS_9001
```

---

## 3. Modèle de Données & Convention de Nommage

### 3.1 Convention des Topics MQTT
La hiérarchie des topics respecte la structuration normalisée des sites industriels :

| Rôle | Modèle de Topic | Exemple Concret |
|---|---|---|
| **Télémétrie périodique** | `ensam/iiot/{site_id}/{line_id}/{device_id}/telemetry` | `ensam/iiot/site-a/line-1/motor-01/telemetry` |
| **État de disponibilité** | `ensam/iiot/{site_id}/{line_id}/{device_id}/status` | `ensam/iiot/site-a/line-1/pump-01/status` |
| **Événements & Alarmes** | `ensam/iiot/{site_id}/{line_id}/{device_id}/event` | `ensam/iiot/site-a/line-1/motor-01/event` |
| **Acquittement alarme** | `ensam/iiot/{site_id}/{line_id}/{device_id}/event/ack` | `ensam/iiot/site-a/line-1/motor-01/event/ack` |
| **Commandes de test** | `ensam/iiot/{site_id}/{line_id}/{device_id}/command` | `ensam/iiot/site-a/line-1/motor-01/command` |

### 3.2 Schéma JSON de Télémétrie (v1.0)
Chaque trame publiée par le simulateur est validée par Pydantic v2 selon le contrat suivant :

```json
{
  "schema_version": "1.0",
  "message_id": "motor-01-00001234",
  "device_id": "motor-01",
  "site_id": "site-a",
  "line_id": "line-1",
  "sequence": 1234,
  "timestamp": "2026-11-06T15:30:00.125Z",
  "measurements": {
    "temperature_c": 68.42,
    "pressure_bar": 1.02,
    "vibration_mm_s": 2.15,
    "humidity_pct": 42.10
  },
  "machine_state": "RUNNING",
  "quality": "GOOD"
}
```

---

## 4. Traitements Réalisés par la Passerelle Edge

La passerelle Edge (`edge/src/main.py`) constitue le nœud de calcul intermédiaire entre le terrain et la persistance :

1. **Validation & Filtrage d'intégrité (`validation.py`)** :
   - Contrôle syntaxique JSON et typage strict via Pydantic v2.
   - Validation des bornes physiques plausibles :
     - Température : $[-30.0^\circ\text{C}, 180.0^\circ\text{C}]$
     - Pression : $[0.0\text{ bar}, 50.0\text{ bar}]$
     - Vibration RMS : $[0.0\text{ mm/s}, 50.0\text{ mm/s}]$
     - Humidité relative : $[0.0\%, 100.0\%]$
   - Quarantaine immédiate des trames corrompues avec incrémentation des compteurs de rejet.
2. **Déduplication Idempotente (`deduplication.py`)** :
   - Avec MQTT QoS 1, des paquets redélivrés peuvent survenir lors de reconnexions.
   - Un cache LRU borné à 10 000 clés mémorise les couples `(device_id, sequence)` pour éliminer les doublons sans impacter les indicateurs de performance.
3. **Normalisation & Métadonnées (`normalization.py`)** :
   - Horodatage de réception ISO 8601 UTC (`edge_received_at`).
   - Calcul de la latence de transit en millisecondes : $\text{Latence} = T_{\text{Edge}} - T_{\text{Capteur}}$.
4. **Agrégation Temporelle 10 Secondes (`aggregation.py`)** :
   - Calcul sur fenêtres glissantes des statistiques : moyenne, minimum, maximum, écart-type et nombre d'échantillons.
   - Écriture séparée dans le bucket InfluxDB `iiot_aggregates` pour soulager l'historisation longue durée.
5. **Moteur Déterministe d'Alarmes (`anomaly_rules.py`)** :
   - **Thermique** : Avertissement à $> 80^\circ\text{C}$, Alarme Critique à $> 90^\circ\text{C}$.
   - **Vibratoire (Norme ISO 10816)** : Avertissement à $> 4.0\text{ mm/s}$, Alarme Critique à $> 5.5\text{ mm/s}$ (danger de rupture mécanique ou balourd).
   - **Pression hydraulique/pneumatique** : Alarme basse à $< 2.5\text{ bar}$ (fuite/cavitation), Alarme haute à $> 9.5\text{ bar}$.
   - Publication instantanée sur le topic d'événement pour alerte sonore et visuelle sur le SCADA.
6. **Résilience et Tolérance aux Pannes (*Store-and-Forward*) (`storage.py`)** :
   - En cas d'indisponibilité temporaire d'InfluxDB, les points sont consignés dans une base locale SQLite persistante (`/app/data/edge_buffer.db`).
   - Dès le rétablissement de la liaison réseau, un processus d'arrière-plan rejoue et purge les données par lots ordonnés de 500 enregistrements, garantissant zéro perte de mesures (conforme NIST SP 800-82).

---

## 5. Poste de Conduite SCADA (Next.js + shadcn/ui)

L'IHM de supervision a été conçue pour offrir une ergonomie haut de gamme inspirée des centres de conduite modernes :
- **Design Visuel** : Palette sombre matte (charbon `#070B09` / `#0D1411`, bordures fines `#1A2821`) avec contrastes néon vert menthe / émeraude (`#00F59B` / `#10B981`) certifiés conformes WCAG AA (ratio 13.56:1).
- **Navigation Latérale** : Sidebar verticale avec boutons pilules solides vert néon pour les vues actives, badges de statut et regroupements fonctionnels.
- **Bandeau KPI Global** : 4 compteurs horizontaux séparés par des lignes capillaires verticales (Volume total ingéré, Parc actif 5/5, Latence Edge p95, Alarmes non acquittées).
- **Courbe Spline Temps Réel Recharts** : Tracé continu des variables physiques avec remplissage en dégradé SVG `<linearGradient>` et sélecteurs de métriques.
- **Jauge Radiale Circulaire** : Visualisation SVG dynamique de la conformité et santé globale du parc.
- **Console d'Incidents & Workflow Opérateur** : Liste horodatée des alarmes avec boîte de dialogue d'acquittement (ACK) permettant à l'opérateur de renseigner un commentaire de maintenance consigné sur MQTT.
- **Centre de Pilotage & Injection de Pannes (Test Lab)** : Interface interactive conçue spécifiquement pour la démonstration devant le jury.

---

## 6. Guide de Démarrage Rapide

### Prérequis
- Docker Engine 24+ et Docker Compose v2.

### Déploiement en Une Seule Commande
À la racine du projet, lancez :

```bash
docker compose up -d --build
```

### URLs d'Accès aux Services
| Service | URL / Port | Identifiants / Précisions |
|---|---|---|
| **Poste de Conduite SCADA Web** | [http://localhost:3000](http://localhost:3000) | Interface temps réel connectée en WebSockets |
| **Console InfluxDB v2** | [http://localhost:8086](http://localhost:8086) | **Utilisateur** : `ensam_admin`<br/>**Mot de passe** : `ensam_industrie40_password`<br/>**Organisation** : `ensam` |
| **Broker Mosquitto (MQTT TCP)** | `localhost:1883` | Utilisé par le simulateur et l'Edge Gateway |
| **Broker Mosquitto (WebSockets)** | `ws://localhost:9001` | Utilisé par le Dashboard Next.js |

Pour arrêter la pile :
```bash
docker compose down
```

---

## 7. Résultats des Benchmarks Expérimentaux

Les mesures suivantes ont été obtenues à l'aide de l'outil de benchmark automatisé [`scripts/run_benchmark.py`](file:///d:/INDIA/S5/Industrie4.0/Projet/scripts/run_benchmark.py) exécuté sur la pile conteneurisée :

| Indicateur / Métrique | QoS 0 (Au plus une fois) | QoS 1 (Au moins une fois + ACK) | Cible Cahier des Charges |
|---|:---:|:---:|:---:|
| **Taux de Livraison Réseau** | **100.0%** | **100.0%** | $\ge 99.0\%$ |
| **Débit Soutenu** | **93.87 msg/s** | **89.90 msg/s** | $\ge 10\text{ msg/s}$ *(9x supérieur)* |
| **Latence Moyenne** | **2.07 ms** | **28.86 ms** | — |
| **Latence Médiane (p50)** | **2.01 ms** | **31.73 ms** | — |
| **Latence au 95ᵉ Centile (p95)** | **3.43 ms** | **53.71 ms** | **$< 100\text{ ms}$** *(Conforme NF-01)* |
| **Latence au 99ᵉ Centile (p99)** | **4.56 ms** | **78.10 ms** | $< 150\text{ ms}$ |

Pour reproduire ces mesures à tout moment :
```bash
python scripts/run_benchmark.py
```

---

## 8. Déroulement du Scénario de Démonstration Orale (7 à 10 min)

1. **Présentation de l'Architecture (1 min)** :
   - Expliquer le cheminement des données : Simulateur $\rightarrow$ Mosquitto (TCP 1883 / WS 9001) $\rightarrow$ Edge Gateway $\rightarrow$ InfluxDB $\rightarrow$ Dashboard Next.js.
2. **Ouverture du Dashboard SCADA (1 min)** :
   - Ouvrir [http://localhost:3000](http://localhost:3000). Montrer les 5 équipements en vert `RUNNING` avec le flux continu sans rechargement de page.
3. **Analyse Détaillée d'une Machine (1.5 min)** :
   - Cliquer sur `motor-01`. Observer les courbes multi-axes Recharts et la conformité aux seuils nominaux.
4. **Démonstration de l'Injection de Pannes (Test Lab) (2.5 min)** :
   - Basculer sur l'onglet **Test Lab & Fault Injector**.
   - Sélectionner `motor-01` et cliquer sur **Inject Thermal Fault** ou **Inject Vibration Spike**.
   - Observer l'ordre enregistré dans le journal d'audit.
   - Revenir sur la vue machine : la variable grimpe en direct, dépasse le seuil d'alarme et le badge passe instantanément à l'état `CRITICAL`.
5. **Workflow Opérateur & Traçabilité (1.5 min)** :
   - Ouvrir l'onglet **Alert Console**. Montrer l'événement levé avec la valeur observée et le motif explicable.
   - Cliquer sur **Acknowledge**, saisir une note (ex: *« Technicien dépêché sur le palier moteur »*), puis valider. L'alerte est marquée acquittée et archivée.
6. **Vérification de la Sécurité & Quarantaine (1 min)** :
   - Dans le Test Lab, cliquer sur **Inject Bad Payload**.
   - Afficher les logs du conteneur Edge (`docker logs ensam_iiot_edge --tail 10`) : prouver que le paquet corrompu a été intercepté et rejeté par Pydantic sans polluer InfluxDB.
7. **Présentation des Chiffres de Performance (0.5 min)** :
   - Conclure en ouvrant l'onglet **Pipeline Health** pour montrer la latence p95 observée ($< 100\text{ ms}$) et le débit soutenu.

---

## 9. Tests Automatisés & Assurance Qualité

Le projet intègre une suite de tests unitaires et de bout en bout :

```bash
# Exécution de la suite unitaire Python (Simulateur, Règles, Déduplication, Validation)
python -m pytest tests/ -v
```

Résultats :
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

Pour la suite E2E du dashboard frontend (115 cas de test) :
```bash
cd dashboard && node scripts/run_e2e_tests.mjs
```

---

## 10. Arborescence du Répertoire

```text
.
├── dashboard/                  # Poste de conduite SCADA (Next.js 14, Tailwind, shadcn/ui)
│   ├── src/
│   │   ├── app/                # App Router (layout.tsx, page.tsx, globals.css, not-found.tsx)
│   │   ├── components/         # Composants d'interface
│   │   │   ├── layout/         # Sidebar.tsx, TopBar.tsx
│   │   │   ├── scada/          # KpiMetricBar.tsx, TelemetryAreaChart.tsx, RadialGauge.tsx,
│   │   │   │                   # TestLabPanel.tsx, IncidentResponseTable.tsx
│   │   │   └── views/          # PlantOverview, DeviceDetail, AlertConsole, TestLab, PipelineMetrics
│   │   ├── hooks/              # useMqttStream.ts (Client WebSocket MQTT sub-100ms)
│   │   └── types/              # Définitions TypeScript (iiot.ts)
│   ├── Dockerfile              # Image Docker multi-stage optimisée standalone
│   └── package.json
├── edge/                       # Passerelle Edge Computing (Python 3.12)
│   ├── src/
│   │   ├── validation.py       # Contrôles de schémas et bornes plausibles (Pydantic v2)
│   │   ├── deduplication.py    # Filtre de déduplication LRU 10 000 entrées
│   │   ├── normalization.py    # Horodatage et calcul de latence de transit
│   │   ├── aggregation.py      # Calculs statistiques sur fenêtres de 10s
│   │   ├── anomaly_rules.py    # Règles de détection thermique et vibratoire
│   │   ├── storage.py          # Client InfluxDB v2 & file de résilience SQLite
│   │   ├── edge_models.py      # Modèles de données de la passerelle
│   │   └── main.py             # Boucle événementielle et consommateur MQTT
│   └── Dockerfile
├── simulator/                  # Simulateur d'équipements industriels (Python 3.12)
│   ├── src/
│   │   ├── devices.py          # Modèles physiques (Moteurs, Pompe, Compresseur, Convoyeur)
│   │   ├── sim_models.py       # Schémas de télémétrie et commandes
│   │   ├── mqtt_publisher.py   # Publication MQTT QoS 1 & écouteur d'injections
│   │   └── main.py             # Point d'entrée de la simulation multi-machines
│   └── Dockerfile
├── infrastructure/
│   └── mosquitto/
│       └── config/mosquitto.conf # Configuration Mosquitto (Ports 1883 TCP + 9001 WS)
├── tests/                      # Suite de tests automatisés pytest
│   ├── test_simulator.py
│   ├── test_validation.py
│   └── test_anomaly_rules.py
├── scripts/
│   └── run_benchmark.py        # Banc de mesure automatisé de débit et latence
├── docker-compose.yml          # Déploiement multi-conteneurs unifié
├── .env.example                # Gabarit des variables d'environnement
├── Specifications_Guide_Projet_IIoT_ENSAM.md # Spécifications maîtresse détaillée
└── README.md                   # Ce document
```

---

## 11. Cybersécurité & Conformité Industrielle

Le prototype applique les recommandations du guide **NIST SP 800-82 Rev. 3** (*Guide to Operational Technology Security*) :
- **Segmentation réseau** : Le réseau `iiot_network` isole les communications machine-à-machine internes (ports 1883 non exposés publiquement sur Internet).
- **Surface d'attaque minimale** : Seuls les ports nécessaires sont publiés sur l'hôte local (`3000` pour l'IHM, `8086` pour la console InfluxDB, `9001` pour le WebSocket du navigateur).
- **Principe du moindre privilège** : Les conteneurs Python et Next.js s'exécutent avec des utilisateurs non privilégiés (`appuser` et `nextjs`, UID 1000/1001).
- **Gestion des secrets** : Les jetons et mots de passe sont exclus du dépôt Git grâce au `.gitignore` et configurés via des variables d'environnement.
