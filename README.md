# NYC Airbnb — Room Type Predictor

A sleek, responsive machine learning web application that predicts the Airbnb room type (`Entire home/apt`, `Private room`, or `Shared room`) for any listing in New York City based on its geographic location, pricing, availability, and host review statistics.

---

## Features

- **Intuitive UI & Dark Theme**: Custom glassmorphic interface with real-time confidence scores and dynamic insight generator.
- **Fully Mobile-Friendly**: Responsive layout optimized for smartphones, tablets, and desktop displays with touch-friendly controls.
- **FastAPI Backend**: Fast, lightweight API serving prediction probabilities and input validation via Pydantic.
- **Standalone Demo Mode**: Built-in simulated heuristics fallback so the frontend works smoothly even without running the Python server.
- **Interactive Particle Background & NYC Skyline**: Dynamic animated canvas particles and glowing skyline silhouette.

---

## Project Structure

```
├── .gitignore               # Excludes large binaries (>100MB) & cache
├── README.md                # Project documentation
├── index.html               # Semantic, mobile-responsive HTML5 UI
├── main.py                  # FastAPI server with prediction endpoints
├── model.ipynb              # Jupyter Notebook: EDA, model training & pipeline
├── requirements.txt         # Python dependencies
├── script.js                # Interactive frontend logic & dynamic graphs
└── style.css                # Polished dark mode & responsive CSS
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "House classification"
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
Open your browser at **http://127.0.0.1:8000** to explore the predictor.

---

## Machine Learning Pipeline

The model pipeline is trained on NYC Airbnb Open Data. It performs feature transformation (imputation, standard scaling, and one-hot encoding) combined with a classification model.

> **Note on Model Weights**: The trained binary `model_pipeline.pkl` (~189 MB) exceeds GitHub's standard 100 MB file limit. You can re-generate the pipeline by running the `model.ipynb` notebook or store the binary via Git LFS / cloud storage. The frontend includes a fallback simulator for demonstration purposes.

---

## License
MIT License. Free for educational and commercial use.
