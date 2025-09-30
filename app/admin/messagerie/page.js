"use client";
"use client";
import { useState, useEffect } from "react";
import apiService from "@/services/api";

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function AdminMessagerie() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchSupportThreads() {
      try {
        setLoading(true);
        const res = await apiService.get('/api/threads/support');
        if (res.success) {
          setThreads(res.data || []);
        } else {
          setError('Erreur lors du chargement des messages');
        }
      } catch (err) {
        setError(err.message || 'Erreur de connexion');
      } finally {
        setLoading(false);
      }
    }
    fetchSupportThreads();
  }, []);

  const handleMessageClick = (thread) => {
    setSelectedMessage(thread);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });

  const handleDeleteClick = (threadId, e) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;
    
    setDeleteStatus({ loading: true, error: null });
    
    try {
      const res = await apiService.delete(`/api/threads/support/${threadToDelete}`);
      if (res.success) {
        setThreads(prev => prev.filter(t => t._id !== threadToDelete));
        if (selectedMessage?._id === threadToDelete) {
          closeModal();
        }
      } else {
        setDeleteStatus({ loading: false, error: 'Erreur lors de la suppression' });
        return;
      }
    } catch (err) {
      setDeleteStatus({ loading: false, error: 'Erreur: ' + (err.message || 'Erreur inconnue') });
      return;
    }
    
    setShowConfirmDialog(false);
    setThreadToDelete(null);
    setDeleteStatus({ loading: false, error: null });
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setThreadToDelete(null);
    setDeleteStatus({ loading: false, error: null });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-[#24766A]">Messages reçus</h1>
      
      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Supprimer le message</h3>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
              </p>
            </div>
            
            {deleteStatus.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {deleteStatus.error}
              </div>
            )}
            
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteStatus.loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {deleteStatus.loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : 'Supprimer'}
              </button>
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteStatus.loading}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#24766A]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-black/10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message reçu</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tous les messages de vos clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="bg-white rounded-2xl border border-black/10 overflow-hidden">
          {threads.map(thread => (
            <li key={thread._id} className="border-b border-black/10 last:border-b-0">
              <div className="flex items-center hover:bg-[#e7f6f3] transition">
                <button
                  onClick={() => handleMessageClick(thread)}
                  className="flex-1 text-left px-5 py-4 focus:outline-none flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-[#24766A]">
                      {thread.metadata?.nom || 'Utilisateur'}
                      <span className="ml-2 text-xs text-neutral-500 font-normal">(client)</span>
                    </span>
                    <p className="text-sm text-neutral-700 truncate mt-1">
                      {thread.lastMessage || 'Nouveau message'}
                    </p>
                  </div>
                  <span className="bg-[#24766A] text-white text-xs px-2 py-1 rounded-full">
                    {thread.messageCount || 0}
                  </span>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(thread._id, e)}
                  className="px-4 py-4 text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                  title="Supprimer ce message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-black/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#24766A]">
                {selectedMessage.metadata?.nom || 'Utilisateur'}
                <span className="ml-2 text-sm text-neutral-500">(client)</span>
              </h3>
              <button
                onClick={closeModal}
                className="text-neutral-500 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-2">
                  {formatDate(selectedMessage.updatedAt)}
                </p>
                <p className="whitespace-pre-line">
                  {selectedMessage.lastMessage || 'Aucun contenu'}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-black/10">
                <h4 className="font-medium text-sm text-neutral-700 mb-2">Coordonnées :</h4>
                <p className="text-sm">
                  <span className="font-medium">Email :</span> {selectedMessage.metadata?.email || 'Non fourni'}<br />
                  {selectedMessage.metadata?.telephone && (
                    <>
                      <span className="font-medium">Téléphone :</span> {selectedMessage.metadata.telephone}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#24766A] text-white rounded-lg hover:bg-[#1e665c] transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
