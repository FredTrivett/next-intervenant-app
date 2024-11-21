# Étapes d'installation des dépendances
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copier le dossier src
COPY . .

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Démarrer le serveur en mode développement pour activer le hot reload
CMD ["npm", "run", "dev"]
