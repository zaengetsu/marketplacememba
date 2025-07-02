FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache python3 make g++

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances Node.js
RUN npm ci --only=production

# Copie du code source
COPY . .

# Création du dossier de logs
RUN mkdir -p logs

# Variables d'environnement par défaut
ENV NODE_ENV=development
ENV PORT=4000

# Exposition du port
EXPOSE 4000

# Commande par défaut
CMD ["npm", "start"] 