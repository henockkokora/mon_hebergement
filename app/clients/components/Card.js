import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';
import { getImageUrl } from '@/utils/imageUtils';
import CloudinaryImage from '../../components/CloudinaryImage';

function Card({ item, isLoggedIn }) {
  let imageSrc = getImageUrl(item.image) || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=60";
  const unitePrix = "par mois";
  const [isLoading, setIsLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!isLoggedIn) {
        setLiked(false);
        return;
      }
      try {
        const response = await apiService.getFavorites();
        const favorites = Array.isArray(response) ? response : (response.data || []);
        const isLiked = favorites.some(fav => {
          const favId = fav._id || fav;
          return favId === item.id || favId === item._id;
        });
        setLiked(isLiked);
      } catch (error) {
        setLiked(false);
      }
    };
    checkIfLiked();
  }, [isLoggedIn, item.id, item._id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push('/clients/connexion');
      return;
    }
    const previousLikedState = liked;
    const annonceId = item.id || item._id;
    const action = previousLikedState ? 'remove' : 'add';
    if (!annonceId) return;
    setLiked(!previousLikedState);
    setIsLoading(true);
    try {
      let response;
      if (action === 'remove') {
        response = await apiService.removeFavorite(annonceId);
      } else {
        response = await apiService.addFavorite(annonceId);
      }
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Erreur favoris');
      }
    } catch (error) {
      setLiked(previousLikedState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a href={`/clients/annonce/${item.id}`} className="group min-w-[230px] max-w-[230px] block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow">
        <CloudinaryImage 
          src={imageSrc}
          alt={item.title}
          width={300}
          height={200}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow text-[16px] flex items-center justify-center transition-colors duration-150 ${liked ? 'text-red-500' : 'text-gray-400'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={handleLike}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : liked ? (
            '❤️'
          ) : (
            '🤍'
          )}
        </button>
      </div>
      <div className="mt-2 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="text-[17px] md:text-base font-semibold text-neutral-900 truncate">{item.title}</div>
          <div className="text-[12px] md:text-sm font-medium text-neutral-700"><span className="text-yellow-400">★</span> {item.rating ? item.rating.toFixed(1) : 'N/A'}</div>
        </div>
        <div className="text-[14px] md:text-sm text-neutral-700 truncate">{item.subtitle}</div>
        <div className="text-[17px] md:text-base text-neutral-900"><span className="font-semibold">{item.price} FCFA</span> <span className="text-neutral-700">{unitePrix}</span></div>
      </div>
    </a>
  );
}

export default Card;
