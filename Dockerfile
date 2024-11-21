FROM node:18-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache openssl

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy prisma files
COPY prisma ./prisma/

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
