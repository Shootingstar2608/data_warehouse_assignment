import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
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
# gộp data lại vẽ
train_df = X_train.copy()
train_df['Tập dữ liệu'] = 'Train (80%)'

test_df = X_test.copy()
test_df['Tập dữ liệu'] = 'Test (20%)'

# Nối 2 bảng lại với nhau để seaborn tự động chia màu
plot_df = pd.concat([train_df, test_df])

# Phân loại 2 phe dữ liệu
discrete_cols = ['acidity_key', 'hardness_key']
continuous_cols = [col for col in X.columns if col not in discrete_cols]

# vẽ grid
fig, axes = plt.subplots(nrows=3, ncols=3, figsize=(16, 14))
axes = axes.flatten()

# Chỉnh màu: Xanh dương cho Train, Cam cho Test
my_palette = {'Train (80%)': '#1f77b4', 'Test (20%)': '#ff7f0e'}

for i, col in enumerate(X.columns):
    if col in discrete_cols:
        # Phe rời rạc: Vẽ cột đứng cạnh nhau (multiple='dodge'), đo bằng % (stat='percent')
        sns.histplot(data=plot_df, x=col, hue='Tập dữ liệu', 
                     multiple="dodge", stat="percent", common_norm=False, 
                     discrete=True, shrink=0.8, palette=my_palette, ax=axes[i])
        axes[i].set_ylabel('Tỷ lệ (%)')
        # Ép trục X chỉ hiển thị số nguyên (0, 1...)
        axes[i].set_xticks(plot_df[col].unique()) 
    else:
        # Phe liên tục: Vẽ Density đè lên nhau, có đường cong KDE
        sns.histplot(data=plot_df, x=col, hue='Tập dữ liệu', 
                     kde=True, stat="density", common_norm=False, 
                     alpha=0.4, linewidth=0, palette=my_palette, ax=axes[i])
        axes[i].set_ylabel('Mật độ (Density)')
    
    # Format lại tiêu đề cho ngầu
    axes[i].set_title(f'Phân phối: {col.upper()}', fontsize=12, fontweight='bold')
    axes[i].set_xlabel('')

# Dọn dẹp khoảng trống và lưu hình
plt.tight_layout()
plt.savefig('Histogram_Features_Plot.png', dpi=300, bbox_inches='tight')

# Gom Y của Train và Test lại thành 1 bảng để vẽ
y_train_df = pd.DataFrame({'potability_key': y_train, 'Tập dữ liệu': 'Train (80%)'})
y_test_df = pd.DataFrame({'potability_key': y_test, 'Tập dữ liệu': 'Test (20%)'})
y_plot_df = pd.concat([y_train_df, y_test_df])

# Đổi số 0, 1 thành chữ cho biểu đồ thân thiện với người xem
y_plot_df['potability_key'] = y_plot_df['potability_key'].map({0: 'Nước Dơ (0)', 1: 'Nước Sạch (1)'})

# Thiết lập khung vẽ
plt.figure(figsize=(8, 5))
my_palette = {'Train (80%)': '#1f77b4', 'Test (20%)': '#ff7f0e'}

# Vẽ biểu đồ cột theo Tỷ lệ phần trăm
ax = sns.histplot(data=y_plot_df, x='potability_key', hue='Tập dữ liệu',
                  multiple='dodge', stat='percent', shrink=0.8, palette=my_palette)

plt.title('PHÂN PHỐI NHÃN MỤC TIÊU (TARGET VARIABLE: POTABILITY)', fontsize=14, fontweight='bold')
plt.xlabel('Trạng thái nước', fontsize=12)
plt.ylabel('Tỷ lệ (%)', fontsize=12)

# Chạy vòng lặp để in con số % lên đầu mỗi cột cho chuyên nghiệp
for p in ax.patches:
    height = p.get_height()
    if height > 0: # Chỉ in nếu cột có độ cao
        ax.annotate(f'{height:.1f}%', 
                    (p.get_x() + p.get_width() / 2., height), 
                    ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.tight_layout()
plt.savefig('Histogram_Target_Plot.png', dpi=300)