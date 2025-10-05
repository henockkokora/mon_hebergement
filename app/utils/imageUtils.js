// Utilitaire pour la gestion des URLs d'images
export function getImageUrl(img) {
  if (!img) return null;
  
  // Si c'est une chaîne vide ou un objet vide, on retourne null
  if (typeof img === 'string' && img.trim() === '') return null;
  if (typeof img === 'object' && Object.keys(img).length === 0) return null;
  
  // Gestion des différents formats d'image
  let url = '';
  if (typeof img === 'string') {
    url = img;
  } else if (img && typeof img === 'object' && img.url) {
    url = img.url;
  } else {
    return null;
  }
  
  // Nettoyage de l'URL
  url = url.trim();
  if (!url) return null;
  
  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (url.startsWith('http')) return url;
  
  // URL du backend API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  // Si c'est un chemin relatif qui commence par /uploads/
  // Les images sont maintenant dans public/uploads/ (servies par Next.js)
  if (url.startsWith('/uploads/')) {
    return url; // Retourner directement le chemin relatif pour Next.js
  }
  
  // Si c'est juste un nom de fichier, l'ajouter au dossier uploads du backend
  if (!url.startsWith('/')) {
    return `${API_URL}/uploads/${url}`;
  }
  
  // Pour tous les autres chemins relatifs, les servir depuis le backend
  return `${API_URL}${url}`;
}

// Fonction pour obtenir l'URL complète d'une image (pour compatibilité avec l'ancien code)
export function withApiUrl(url) {
  if (!url) return url;
  const s = typeof url === 'string' ? url : (url.url || '');
  if (!s) return s;
  if (s.startsWith('http')) return s;
  
  // Utiliser la nouvelle logique de getImageUrl
  return getImageUrl(s) || s;
}
