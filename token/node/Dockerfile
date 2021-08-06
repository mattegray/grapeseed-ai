FROM node:8-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

COPY . ./

EXPOSE 3000

# Change node user to id 13000 and set as current user
RUN groupmod -g 13000 node && usermod -u 13000 -g 13000 node
USER node

CMD [ "node", "./bin/www" ]
