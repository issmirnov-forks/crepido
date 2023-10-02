FROM node:12-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Remove unnecessary files
RUN rm -rf screenshots LICENSE README.md

EXPOSE 8080
CMD [ "npm", "start" ]