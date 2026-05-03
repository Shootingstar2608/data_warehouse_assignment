import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Cấu hình CORS để Frontend gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đường dẫn model (đã tối ưu cho Docker)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "Water_RandomForest_Model5356.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print("✅ Đã load thành công model 5356!")
except Exception as e:
    print(f"❌ Lỗi load model: {e}")

class WaterInput(BaseModel):
    solids: float
    chloramines: float
    sulfate: float
    conductivity: float
    organic_carbon: float
    trihalomethanes: float
    turbidity: float
    acidity_key: int
    hardness_key: int

@app.post("/predict")
async def predict(data: WaterInput):
    # Chuyển dữ liệu sang DataFrame theo đúng tên cột model yêu cầu
    input_data = pd.DataFrame([data.model_dump()])
    
    # Thực hiện dự đoán
    prediction = model.predict(input_data)
    
    return {"potability": int(prediction[0])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)