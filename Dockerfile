FROM node:24-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY app.js ./
COPY FAIL_DEPLOY* ./

EXPOSE 8080
USER node
CMD ["node", "app.js"]
