FROM node:22.14.0

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
