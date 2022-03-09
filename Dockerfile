FROM node:latest

RUN apt update -y

RUN apt install -y python3
RUN apt install -y pip

RUN pip install bs4
RUN pip install requests

WORKDIR /app/
COPY package.json .

RUN npm install

RUN npm i -g @nestjs/cli

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start:dev"]