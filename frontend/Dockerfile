FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache python3 make g++

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances Node.js
RUN npm ci

# Copie du code source
COPY . .

# Variables d'environnement
ENV NODE_ENV=development

# Exposition du port Vite
EXPOSE 5173

# Commande par défaut pour le développement
CMD ["npm", "run", "dev", "--", "--host"] 