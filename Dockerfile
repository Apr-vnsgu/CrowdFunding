# Development stage
FROM node:21 AS development

WORKDIR /usr/src/app

COPY wait-for-it.sh .

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:21 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=prod

# Copy application code
COPY . .

# Copy the "wait-for-it.sh" script
COPY --from=development /usr/src/app/wait-for-it.sh /usr/src/app/wait-for-it.sh

# Copy the compiled code from the development stage
COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3001

CMD ["bash", "./wait-for-it.sh", "rabbitmq:5672", "--", "node", "dist/main"]
