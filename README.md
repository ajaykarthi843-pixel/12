# 🚦 Traffic Safety Advisor: End-to-End Ranked Traffic-Violation Review System

An automated, AI-powered traffic enforcement and priority triage review system designed for municipal traffic police departments and smart city command centres.

---

## 🌟 Overview & Architecture

When traffic CCTV cameras detect hundreds of violations daily (e.g., 137 violations), human reviewing officers have limited bandwidth (e.g., a shift capacity of 30 cases). 

Rather than overwhelming officers or imposing automated fines without human oversight, this system implements an **End-to-End Prioritized Triage Pipeline**:

```
        Traffic Video / Image Streams
                     │
                     ▼
             ┌─────────────────┐
             │ Object Detection│ ──► YOLOv8x (Vehicles, Helmets, Riders, Signals)
             └────────┬────────┘
                      │
              Vehicles / Riders
                      │
                      ▼
             ┌─────────────────┐
             │ Object Tracking │ ──► ByteTrack / BoT-SORT (Track IDs, Trajectories)
             └────────┬────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Violation Engine │
             └────────┬─────────┘
                      │
      ┌───────────────┼───────────────┬────────────────┐
      ▼               ▼               ▼                ▼
   🪖 Helmet       👥 Riders       🚗 Direction     🚦 Red Light
      │               │               │                │
      └───────────────┼───────────────┴────────────────┘
                      ▼
              Violation Records
                      │
                      ▼
             ┌──────────────────┐
             │ Severity Scoring │ ──► Fatality Risk & Road Hazard Index
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Repeat Detection │ ──► ANPR License Plate OCR + Police RTO DB
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Priority Ranking │ ──► Multi-Factor Weighted Scoring Formula
             └────────┬─────────┘
                      │
                 TOP 30 CASES  ─────► Constrained Shift Review Capacity
                      │
                      ▼
             ┌──────────────────┐
             │ Evidence Report  │ ──► High-Res Canvas Annotation + E-Challan Notice
             │ + Web Dashboard  │
             └──────────────────┘
```

---

## 🎯 How The 7 Expected Outputs Are Addressed

| # | Expected Output | System Implementation |
|---|---|---|
| **1** | **Detected Violations** | Multi-class detection for **🪖 No Helmet**, **👥 Multiple Riders (Triple Riding)**, **🚗 Wrong-Way Driving**, and **🚦 Red Light Violation**. Detailed in table with Case ID, Violation Type, Vehicle Class, and Confidence percentage. |
| **2** | **Evidence Frame for Every Violation** | High-definition canvas-rendered evidence frame with color-coded bounding boxes, directional trajectory vectors, stop-line overlays, timestamp/CCTV telemetry HUD, and zoomed ANPR license plate crop. Downloadable as standalone PNG. |
| **3** | **Severity Score** | Calibrated danger-to-life hazard index: **Wrong Way (95/100)**, **Red Light (88-91/100)**, **No Helmet (74-75/100)**, **Multiple Riders (68-72/100)**. |
| **4** | **Repeat-Offense Information** | Integrated vehicle registry showing registered owner, contact, previous violation dates, unpaid statutory challans, and recidivism tier (e.g., `TN38AB1234` with 2 prior violations). |
| **5** | **Priority Score (The Core Problem)** | Mathematical multi-factor weighted triage formula ranking all 137 cases to surface the **Top 30 Priority Queue**. Includes dynamic capacity cutoff slider and interactive formula weight tuner. |
| **6** | **Final Enforcement Report** | Single-click export to **RFC 4180 CSV**, formatted **ASCII Police Summary Dossier**, printable **Police Directorate Report**, and individual **Official E-Challan Citation Notices** with statutory sections and QR payment codes. |
| **7** | **Interactive Review Dashboard** | Police Command Center UI featuring live metric cards, live CCTV camera simulation stream, custom video/photo upload inference dropzone, and **Human-in-the-Loop [Confirm] / [Reject] / [Escalate]** review workflows. |

---

## 📐 Priority Scoring Formula

$$\text{Priority Score} = w_s \cdot \text{Severity} + w_c \cdot \text{Confidence} + w_r \cdot \text{RepeatFactor} + w_q \cdot \text{EvidenceQuality}$$

### Default Calibration Weights:
- **$w_s = 0.45$ (Severity):** Prioritizes lethal collision hazards (e.g. wrong-way driving, high-speed signal running).
- **$w_c = 0.20$ (Detection Confidence):** Minimizes officer verification fatigue by penalizing ambiguous detections.
- **$w_r = 0.25$ (Repeat History):** Escalates chronic recidivists and vehicles with outstanding unpaid fines.
- **$w_q = 0.10$ (Visual Quality):** Ensures clear license plate legibility and unoccluded bounding clarity for legal enforceability.

### Benchmark Prompt Validation:
- **Rank 1 (`C047`):** Wrong Way | Severity: 95 | Repeat: 2 | Conf: 96.0% $\rightarrow$ **Priority: 94.2**
- **Rank 2 (`C012`):** No Helmet | Severity: 75 | Repeat: 3 | Conf: 92.0% $\rightarrow$ **Priority: 89.7**
- **Rank 3 (`C081`):** Wrong Way | Severity: 92 | Repeat: 1 | Conf: 94.8% $\rightarrow$ **Priority: 87.4**
- **Rank 30 (`C063`):** No Helmet | Severity: 70 | Repeat: 1 | Conf: 89.0% $\rightarrow$ **Priority: 68.1**

---

## 🚀 How to Run the Web Application

### Option 1: Double Click (Windows)
Double-click `run.bat` in this directory. It starts the local PowerShell HTTP server and automatically opens your web browser at `http://localhost:8080`.

### Option 2: PowerShell Command
```powershell
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

### Option 3: Direct Browser Launch
You can also open `index.html` directly in Google Chrome or Microsoft Edge:
```powershell
Start-Process chrome index.html
```

---

## 📁 Project Structure

```
traffic-violation-review-system/
├── index.html                 # Main single-page application
├── run.bat                    # Windows 1-click launcher
├── start-server.ps1           # Built-in PowerShell HTTP static server
├── README.md                  # Comprehensive system documentation
├── css/
│   ├── main.css               # Design system, dark glassmorphism, tokens
│   ├── components.css         # Review table, capacity cutoff, evidence modal
│   └── animations.css         # Radar pulse, crit glows, transitions
├── js/
│   ├── app.js                 # Main UI controller & state management
│   ├── data.js                # 137 simulated violation cases & vehicle registry
│   ├── rankingEngine.js       # Priority scoring & dynamic ranking engine
│   ├── evidenceCanvas.js      # High-res evidence annotation & HUD renderer
│   ├── videoSimulator.js      # Real-time CCTV tracking & media upload studio
│   └── reportGenerator.js     # CSV export, printable police report, E-Challan
└── assets/
    └── images/
        ├── evidence_no_helmet.jpg      # Photorealistic CCTV No-Helmet capture
        ├── evidence_triple_riding.jpg  # Photorealistic CCTV Triple Riding capture
        ├── evidence_wrong_way.jpg      # Photorealistic CCTV Wrong-Way capture
        └── evidence_red_light.jpg      # Photorealistic CCTV Red Light capture
```

---

## ⚖️ Human-in-the-Loop Decision Workflow

1. The officer views the **Top 30 Prioritized Queue**.
2. Clicking any row opens the **High-Definition Evidence Inspector**.
3. The officer verifies:
   - Vehicle bounding box and violation focus reticle.
   - License plate OCR match against the RTO database.
   - Prior violation history and unpaid fine notices.
4. Officer actions:
   - **Confirm & Enforce (`[C]`):** Generates an official statutory E-Challan with compounded fines.
   - **Reject (`[R]`):** Records rejection reason (e.g. false positive, emergency vehicle exception) and updates audit trail.
   - **Escalate / Senior Audit:** Flags complex cases for secondary supervisor review.
