# Spécification du Modèle de Données & Schémas IIoT
## ENSAM Rabat — Industrie 4.0 (2026–2027)

---

## 1. Hiérarchie et Espace de Nommage des Topics MQTT

La convention de nommage adoptée s'appuie sur la structure organisationnelle industrielle ISA-95 (Entreprise / Site / Ligne / Équipement) :

```text
ensam/iiot/{site_id}/{line_id}/{device_id}/{stream_type}
```

### Table des Topics Référencés
| Topic | Rôle | Producteur | Consommateur | Fréquence / Mode |
|---|---|---|---|---|
| `ensam/iiot/site-a/line-1/motor-01/telemetry` | Télémétrie brute | Simulateur | Edge Gateway & SCADA | 1.0 Hz (Périodique) |
| `ensam/iiot/site-a/line-1/motor-02/telemetry` | Télémétrie brute | Simulateur | Edge Gateway & SCADA | 1.0 Hz (Périodique) |
| `ensam/iiot/site-a/line-1/pump-01/telemetry` | Télémétrie brute | Simulateur | Edge Gateway & SCADA | 1.0 Hz (Périodique) |
| `ensam/iiot/site-a/line-2/compressor-01/telemetry` | Télémétrie brute | Simulateur | Edge Gateway & SCADA | 1.0 Hz (Périodique) |
| `ensam/iiot/site-a/line-2/conveyor-01/telemetry` | Télémétrie brute | Simulateur | Edge Gateway & SCADA | 1.0 Hz (Périodique) |
| `ensam/iiot/+/+/+/status` | Disponibilité machine | Simulateur | SCADA Dashboard | Sur changement (Retained QoS 1) |
| `ensam/iiot/+/+/+/event` | Événement d'alarme | Edge Gateway | SCADA Dashboard | Événementiel (QoS 1) |
| `ensam/iiot/+/+/+/event/ack` | Acquittement d'alarme | SCADA Dashboard | Edge Gateway | Événementiel (QoS 1) |
| `ensam/iiot/+/+/+/command` | Consigne d'anomalie | SCADA Dashboard | Simulateur | Événementiel (QoS 1) |

---

## 2. Contrat de Données JSON — Télémétrie v1.0

### Schéma Formel Pydantic
```python
class Measurements(BaseModel):
    temperature_c: float = Field(..., ge=-30.0, le=180.0)
    pressure_bar: float = Field(..., ge=0.0, le=50.0)
    vibration_mm_s: float = Field(..., ge=0.0, le=50.0)
    humidity_pct: float = Field(..., ge=0.0, le=100.0)

class TelemetryPayload(BaseModel):
    schema_version: str = "1.0"
    message_id: str
    device_id: str
    site_id: str
    line_id: str
    sequence: int = Field(..., ge=0)
    timestamp: str  # ISO 8601 UTC
    measurements: Measurements
    machine_state: Literal["RUNNING", "IDLE", "WARNING", "CRITICAL", "STOPPED"]
    quality: Literal["GOOD", "UNCERTAIN", "BAD"]
```

### Exemple de Trame Validée
```json
{
  "schema_version": "1.0",
  "message_id": "motor-01-00000042",
  "device_id": "motor-01",
  "site_id": "site-a",
  "line_id": "line-1",
  "sequence": 42,
  "timestamp": "2026-11-06T15:30:42.100Z",
  "measurements": {
    "temperature_c": 65.23,
    "pressure_bar": 1.01,
    "vibration_mm_s": 2.18,
    "humidity_pct": 42.05
  },
  "machine_state": "RUNNING",
  "quality": "GOOD"
}
```

---

## 3. Paramètres Physiques & Calibrage de la Flotte

Chaque équipement simulé possède un comportement physique stationnaire avec bruit blanc gaussien :

| Équipement | Type | Température ($\mu \pm \sigma$) | Pression ($\mu \pm \sigma$) | Vibration RMS ($\mu \pm \sigma$) | Humidité ($\mu \pm \sigma$) |
|---|---|---|---|---|---|
| `motor-01` | Moteur induction | $65.0^\circ\text{C} \pm 0.5^\circ\text{C}$ | $1.0\text{ bar} \pm 0.1$ (Ambiant) | $2.20\text{ mm/s} \pm 0.15$ | $42.0\% \pm 0.3\%$ |
| `motor-02` | Moteur induction | $65.0^\circ\text{C} \pm 0.5^\circ\text{C}$ | $1.0\text{ bar} \pm 0.1$ (Ambiant) | $2.20\text{ mm/s} \pm 0.15$ | $42.0\% \pm 0.3\%$ |
| `pump-01` | Pompe centrifuge | $52.0^\circ\text{C} \pm 0.5^\circ\text{C}$ | $5.80\text{ bar} \pm 0.15$ (Hydraulique) | $1.90\text{ mm/s} \pm 0.12$ | $55.0\% \pm 0.3\%$ |
| `compressor-01` | Compresseur d'air | $74.0^\circ\text{C} \pm 0.6^\circ\text{C}$ | $8.20\text{ bar} \pm 0.20$ (Pneumatique) | $3.00\text{ mm/s} \pm 0.18$ | $35.0\% \pm 0.2\%$ |
| `conveyor-01` | Convoyeur bande | $44.0^\circ\text{C} \pm 0.4^\circ\text{C}$ | $1.0\text{ bar} \pm 0.1$ (Ambiant) | $1.20\text{ mm/s} \pm 0.10$ | $48.0\% \pm 0.3\%$ |

---

## 4. Seuils d'Anomalies & Payload des Événements

### Règles de Détection (ISO 10816 & Sécurité Procédé)
- **Température Haute** :
  - Seuil Avertissement : $T \ge 80.0^\circ\text{C}$
  - Seuil Critique : $T \ge 90.0^\circ\text{C}$
- **Vibrations Mécaniques** :
  - Seuil Avertissement : $V \ge 4.0\text{ mm/s}$
  - Seuil Critique : $V \ge 5.5\text{ mm/s}$ (Balourd ou défaillance de roulement imminente)
- **Pression Ligne (Pompe & Compresseur)** :
  - Seuil Pression Basse : $P \le 2.5\text{ bar}$ (Chute de pression, fuite ou cavitation)
  - Seuil Pression Haute : $P \ge 9.5\text{ bar}$ (Surpression danger)

### Schéma JSON des Alarmes
```json
{
  "event_id": "EVT-8F3B1A2C",
  "device_id": "motor-01",
  "site_id": "site-a",
  "line_id": "line-1",
  "timestamp": "2026-11-06T15:32:10.512Z",
  "severity": "CRITICAL",
  "variable": "temperature_c",
  "observed_value": 91.45,
  "threshold": 90.0,
  "reason": "High temperature critical alarm: 91.45°C exceeds 90.0°C",
  "acknowledged": false,
  "ack_note": null,
  "ack_timestamp": null
}
```
