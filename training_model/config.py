# Nơi lưu trữ toàn bộ cấu hình và siêu tham số của các model nhóm đang xài
import os
import numpy as np
from dotenv import load_dotenv
# Cấu hình Database (cái mật khẩu với port tự custom lại theo máy nhe)
load_dotenv()

# Cấu hình Database (Lấy từ file .env, không lộ mật khẩu nữa)
DB_URL = os.getenv("DB_URL")
# Cấu hình Data (Features)
FEATURES_TO_USE = [
    'solids',
    'chloramines',
    'sulfate',
    'conductivity',
    'organic_carbon',
    'trihalomethanes',
    'turbidity',
    'acidity_key',  
    'hardness_key'  
]

# Cấu hình Siêu tham số (Hyperparameters) cho Mô hình
RF_PARAMS = {
    'n_estimators': [100, 200, 300, 500],
    'max_depth': [None, 10, 20, 30], # độ sâu tối đa
    'min_samples_split': [2, 5, 10], # số mẫu thử tối thiểu
    'random_state': [42],
    'class_weight': [None, 'balanced'] # 
}

XGB_PARAMS = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.2],
    'max_depth': [3, 5, 7],
    'subsample': [0.8, 1.0]
}

SVM_PARAMS = {
    'kernel': 'rbf',
    'probability': True,
    'random_state': 42
}

# 4. Cấu hình Quét Ngưỡng (Threshold Sweep)
THRESHOLDS_SWEEP = np.arange(0.5, 0.8, 0.05) 