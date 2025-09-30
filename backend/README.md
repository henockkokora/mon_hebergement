# MonHebergement - Backend

API Node.js/Express avec MongoDB (Mongoose) pour gérer les annonces.

## Prérequis
- Node.js 18+
- MongoDB (Atlas ou local)

## Installation
```bash
npm install
```

## Variables d'environnement
Créer un fichier `.env` dans `backend/` avec les clés suivantes:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/monhebergement
# Liste d'origines autorisées séparées par des virgules (ex: http://localhost:3000)
CORS_ORIGIN=http://localhost:3000
```

## Démarrer le serveur
- Développement (watch):
```bash
npm run dev
```
- Production:
```bash
npm start
```

Le serveur démarre par défaut sur `http://localhost:4000`.

## Endpoints
- `GET /health` - Vérifie l'état du service.
- `POST /api/annonces` - Crée une annonce.

### Créer une annonce
Requête (JSON):
```json
{
  "proprietaireId": "64f0c2b8f1a2b3c4d5e6f7a8",
  "titre": "Appartement cosy au centre",
  "description": "Bel appartement lumineux proche des commodités.",
  "adresse": "12 Rue des Fleurs",
  "ville": "Paris",
  "pays": "France",
  "prixParNuit": 85,
  "capacite": 2,
  "photos": ["https://exemple.com/photo1.jpg"],
  "disponibilites": { "start": "2025-09-12", "end": "2025-12-31" },
  "amenities": ["wifi", "ascenseur"],
  "isActive": true
}
```
Réponse 201:
```json
{
  "message": "Annonce créée avec succès",
  "annonce": { "_id": "...", "titre": "...", "createdAt": "...", ... }
}
```

## Notes
- `proprietaireId` est référencé comme un `ObjectId` (ex: collection `User`).
- Les validations sont faites via `express-validator` et Mongoose.
- Sécurité: `helmet`, CORS; Logs: `morgan`.
