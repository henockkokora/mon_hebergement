'use client';

import { AdvancedImage } from '@cloudinary/react';
import { cld, cloudName } from '../cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as qAuto } from '@cloudinary/url-gen/qualifiers/quality';
import { getImageUrl } from '@/utils/imageUtils';

export default function CloudinaryImage({ 
  src, 
  alt = "", 
  width = 300, 
  height = 200, 
  className = "",
  ...props 
}) {
  // Normaliser l'URL de l'image avec getImageUrl
  const normalizedSrc = getImageUrl(src);
  
  if (!normalizedSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500">Pas d'image</span>
      </div>
    );
  }

  // Si c'est une URL complète (https://...) ou un chemin local (/uploads/...)
  if (normalizedSrc.startsWith('http') || normalizedSrc.startsWith('/')) {
    return (
      <img 
        src={normalizedSrc} 
        alt={alt} 
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  }

  // Pour Cloudinary uniquement si ce n'est pas un chemin local
  try {
    // Si c'est une URL complète Cloudinary, extraire le public_id
    let publicId = normalizedSrc;
    if (normalizedSrc.includes('res.cloudinary.com')) {
      const parts = normalizedSrc.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex > 0) {
        publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
      }
    }

    const cldImage = cld.image(publicId)
      .resize(fill().width(width).height(height))
      .format(auto())
      .quality(qAuto());

    return (
      <AdvancedImage
        cldImg={cldImage}
        alt={alt}
        className={className}
        {...props}
      />
    );
  } catch (error) {
    console.error('Erreur avec Cloudinary:', error);
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-500">Erreur image</span>
      </div>
    );
  }
}
