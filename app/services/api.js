// Service centralisé pour toutes les API
class ApiService {
  // ...
  // Méthode pour récupérer les stats du propriétaire
  async getProprietaireStats() {
    return this.request('/api/proprietaires/stats');
  }
  constructor() {
    // URL directe vers le backend
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  }

  // Méthode pour obtenir l'URL WebSocket appropriée selon l'environnement
  getWebSocketURL() {
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
                  : 'ws://localhost:4000');
    return host.startsWith('ws') ? host : `${protocol}//${host}`;
  }

  // Récupérer le bon token selon l'espace (client/propriétaire)
  getAuthToken() {
    if (typeof window === 'undefined') return null;
    
    const path = window.location?.pathname || '';
    const ownerToken = localStorage.getItem('auth_token_owner');
    const clientToken = localStorage.getItem('auth_token');
    const adminToken = localStorage.getItem('admin_token');
    
    // Espace admin: utiliser uniquement le token admin
    if (path.startsWith('/admin')) {
      return adminToken || null;
    }
    
    // Espace propriétaire: exiger le token propriétaire uniquement
    if (path.startsWith('/proprietaires')) {
      return ownerToken || null;
    }
    
    // Espace client: exiger le token client uniquement
    if (path.startsWith('/clients')) {
      return clientToken || null;
    }
    
    // Pour les autres cas, ne pas mélanger les rôles
    return null;
  }

  // Méthode générique pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    // Configuration par défaut des en-têtes
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Requested-With': 'XMLHttpRequest'
    };

    // Ajout du token d'authentification si disponible
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Fusion des en-têtes
    const headers = {
      ...defaultHeaders,
      ...(options.headers || {})
    };

    // Configuration de la requête
    const config = {
      method: options.method || 'GET',
      headers,
      credentials: 'include', // Important pour les cookies de session
      mode: 'cors',
      ...(options.body && { 
        body: typeof options.body === 'object' 
          ? JSON.stringify(options.body) 
          : options.body 
      })
    };
    
    try {
      // Journalisation en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API] ${config.method} ${url}`, { 
          headers: config.headers,
          body: config.body 
        });
      }
      
      const response = await fetch(url, config);
      
      // Vérifier si la réponse est vide (204 No Content)
      if (response.status === 204) {
        return null;
      }
      
      // Récupérer le texte de la réponse
      const text = await response.text().catch(() => null);
      let responseData = {};
      
      // Essayer de parser la réponse en JSON
      if (text) {
        try {
          responseData = JSON.parse(text);
        } catch (e) {
          console.error('[API] Erreur de parsing JSON:', e, 'Réponse brute:', text);
          // Si ce n'est pas du JSON, retourner le texte brut
          responseData = { 
            success: false,
            message: 'Réponse invalide du serveur',
            raw: text
          };
        }
      }
      
      // Vérifier si la réponse indique une erreur
      const isError = !response.ok || (responseData && responseData.success === false);
      
      if (isError) {
        // Journalisation des erreurs (pour le développement)
        console.error(`[API] Erreur ${response.status} sur ${endpoint}`, {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        });
        
        // Messages d'erreur conviviaux pour les utilisateurs
        let userMessage = 'Une erreur est survenue';
        
        if (response.status === 400) {
          if (responseData?.message) {
            userMessage = responseData.message;
          } else if (responseData?.errors && Array.isArray(responseData.errors)) {
            // Gérer les erreurs de validation
            const firstError = responseData.errors[0];
            if (firstError?.msg) {
              userMessage = firstError.msg;
            } else if (firstError?.message) {
              userMessage = firstError.message;
            }
          } else {
            userMessage = 'Données invalides. Vérifiez vos informations.';
          }
        } else if (response.status === 401) {
          userMessage = responseData?.message || 'Identifiants incorrects. Vérifiez votre email et mot de passe.';
        } else if (response.status === 403) {
          userMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (response.status === 404) {
          userMessage = 'Ressource non trouvée.';
        } else if (response.status === 409) {
          userMessage = responseData?.message || 'Cette information est déjà utilisée.';
        } else if (response.status === 422) {
          userMessage = responseData?.message || 'Données non conformes.';
        } else if (response.status >= 500) {
          userMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
        } else if (responseData?.message) {
          userMessage = responseData.message;
        }
        
        const error = new Error(userMessage);
        error.status = response.status || 500;
        error.response = responseData || {};
        error.isApiError = true;
        
        throw error;
      }
      return responseData;
      
    } catch (error) {
      // Si c'est déjà une erreur API, on la renvoie telle quelle
      if (error.isApiError) {
        throw error;
      }
      
      // Créer un objet d'erreur plus détaillé pour les autres erreurs
      const errorInfo = {
        message: error.message || 'Erreur inconnue',
        name: error.name || 'Error',
        stack: error.stack,
        status: error.status || 500,
        response: error.response || {},
        isNetworkError: true
      };
      
      console.error('Erreur réseau ou système:', errorInfo);
      
      // Créer une nouvelle erreur avec plus d'informations
      const apiError = new Error(errorInfo.message);
      Object.assign(apiError, errorInfo);
      throw apiError;
    }
  }

  // Méthodes génériques HTTP
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // --- AVIS ---
  async getAvis(annonceId) {
    return this.get(`/api/avis/${annonceId}`);
  }
  async addAvis(annonceId, data) {
    return this.post(`/api/avis/${annonceId}`, data);
  }
  // Méthodes pour les annonces
  async getAnnonces() {
    return this.request('/api/annonces');
  }

  async getAnnonce(id) {
    return this.request(`/api/annonces/public/${id}`);
  }

  async getAnnoncePrivee(id) {
    return this.request(`/api/annonces/${id}`);
  }

  async createAnnonce(data) {
    return this.request('/api/annonces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnnonce(id, data) {
    return this.request(`/api/annonces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnonce(id) {
    return this.request(`/api/annonces/${id}`, {
      method: 'DELETE',
    });
  }

  async renewAnnonce(id, duree) {
    return this.request(`/api/annonces/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ duree }),
    });
  }

  // Méthodes pour le profil
  async getProfile() {
    return this.request('/api/auth/me', { method: 'GET' });
  }

  async updatePassword({ oldPassword, newPassword }) {
    return this.request('/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }

  // Méthodes d'authentification
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // Connexion avec téléphone et mot de passe
  async loginPhone(credentials) {
    return this.request('/api/auth/login-phone', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // Méthodes pour les favoris
  async getFavorites() {
    console.log('getFavorites called');
    try {
      const token = this.getAuthToken();
      console.log('Current auth token:', token ? 'Present' : 'Missing');
      const result = await this.request('/api/favorites');
      console.log('Favorites API response:', result);
      return result;
    } catch (error) {
      console.error('Error in getFavorites:', error);
      throw error;
    }
  }

  async addFavorite(annonceId) {
    return this.request(`/api/favorites/${annonceId}`, {
      method: 'POST'
    });
  }

  async removeFavorite(annonceId) {
    return this.request(`/api/favorites/${annonceId}`, {
      method: 'DELETE'
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Méthodes pour l'upload
  async uploadFiles(files) {
    const formData = new FormData();
    
    // Gérer les différents types d'entrée
    if (files instanceof FormData) {
      // Si c'est déjà un FormData, l'utiliser directement
      const token = this.getAuthToken();
      
      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: files,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur upload');
      }
      
      return data;
    } else {
      // Si c'est un tableau de fichiers
      files.forEach(file => formData.append('files', file));
      
      const token = this.getAuthToken();
      
      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur upload');
      }
      
      return data;
    }
  }

  // Créer un signalement (report)
  async createReport(data) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Méthodes pour l'OTP
  async sendOTP(phoneNumber) {
    return this.request('/api/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOTP(phoneNumber, code) {
    return this.request('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
    });
  }

  async resendOTP(phoneNumber) {
    return this.request('/api/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async getOTPStatus(phoneNumber) {
    return this.request(`/api/otp/status/${phoneNumber}`);
  }

  // Méthodes spécifiques pour les annonces
  async getMyAnnonces() {
    return this.request('/api/annonces/my');
  }

  async getAnnonceById(id) {
    return this.request(`/api/annonces/${id}`);
  }
  // Vérification numéro de téléphone (centralisé)
  async checkPhoneNumber(phoneNumber) {
    return this.request(`/api/auth/check-phone?phone=${encodeURIComponent(phoneNumber)}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  }

  // ====== ADMIN ======
  async getUsersCount() {
    return this.get('/api/auth/users/count');
  }
  async getUsers(params) {
    const qs = new URLSearchParams(params || {}).toString();
    return this.get(`/api/auth/users${qs ? `?${qs}` : ''}`);
  }
  async blockUser(userId, reason) {
    return this.post(`/api/auth/users/${userId}/block`, { reason });
  }
  async unblockUser(userId) {
    return this.post(`/api/auth/users/${userId}/unblock`);
  }
  async getReports({ status = 'all', page = 1, limit = 20 } = {}) {
    const qs = new URLSearchParams({ status, page: String(page), limit: String(limit) }).toString();
    return this.get(`/api/reports?${qs}`);
  }
  async setReportInProgress(reportId) {
    return this.request(`/api/reports/${reportId}/in-progress`, { method: 'PATCH' });
  }
  async resolveReport(reportId) {
    return this.request(`/api/reports/${reportId}/resolve`, { method: 'PATCH' });
  }
  async resolveDeleteReport(reportId) {
    return this.request(`/api/reports/${reportId}/resolve-delete`, { method: 'PATCH' });
  }
  async getActiveStats(range) {
    const r = range || '7d';
    return this.get(`/api/annonces/admin/active-stats?range=${encodeURIComponent(r)}`);
  }
  async getViewsStats(range) {
    const r = range || '7d';
    return this.get(`/api/annonces/admin/active-stats?range=${encodeURIComponent(r)}`);
  }
  async getNewAnnoncesPerDay(days) {
    const d = String(days || 7);
    return this.get(`/api/annonces/admin/new-per-day?days=${encodeURIComponent(d)}`);
  }
  async adminAttachMatterport(annonceId, payload) {
    return this.request(`/api/annonces/${annonceId}/matterport`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  }

  // Tarifs (admin)
  async getTarifs() {
    return this.get('/api/tarifs');
  }
  async createTarif(data) {
    return this.request('/api/tarifs', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateTarif(id, data) {
    return this.request(`/api/tarifs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteTarif(id) {
    return this.request(`/api/tarifs/${id}`, { method: 'DELETE' });
  }

  // Tarifs pour les propriétaires (public)
  async getProprietaireTarifs() {
    return this.get('/api/tarifs');
  }
}

// Instance singleton
const apiService = new ApiService();
export default apiService;