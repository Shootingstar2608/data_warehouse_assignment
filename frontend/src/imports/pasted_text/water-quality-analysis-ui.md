Prompt Figma Giao Diện Phân Tích & Huấn Luyện Chất Lượng Nước
Chủ đề: Giao diện ứng dụng web/máy tính để bàn hiện đại, sạch sẽ.
Màu sắc: Nền trắng chủ đạo. Các yếu tố giao diện (button, thanh điều hướng, điểm nhấn biểu đồ) sử dụng các tông màu xanh nước biển (cyan, trời, dương) tạo cảm giác tươi mới, tin cậy và liên quan đến nước.
Bố cục:

Menu (Bên Trái): Một thanh điều hướng hẹp, cố định bên trái, nền trắng hoặc xanh nhạt. Chứa logo ứng dụng (ví dụ: hình giọt nước và đồ thị), tên ứng dụng (Ví dụ: "WaterPotability AI") và 3 nút/tab chính với icon và nhãn Tiếng Việt rõ ràng:

Dashboard / Phân Tích

Huấn Luyện ML

Huấn Luyện Học Sâu

Khu Vực Nội Dung Chính (Bên Phải): Chiếm phần lớn diện tích, thay đổi nội dung tùy theo tab được chọn trong Menu.

Tab 1: Dashboard / Phân Tích Dữ Liệu (EDA)
Tiêu đề Tab: "Dashboard / Phân Tích Chi Tiết Dữ Liệu"

Nội dung: Bố cục dạng lưới (grid) các thẻ (cards) chứa thông tin và biểu đồ.

Thẻ 1: Thông Tin Chung (Overview):

Tiêu đề: "Thông Tin Bộ Dữ Liệu"

Nội dung: Các con số lớn (KPIs) hiển thị số lượng mẫu, số lượng biến, phần trăm mẫu an toàn (Potability=1) và không an toàn (Potability=0). Ví dụ: "Số mẫu: 3276", "% An toàn: 40%".

Biểu đồ nhỏ: Một biểu đồ tròn (Pie Chart) hoặc biểu đồ thanh đơn giản (Bar Chart) hiển thị tỷ lệ mẫu An toàn / Không an toàn. Ghi chú rõ ràng: "An toàn", "Không an toàn".

Thẻ 2 & 3: Phân Bố Biến Key (Distributions):

Tiêu đề: "Phân Bố Độ pH" (Thẻ 2), "Phân Bố Độ Cứng" (Thẻ 3).

Nội dung:

Biểu đồ 1 (Histogram hoặc Boxplot): Hiển thị phân bố tần suất của biến ph. Gợi ý cho Figma: Vẽ dạng Histogram với các cột màu xanh nước biển, trục hoành "Độ pH", trục tung "Số mẫu".

Biểu đồ 2 (Histogram hoặc Boxplot): Hiển thị phân bố tần suất của biến Hardness. Gợi ý cho Figma: Vẽ dạng Boxplot với hộp màu xanh, trục hoành "Độ cứng", trục tung "Giá trị". Có thể chia Boxplot theo Potability để so sánh.

Thẻ 4: Tương Quan Giữa Các Biến (Correlations):

Tiêu đề: "Bản Đồ Tương Quan"

Nội dung: Một Heatmap (biểu đồ nhiệt) thể hiện độ tương quan (Correlation Matrix) giữa tất cả các biến số đo được (ph, Hardness, Solids, Chloramines, Sulfate, Conductivity, Organic_carbon, Trihalomethanes, Turbidity) và Potability.

Gợi ý cho Figma: Vẽ dạng lưới các ô vuông nhỏ, màu sắc chuyển từ xanh nhạt (tương quan thấp/âm) sang xanh đậm (tương quan cao/dương). Label tên biến ở trục hoành và trục tung (Tiếng Việt nếu có thể, hoặc giữ tên biến gốc).

Thẻ 5: Tương Quan Key & Độ An Toàn (Bivariate Insights):

Tiêu đề: "Mối Liên Hệ Key & Độ An Toàn"

Nội dung: Chọn 1-2 mối quan hệ quan trọng.

Biểu đồ 1: Boxplot hoặc Scatter Plot (biểu đồ phân tán) của ph so với Potability. Gợi ý cho Figma: Hai Boxplot đứng cạnh nhau cho Potability=0 và Potability=1, trục tung "Độ pH". Hoặc Scatter Plot của ph (trục hoành) vs một biến khác (Sulfate - trục tung), điểm được tô màu xanh khác nhau dựa trên Potability.

Biểu đồ 2: Tương tự cho Sulfate hoặc Hardness so với Potability.

Tab 2: Huấn Luyện ML (Xác Định Label Potability)
Tiêu đề Tab: "Huấn Luyện Mô Hình ML / Xác Định Độ An Toàn"

Nội dung: Bố cục chia thành các phần rõ ràng, dạng form và bảng kết quả.

Phần 1: Cấu Hình Dữ Liệu (Data Configuration):

Dropdown: "Chọn bộ dữ liệu", "Chọn các biến đầu vào" (cho phép tích chọn ph, Hardness, v.v. - trừ Potability).

Input/Slider: "Tỷ lệ tập Test (%)", "Seed ngẫu nhiên".

Phần 2: Chọn Mô Hình & Tham Số (Model & Parameters):

Dropdown: "Chọn mô hình ML" (Các tùy chọn: Random Forest, Decision Tree, Support Vector Machine, Gradient Boosting, v.v.).

Khu vực động hiển thị các tham số tương ứng của mô hình được chọn (ví dụ: Random Forest có Sliders/Inputs cho "Số cây", "Độ sâu tối đa").

Phần 3: Huấn Luyện & Kết Quả (Training & Results):

Button lớn: "Huấn Luyện Mô Hình" (Màu xanh đậm nổi bật).

Khu vực hiển thị kết quả:

Bảng: Hiển thị các độ đo đánh giá mô hình trên tập Test: "Accuracy", "Precision", "Recall", "F1-Score". Ghi chú rõ ràng: "Kết Quả Trên Tập Test".

Gợi ý cho Figma: Một bảng với 2 hàng: tên độ đo và giá trị (placeholders), Viet label.

Có thể có thêm Confusion Matrix đơn giản (bảng 2x2) hiển thị placeholders cho True Positives, False Positives, v.v. với Viet labels.

Tab 3: Huấn Luyện Học Sâu (DL)
Tiêu đề Tab: "Huấn Luyện Mô Hình Học Sâu / Xác Định Độ An Toàn"

Nội dung: Bố cục tương tự ML nhưng có các yếu tố đặc thù của DL.

Phần 1: Cấu Hình Dữ Liệu & Kiến Trúc (Data & Architecture):

Form field description giống ML.

Thiết kế Kiến Trúc: Một khu vực trực quan hơn để cấu hình mạng neural.

Input fields description: "Số lớp ẩn", "Chọn hàm kích hoạt (Activation)" cho từng lớp.

Gợi ý cho Figma: Vẽ một sơ đồ đơn giản các lớp mạng neural (placeholders các ô tròn/vuông nối nhau), Viet labels cho Input, Hidden, Output layers.

Phần 2: Tham Số Huấn Luyện (Training Parameters):

Input/Sliders: "Batch Size", "Epochs", "Learning Rate", "Chọn Optimizer".

Phần 3: Huấn Luyện & Kết Quả (Training & Results):

Button lớn: "Huấn Luyện Mô Hình Học Sâu".

Khu vực hiển thị kết quả:

Biểu đồ 1 & 2: Biểu đồ đường (Line Charts) hiển thị placeholders cho "Loss" (Độ mất mát) và "Accuracy" qua các Epochs cho cả tập Train và Validation. Gợi ý cho Figma: Hai biểu đồ đường xanh/khác màu trên cùng một trục hoành "Epochs", trục tung "Giá trị". Viet titles, Viet legend ("Train Loss", "Val Loss", v.v.).

Bảng kết quả cuối cùng trên tập Test giống ML với Viet labels.