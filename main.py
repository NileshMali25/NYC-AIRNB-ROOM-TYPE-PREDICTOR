from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import os
import uvicorn
from sklearn.impute import SimpleImputer

app = FastAPI(title="NYC Airbnb Room Type Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COLUMNS = [
    "latitude", "longitude", "price", "minimum_nights",
    "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365",
    "neighbourhood_group", "neighbourhood",
]

# Find and load model file safely
model = None
model_classes = ["Entire home/apt", "Private room", "Shared room"]

model_candidates = ["model_pipeline.pkl", "Model_Pipeline.pkl"]
model_file = next((f for f in model_candidates if os.path.exists(f)), None)

if model_file:
    try:
        model = joblib.load(model_file)
        # Compatibility patch for newer scikit-learn
        for step in getattr(model, "named_steps", {}).values():
            if hasattr(step, "transformers_"):
                for _, trans, _ in step.transformers_:
                    if hasattr(trans, "named_steps"):
                        for s in trans.named_steps.values():
                            if isinstance(s, SimpleImputer) and not hasattr(s, "_fill_dtype"):
                                s._fill_dtype = getattr(s, "_fit_dtype", None)
        model_classes = list(getattr(model, "classes_", model_classes))
        print(f"Loaded ML model pipeline from '{model_file}'.")
    except Exception as err:
        print(f"Warning: Failed loading {model_file} ({err}). Using fallback predictor.")
        model = None
else:
    print("Notice: No model .pkl file found on server. Using built-in prediction heuristics.")

class Features(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    price: float = Field(..., gt=0, description="Price per night, must be positive")
    minimum_nights: int = Field(..., ge=1, le=365, description="Minimum nights required for booking")
    number_of_reviews: int = Field(..., ge=0, description="Total number of reviews")
    reviews_per_month: float = Field(..., ge=0, description="Average reviews per month")
    calculated_host_listings_count: int = Field(..., ge=0, description="Number of listings by this host")
    availability_365: int = Field(..., ge=0, le=365, description="Days available out of 365")
    neighbourhood_group: str = Field(..., min_length=1, description="Borough or neighbourhood group")
    neighbourhood: str = Field(..., min_length=1, description="Specific neighbourhood name")

def fallback_predict(data: dict):
    price = float(data.get("price", 150))
    min_nights = int(data.get("minimum_nights", 1))
    borough = data.get("neighbourhood_group", "Brooklyn")

    p_entire = 0.1
    p_private = 0.5
    p_shared = 0.05

    if price >= 160:
        p_entire += 0.65
        p_private -= 0.35
    elif price >= 110:
        p_entire += 0.4
        p_private -= 0.2
    elif price <= 55:
        p_shared += 0.35
        p_private += 0.15
        p_entire = 0.02

    if min_nights >= 3:
        p_entire += 0.15
        p_shared -= 0.05

    if borough == "Manhattan" and price > 140:
        p_entire += 0.1

    total = max(0.001, p_entire + p_private + p_shared)
    p_entire /= total
    p_private /= total
    p_shared /= total

    prob_dict = {
        "Entire home/apt": round(p_entire, 4),
        "Private room": round(p_private, 4),
        "Shared room": round(p_shared, 4)
    }

    pred = max(prob_dict, key=prob_dict.get)
    probs = [prob_dict[cls] for cls in model_classes]

    return {
        "Predicted_room_type": pred,
        "Probability": probs,
        "Probabilities": prob_dict,
        "Classes": model_classes
    }

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "has_model_file": model is not None,
        "classes": model_classes
    }

@app.post("/predict")
def predict(features: Features):
    try:
        data = features.model_dump() if hasattr(features, 'model_dump') else features.dict()

        if model is not None:
            row = pd.DataFrame([data], columns=COLUMNS)
            pred = model.predict(row)[0]
            probs = model.predict_proba(row)[0].tolist()

            prob_dict = {}
            for cls_name, p in zip(model_classes, probs):
                prob_dict[cls_name] = round(p, 4)

            return {
                "Predicted_room_type": pred,
                "Probability": probs,
                "Probabilities": prob_dict,
                "Classes": model_classes
            }
        else:
            return fallback_predict(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Frontend Routes
@app.get("/")
def serve_index():
    return FileResponse("index.html")

@app.get("/style.css")
def serve_css():
    return FileResponse("style.css", media_type="text/css")

@app.get("/script.js")
def serve_js():
    return FileResponse("script.js", media_type="application/javascript")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting NYC Airbnb Room Type Predictor on http://0.0.0.0:{port} ...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
