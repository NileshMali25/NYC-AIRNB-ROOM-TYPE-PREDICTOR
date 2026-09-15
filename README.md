# NYC Airbnb — Room Type Predictor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://nyc-airnb-room-type-predictor.onrender.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Scikit--Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)

> 🌐 **Live Application**: [https://nyc-airnb-room-type-predictor.onrender.com/](https://nyc-airnb-room-type-predictor.onrender.com/)

A sleek, responsive machine learning web application that predicts the Airbnb room type (`Entire home/apt`, `Private room`, or `Shared room`) for any listing in New York City based on its geographic location, pricing, availability, and host review statistics.

---

## Features

- **Intuitive UI & Dark Theme**: Custom glassmorphic interface with real-time confidence scores and dynamic insight generator.
- **Fully Mobile-Friendly**: Responsive layout optimized for smartphones, tablets, and desktop displays with touch-friendly controls.
- **FastAPI Backend**: Fast, lightweight API serving prediction probabilities and input validation via Pydantic.
- **Standalone Demo Mode**: Built-in simulated heuristics fallback so the frontend works smoothly even if the Python server is starting up.
- **Interactive Particle Background & NYC Skyline**: Dynamic animated canvas particles and glowing skyline silhouette.

---

## Project Structure

```
├── .gitignore               # Excludes large binaries (>100MB) & cache
├── README.md                # Project documentation with live demo link
├── index.html               # Semantic, mobile-responsive HTML5 UI
├── main.py                  # FastAPI server with prediction endpoints
├── model.ipynb              # Jupyter Notebook: EDA, model training & pipeline
├── render.yaml              # Render Blueprint deployment config
├── requirements.txt         # Python dependencies
├── script.js                # Interactive frontend logic & dynamic graphs
└── style.css                # Polished dark mode & responsive CSS
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/NileshMali25/NYC-AIRNB-ROOM-TYPE-PREDICTOR.git
cd NYC-AIRNB-ROOM-TYPE-PREDICTOR
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the application
```bash
python main.py
```
Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Open your browser at **http://127.0.0.1:8000** to explore the predictor locally.

---

## Machine Learning Pipeline

The model pipeline is trained on NYC Airbnb Open Data. It performs feature transformation (imputation, standard scaling, and one-hot encoding) combined with a classification model.

> **Note on Model Weights**: The trained binary `model_pipeline.pkl` (~189 MB) exceeds GitHub's standard 100 MB file limit. You can re-generate the pipeline by running the `model.ipynb` notebook or store the binary via Git LFS / cloud storage. The frontend includes a fallback simulator for demonstration purposes.

---

## License
MIT License. Free for educational and commercial use.
