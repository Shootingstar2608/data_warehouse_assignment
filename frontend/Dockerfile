FROM node:20-alpine

WORKDIR /app

# Copy các file quản lý thư viện trước để tận dụng Docker cache
COPY package.json ./
# Nếu bạn dùng pnpm (thấy có cấu hình pnpm trong file), hãy bỏ comment 2 dòng dưới
# RUN npm install -g pnpm
# RUN pnpm install

RUN npm install

COPY . .

# Vite 6 mặc định dùng port 5173
EXPOSE 5173

CMD ["npm", "run", "dev"]