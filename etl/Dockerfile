# Sử dụng Python phiên bản nhẹ
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt các công cụ hệ thống cần thiết (nếu cần cho psycopg2)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements và cài đặt thư viện
# Đảm bảo bạn đã có file requirements.txt trong thư mục etl/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code ETL vào container
COPY . .

# Lệnh mặc định để giữ container không bị tắt (để bạn vào chạy script thủ công)
CMD ["tail", "-f", "/dev/null"]