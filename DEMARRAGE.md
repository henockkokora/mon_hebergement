# 🚀 Guide de démarrage - Mon Hébergement

## Prérequis
- Node.js (v16 ou supérieur)
- MongoDB (local ou Atlas)
- npm ou yarn

## 📋 Configuration

### 1. Configuration du Backend

Créez un fichier `.env` dans le dossier `backend/` avec le contenu suivant :

```env
# MongoDB
MONGODB_URI=mongodb+srv://henockkokora18:pXq4YbApBBM2lSHe@cluster0.ihcao.mongodb.net/monhebergement?retryWrites=true&w=majority&appName=Cluster0

# Port du serveur
PORT=4000

# JWT Secret (changez cette valeur en production)
JWT_SECRET=votre_secret_jwt_super_securise_ici

# Admin par défaut
ADMIN_USERNAME=admin@monhebergement.com
ADMIN_PASSWORD=Admin123!

# CORS (en développement, peut être vide)
CORS_ORIGIN=http://localhost:3000

# Environnement
NODE_ENV=development
```

### 2. Configuration du Frontend

Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ddha9qehs
```

## 🏃 Démarrage

### Démarrer le Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

Le backend démarrera sur `http://localhost:4000`

### Démarrer le Frontend (Terminal 2)

```bash
# À la racine du projet
npm install
npm run dev
```

Le frontend démarrera sur `http://localhost:3000`

## ✅ Vérification

1. **Backend** : Ouvrez `http://localhost:4000/health` - vous devriez voir `{"status":"ok","uptime":...}`
2. **Frontend** : Ouvrez `http://localhost:3000` - l'application devrait se charger
3. **Images** : Les images devraient maintenant s'afficher correctement

## 🖼️ Gestion des Images

Les images sont stockées dans `backend/uploads/` et servies par le backend à l'URL `http://localhost:4000/uploads/[nom-fichier]`.

Le frontend utilise automatiquement cette URL grâce à la fonction `getImageUrl()` dans `app/utils/imageUtils.js`.

## 🐛 Dépannage

### Les images ne s'affichent pas
- ✅ Vérifiez que le backend est bien démarré
- ✅ Vérifiez que les images existent dans `backend/uploads/`
- ✅ Vérifiez la console du navigateur pour les erreurs CORS

### Erreur de connexion MongoDB
- ✅ Vérifiez que l'URI MongoDB est correcte dans `backend/.env`
- ✅ Vérifiez que votre IP est autorisée dans MongoDB Atlas

### Port déjà utilisé
- Backend : Changez `PORT` dans `backend/.env`
- Frontend : Changez le port avec `npm run dev -- -p 3001`

## 📦 Structure des dossiers

```
mon_hebergement-main/
├── app/                    # Frontend Next.js
│   ├── clients/           # Pages clients
│   ├── proprietaires/     # Pages propriétaires
│   ├── admin/             # Pages admin
│   ├── components/        # Composants réutilisables
│   ├── services/          # Services API
│   └── utils/             # Utilitaires (dont imageUtils.js)
├── backend/               # Backend Express
│   ├── src/
│   │   ├── routes/       # Routes API
│   │   ├── models/       # Modèles MongoDB
│   │   ├── middleware/   # Middlewares
│   │   └── config/       # Configuration
│   └── uploads/          # Dossier des images uploadées
└── public/               # Fichiers statiques Next.js
```

## 🔐 Compte Admin par défaut

- Email : `admin@monhebergement.com`
- Mot de passe : `Admin123!`

(Changez ces valeurs dans `backend/.env`)
