#!/bin/bash

# 1. Đường dẫn JAVA trong image eclipse-temurin:17-jre-alpine
export JAVA_HOME=/opt/java/openjdk
export PENTAHO_JAVA_HOME=$JAVA_HOME
export PATH=$JAVA_HOME/bin:$PATH

# 2. Đường dẫn Pentaho BÊN TRONG container (đã mount vào /app)
# Giả sử thư mục data-integration nằm trong folder pentaho/
PDI_DIR="/app/data-integration"

if [ ! -d "$JAVA_HOME" ]; then
    echo "Error: Java directory not found at $JAVA_HOME"
    exit 1
fi

if [ ! -d "$PDI_DIR" ]; then
    echo "Error: Pentaho directory not found at $PDI_DIR"
    echo "Hệ thống đang tìm tại: $PDI_DIR"
    echo "Hãy đảm bảo thư mục 'data-integration' nằm trong folder 'pentaho/' của dự án."
    exit 1
fi

echo "Đang khởi động Pentaho ETL..."
cd "$PDI_DIR"
chmod +x /app/data-integration/*.sh
# LƯU Ý QUAN TRỌNG: 
# Trong Docker (không có màn hình), bạn không dùng ./spoon.sh (GUI).
# Bạn nên dùng ./pan.sh (chạy Transformation .ktr) hoặc ./kitchen.sh (chạy Job .kjb).
# Ở đây mình chạy file transformation nước sạch của bạn:
/app/data-integration/pan.sh -file="/etl/water_etl_pipeline.ktr" -level=Basic