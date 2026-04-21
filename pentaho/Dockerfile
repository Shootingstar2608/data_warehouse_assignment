FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache bash dos2unix

# Copy toàn bộ nội dung (bao gồm cả data-integration và scripts)
COPY . .

# Cấp quyền thực thi cho TẤT CẢ các file shell trong project
RUN find . -name "*.sh" -exec dos2unix {} + \
    && find . -name "*.sh" -exec chmod +x {} +

CMD ["./scripts/start_pentaho.sh"]