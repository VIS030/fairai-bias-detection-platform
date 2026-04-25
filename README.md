<p align="center">
  <img src="https://img.shields.io/badge/Google-Solution_Challenge_2025-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Solution Challenge" />
</p>

<h1 align="center">🛡️ FairAI — Bias Detection & Correction Platform</h1>

<p align="center">
  <strong>An intelligent SaaS platform that detects, visualizes, and mitigates bias in Machine Learning datasets using Fairlearn and Explainable AI.</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Fairlearn-0.13-FF6F00?style=flat-square" />
  <img src="https://img.shields.io/badge/scikit--learn-1.6-F7931E?style=flat-square&logo=scikitlearn&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 📌 Problem Statement

AI systems increasingly influence critical decisions — hiring, lending, healthcare, and criminal justice. However, these systems often inherit **hidden biases** from training data, leading to unfair outcomes for underrepresented groups. Most developers lack accessible tools to detect and fix these biases before deployment.

**FairAI** bridges this gap by providing a one-stop platform to **detect**, **visualize**, **mitigate**, and **explain** bias in ML datasets — all without requiring deep expertise in fairness research.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 📤 **Dataset Upload** | Upload any CSV dataset or use the built-in Adult Census Income demo dataset (32K+ records) |
| 🔍 **Bias Detection** | Automatically trains a Logistic Regression model and computes fairness metrics using Fairlearn |
| 📊 **Demographic Parity** | Measures whether positive outcomes are distributed equally across demographic groups |
| ⚖️ **Equalized Odds** | Evaluates if the model performs equally well for all groups (true positive rate parity) |
| 🛠️ **Bias Mitigation** | Applies **ExponentiatedGradient** algorithm to reduce bias while preserving model accuracy |
| 📈 **Interactive Dashboard** | Before vs After comparison charts, group outcome bars, fairness doughnut charts, feature importance |
| 🧠 **AI Insights Engine** | Rule-based explainable AI that generates human-readable insights with severity levels and recommendations |
| 🎨 **Premium Dark UI** | Modern glassmorphism design with smooth animations, gradient accents, and responsive layout |

---

## 🖥️ Screenshots

<details>
<summary><strong>Click to view screenshots</strong></summary>

### Landing Page
> Premium dark-themed landing page with hero section, feature cards, and call-to-action banners.

### Upload Page
> Drag-and-drop CSV upload with demo dataset loader, column auto-detection, and data preview table.

### Bias Analysis Dashboard
> Interactive charts showing demographic parity, equalized odds, group comparison bars, and fairness score breakdown.

### AI Insights
> Severity-filtered insight cards with expandable details, fairness score summary, and actionable recommendations.

</details>

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **Vite 8** | Lightning-fast dev server & build tool |
| **Tailwind CSS 4** | Utility-first styling with custom dark theme |
| **Chart.js + react-chartjs-2** | Interactive bar charts, doughnut charts |
| **Framer Motion** | Smooth page transitions & micro-animations |
| **Lucide React** | Modern icon system |
| **Axios** | HTTP client for API communication |
| **React Router DOM** | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python API framework |
| **Fairlearn 0.13** | Microsoft's ML fairness toolkit |
| **scikit-learn** | Model training (Logistic Regression) |
| **Pandas / NumPy** | Data preprocessing & manipulation |
| **SQLAlchemy** | ORM for database operations |
| **SQLite** | Zero-config portable database |
| **Uvicorn** | ASGI server for FastAPI |

---

## 📂 Project Structure

```
FairAI/
├── adult.csv                    # Demo dataset (Adult Census Income)
├── README.md
│
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # SQLite database setup & session management
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── requirements.txt         # Python dependencies
│   │
│   ├── routers/
│   │   ├── dataset.py           # Dataset upload & demo loading endpoints
│   │   ├── analysis.py          # Bias detection & mitigation endpoints
│   │   └── insights.py          # AI insights generation endpoint
│   │
│   └── services/
│       ├── ml_pipeline.py       # Data preprocessing, model training, bias metrics
│       ├── bias_mitigation.py   # ExponentiatedGradient bias reduction
│       └── insights_engine.py   # Rule-based explainable AI engine
│
└── frontend/
    ├── index.html
    ├── vite.config.js           # Vite + Tailwind + API proxy config
    ├── package.json
    │
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Routes & layout
        ├── index.css            # Design system (dark theme, glassmorphism)
        │
        ├── components/
        │   ├── Sidebar.jsx      # Collapsible navigation sidebar
        │   └── Navbar.jsx       # Top navigation bar
        │
        ├── pages/
        │   ├── LandingPage.jsx  # Marketing landing page
        │   ├── Dashboard.jsx    # Overview dashboard with stats
        │   ├── UploadPage.jsx   # Dataset upload & preview
        │   ├── BiasAnalysis.jsx # Charts, metrics & mitigation
        │   └── AIInsights.jsx   # AI-generated recommendations
        │
        └── utils/
            └── api.js           # Axios API client
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/FairAI.git
cd FairAI
```

**2. Set up the Backend**

```bash
cd backend
pip install -r requirements.txt
```

**3. Set up the Frontend**

```bash
cd ../frontend
npm install
```

### Running the Application

You need **two terminals** running simultaneously:

**Terminal 1 — Backend (FastAPI)**

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend (Vite + React)**

```bash
cd frontend
npm run dev
```

**4. Open your browser**

```
http://localhost:5173
```

> The frontend automatically proxies `/api/*` requests to the backend at `localhost:8000`.

---

## 🔄 How It Works

```
┌─────────────┐     CSV Upload      ┌──────────────┐
│   Frontend   │ ──────────────────▶ │   FastAPI     │
│  (React +    │                     │   Backend     │
│   Tailwind)  │ ◀────────────────── │              │
└─────────────┘    JSON Response     └──────┬───────┘
                                            │
                              ┌─────────────┼─────────────┐
                              ▼             ▼             ▼
                      ┌──────────┐  ┌──────────┐  ┌──────────┐
                      │   ML     │  │  Bias    │  │ Insights │
                      │ Pipeline │  │Mitigation│  │  Engine  │
                      │(sklearn) │  │(Fairlearn│  │ (Rules)  │
                      └──────────┘  └──────────┘  └──────────┘
```

### Pipeline Steps

1. **Upload / Load** — User uploads CSV or loads demo dataset
2. **Preprocess** — Handle missing values, encode categoricals, split train/test
3. **Train** — Fit Logistic Regression model on preprocessed data
4. **Detect** — Compute Demographic Parity Difference & Equalized Odds Difference
5. **Visualize** — Render interactive charts (group bars, fairness pie, feature importance)
6. **Mitigate** — Apply ExponentiatedGradient with DemographicParity constraint
7. **Compare** — Show before vs after metrics in charts and tables
8. **Explain** — Generate severity-rated insights with actionable recommendations

---

## 📊 Fairness Metrics Explained

| Metric | What It Measures | Fair Value |
|---|---|---|
| **Demographic Parity Difference** | Gap in positive outcome rates between groups | Close to **0** |
| **Equalized Odds Difference** | Gap in true positive rates between groups | Close to **0** |
| **Fairness Score** | Overall score (0–100%) derived from both metrics | **≥ 80%** is Good |

### Severity Ratings

| Score | Rating | Interpretation |
|---|---|---|
| 80–100% | 🟢 **Good** | Model is reasonably fair |
| 60–79% | 🟡 **Moderate** | Some bias detected, mitigation recommended |
| 40–59% | 🟠 **Poor** | Significant bias, mitigation required |
| 0–39% | 🔴 **Critical** | Severe bias, model should not be deployed |

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/dataset/upload` | Upload a CSV file |
| `POST` | `/api/dataset/demo` | Load demo dataset |
| `GET` | `/api/dataset/info` | Get current dataset info |
| `GET` | `/api/dataset/preview` | Preview first N rows |
| `POST` | `/api/analysis/run` | Run bias detection pipeline |
| `GET` | `/api/analysis/results` | Get latest analysis results |
| `POST` | `/api/analysis/mitigate` | Apply bias mitigation |
| `GET` | `/api/insights` | Get AI-generated insights |
| `GET` | `/api/health` | Health check |

> 📖 Interactive API docs available at: `http://localhost:8000/docs`

---

## 🌍 UN Sustainable Development Goals

This project aligns with the following UN SDGs:

| SDG | Goal | How FairAI Contributes |
|---|---|---|
| **SDG 5** | Gender Equality | Detects gender-based bias in decision-making models |
| **SDG 10** | Reduced Inequalities | Identifies and mitigates unfair treatment across demographic groups |
| **SDG 16** | Peace, Justice & Strong Institutions | Promotes transparency and accountability in AI systems |

---

## 🛠️ Future Enhancements

- [ ] Support for multiple sensitive attributes (race, age, disability)
- [ ] Additional ML models (Random Forest, XGBoost, Neural Networks)
- [ ] LLM-powered insights using Google Gemini API
- [ ] PDF/CSV report export with charts
- [ ] User authentication & analysis history
- [ ] Docker containerization for one-click deployment
- [ ] Support for more mitigation algorithms (ThresholdOptimizer, GridSearch)

---

## 👥 Team

| Name | Role |
|---|---|
| **Your Name** | Full-Stack Developer & ML Engineer |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Fairlearn](https://fairlearn.org/) — Microsoft's ML fairness toolkit
- [scikit-learn](https://scikit-learn.org/) — Machine learning library
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python API framework
- [Chart.js](https://www.chartjs.org/) — JavaScript charting library
- [UCI Adult Dataset](https://archive.ics.uci.edu/dataset/2/adult) — Census income dataset

---

<p align="center">
  <strong>Built with ❤️ for the Google Solution Challenge 2025</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/⭐_Star_this_repo-if_you_found_it_useful!-yellow?style=for-the-badge" />
</p>
