# 1 段目: Node.js でビルドする（ホストに Node.js は要らない）
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2 段目: できた静的ファイルだけを nginx で配る
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
