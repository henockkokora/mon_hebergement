# 🖼️ Gestion des Images - Mon Hébergement

## 📍 Où sont stockées les images ?

Les images uploadées sont stockées dans le dossier **`backend/uploads/`** et servies par le serveur backend Express.

```
backend/
└── uploads/
    ├── 1759610922191_IMG_9422.jpeg
    ├── 1758455163503_maison.jpg
    └── ...
```

## 🔄 Comment ça fonctionne ?

### 1. Upload d'image

Quand un utilisateur upload une image :
- Le fichier est envoyé à l'API `/api/upload`
- Le backend sauvegarde le fichier dans `backend/uploads/`
- L'API retourne l'URL : `/uploads/[nom-fichier]`

### 2. Affichage d'image

Quand l'application affiche une image :
- La fonction `getImageUrl()` transforme `/uploads/[nom-fichier]` en `http://localhost:4000/uploads/[nom-fichier]`
- Le navigateur charge l'image depuis le backend
- Le backend sert le fichier statique

## 🛠️ Fonction utilitaire : `getImageUrl()`

Située dans `app/utils/imageUtils.js`, cette fonction gère tous les types d'URLs d'images :

```javascript
import { getImageUrl } from '@/utils/imageUtils';

// Exemples d'utilisation
const url1 = getImageUrl('/uploads/image.jpg');
// → http://localhost:4000/uploads/image.jpg

const url2 = getImageUrl('image.jpg');
// → http://localhost:4000/uploads/image.jpg

const url3 = getImageUrl('https://example.com/image.jpg');
// → https://example.com/image.jpg (inchangé)
```

## ⚠️ Problèmes courants

### Erreur 404 : Image non trouvée

**Symptôme :** `Failed to load resource: the server responded with a status of 404`

**Causes possibles :**
1. ❌ Le backend n'est pas démarré
2. ❌ L'image n'existe pas dans `backend/uploads/`
3. ❌ Le chemin de l'image est incorrect

**Solutions :**
```bash
# 1. Vérifier que le backend est démarré
cd backend
npm run dev

# 2. Vérifier que l'image existe
ls backend/uploads/

# 3. Vérifier les logs du backend pour les erreurs
```

### Erreur ERR_CONNECTION_REFUSED

**Symptôme :** `Failed to load resource: net::ERR_CONNECTION_REFUSED`

**Cause :** Le backend n'est pas démarré sur le port 4000

**Solution :**
```bash
cd backend
npm run dev
```

### Images qui ne s'affichent pas

**Checklist :**
- [ ] Le backend est démarré (`http://localhost:4000/health` doit répondre)
- [ ] Les images existent dans `backend/uploads/`
- [ ] Pas d'erreurs CORS dans la console du navigateur
- [ ] La variable `NEXT_PUBLIC_API_URL` est correcte (ou utilise la valeur par défaut)

## 🔧 Configuration

### Variables d'environnement

**Backend** (`backend/.env`) :
```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`.env.local` - optionnel) :
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Si `.env.local` n'existe pas, la valeur par défaut `http://localhost:4000` est utilisée.

## 📦 Composants utilisant les images

Tous ces composants utilisent `getImageUrl()` pour charger les images :

- `app/clients/page.js` - Liste des annonces
- `app/clients/favoris/page.js` - Page favoris
- `app/clients/profil/page.js` - Profil utilisateur
- `app/clients/annonce/[id]/page.js` - Détail d'une annonce
- `app/admin/annonces/page.js` - Admin : gestion des annonces
- `app/proprietaires/nouvelle/page.js` - Création d'annonce
- `app/components/CloudinaryImage.js` - Composant image réutilisable

## 🚀 Production

En production, modifiez `NEXT_PUBLIC_API_URL` pour pointer vers votre serveur de production :

```env
NEXT_PUBLIC_API_URL=https://api.monhebergement.com
```

## 🔍 Debug

Pour déboguer les problèmes d'images, ajoutez des logs dans `getImageUrl()` :

```javascript
export function getImageUrl(img) {
  // ... code existant ...
  
  console.log('🖼️ getImageUrl input:', img);
  console.log('🖼️ getImageUrl output:', finalUrl);
  
  return finalUrl;
}
```

Puis vérifiez la console du navigateur pour voir les transformations d'URLs.
