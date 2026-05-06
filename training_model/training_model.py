import pandas as pd
import joblib
import json
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

# IMPORT TỪ FILE CONFIG BÊN NGOÀI VÀO
from config import (
    DB_URL, 
    FEATURES_TO_USE, 
    RF_PARAMS, 
    XGB_PARAMS, 
    SVM_PARAMS, 
    THRESHOLDS_SWEEP
)

# KẾT NỐI VÀ LẤY DỮ LIỆU
engine = create_engine(DB_URL)
print("Đang kéo data nè ...")
query = "SELECT * from fact_water_sample"
df = pd.read_sql(query, engine)
print(f"Lấy data lên df thành công bruh! Đã lấy {df.shape[0]} hàng.")

df.columns = df.columns.str.lower()
target_column = 'potability_key'

# XỬ LÝ LỖI LOGIC (ETL LỌC VÀI CÁI THEO WHO)
initial_count = len(df)
df = df[~((df['potability_key'] == 1) & ((df['ph'] < 6.5) | (df['ph'] > 8.5)))]
df = df[~((df['potability_key'] == 1) & (df['sulfate'] > 400))]
df = df[~((df['potability_key'] == 1) & (df['solids'] > 40000))]
df = df[~((df['potability_key'] == 1) & (df['turbidity'] > 7))]

final_count = len(df)
print(f"Đã xóa {initial_count - final_count} dòng dữ liệu phi lý (Potability=1 sai thực tế).")

# CHUẨN BỊ DỮ LIỆU
X = df[FEATURES_TO_USE]
y = df[target_column]

X_train, X_test, y_train, y_test = train_test_split(
    X, 
    y, 
    test_size=0.2, 
    random_state=42, 
    stratify=y # để  đảm bảo tỉ lệ tập train và test có mwucs độ phân bố dữ liệu như nheu
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
# HUẤN LUYỆN 3 MÔ HÌNH (Bổ sung fine-tune)
# Bố sung dò siêu tham số 
# randomforest
# lưu lại hyper_params tốt nhất ne
best_params_log = {}

print("Đang dò siêu tham số cho Random Forest...")
rf_tuner = RandomizedSearchCV(
    estimator=RandomForestClassifier(),
    param_distributions=RF_PARAMS,
    n_iter=10,             # Rút ngẫu nhiên 10 tổ hợp để thử
    cv=5,                  # Cross-validation 5 nếp gấp
    scoring='precision',   # Tối ưu hóa Precision
    random_state=42,
    n_jobs=-1              # Chạy full công suất CPU
)
rf_tuner.fit(X_train, y_train)
best_rf = rf_tuner.best_estimator_
print(f"RF tốt nhất: {rf_tuner.best_params_}")
# XGB
print("Đang dò siêu tham số cho XGBoost...")
xgb_tuner = RandomizedSearchCV(
    estimator=XGBClassifier(),
    param_distributions=XGB_PARAMS,
    n_iter=10, 
    cv=5, 
    scoring='precision', 
    random_state=42,
    n_jobs=-1
)
xgb_tuner.fit(X_train, y_train)
best_xgb = xgb_tuner.best_estimator_
print(f"XGB tốt nhất: {xgb_tuner.best_params_}")
#SVM do nặng lắm nên thôi ko dò
print("Đang huấn luyện SVM...")
best_svm = SVC(**SVM_PARAMS)
best_svm.fit(X_train_scaled, y_train)

# KHỞI TẠO MÔ HÌNH VỚI SIÊU THAM SỐ TỪ CONFIG
# Dùng dấu ** để giải nén (unpacking) dictionary thành các tham số truyền vào hàm nè
trained_models = {
    "Random Forest": best_rf,
    "XGBoost": best_xgb,
    "SVM": best_svm
}

for name, model in trained_models.items():
    print(f"\n[PHÂN TÍCH] Đang tính toán cho: {name}...")
    
    test_data = X_test_scaled if name == "SVM" else X_test
    y_proba = model.predict_proba(test_data)[:, 1]
    
    print(f"{'Threshold':<12} | {'Precision (1)':<15} | {'Recall (1)':<12} | {'F1-Score (1)':<12} | {'Accuracy':<10}")
    print("-" * 75)
    
    for th in THRESHOLDS_SWEEP:
        th = round(th, 2)
        y_pred_custom = (y_proba >= th).astype(int)
        report = classification_report(y_test, y_pred_custom, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, y_pred_custom)
        
        # Bóc 4 chỉ số ra. FP (False Positive) là cái nguy hiểm nhất cần để ý!
        tn, fp, fn, tp = cm.ravel()

        p1 = report['1']['precision']
        r1 = report['1']['recall']
        f1 = report['1']['f1-score']
        acc = report['accuracy']
        
        print(f"{th:<12} | {p1:<15.4f} | {r1:<12.4f} | {f1:<12.4f} | {acc:<10.4f}")

PLOT_THRESHOLD = 0.5 

for name, model in trained_models.items():
    # Tính toán lại predict với Threshold đã chọn để vẽ hình
    test_data = X_test_scaled if name == "SVM" else X_test
    y_proba = model.predict_proba(test_data)[:, 1]
    y_pred_plot = (y_proba >= PLOT_THRESHOLD).astype(int)
    
    # Tạo ma trận nhầm lẫn
    cm = confusion_matrix(y_test, y_pred_plot)
    
    # Vẽ biểu đồ (Plot)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Nước Dơ (0)", "Nước Sạch (1)"])
    fig, ax = plt.subplots(figsize=(6, 5)) # Chỉnh kích thước hình
    disp.plot(cmap=plt.cm.Blues, ax=ax) 
    
    # Thêm tiêu đề cho biểu đồ
    plt.title(f"Confusion Matrix - {name}\n(Threshold: {PLOT_THRESHOLD})")
    image_filename = f"ConfusionMatrix_{name.replace(' ', '')}.png"
    plt.savefig(image_filename, dpi=300, bbox_inches='tight')
    plt.close() # Đóng plot để giải phóng bộ nhớ

print("\nĐang xuất các mô hình tốt nhất...")
joblib.dump(trained_models["Random Forest"], 'Water_RandomForest_Model.pkl')
joblib.dump(trained_models["XGBoost"], 'Water_XGBoost_Model.pkl')
joblib.dump(trained_models["SVM"], 'Water_SVM_Model.pkl')
joblib.dump(scaler, 'Water_Scaler_for_SVM.pkl')

# lưu siêu tham số để xuất ra json
best_params_log["Random Forest"] = rf_tuner.best_params_
best_params_log["XGBoost"] = xgb_tuner.best_params_
best_params_log["SVM"] = SVM_PARAMS # SVM không dò thì lấy thông số từ config đưa vô luôn cho đủ bảng
with open('Best_Hyperparameters_Log.json', 'w', encoding='utf-8') as f:
    json.dump(best_params_log, f, indent=4, ensure_ascii=False)