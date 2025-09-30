'use client';

import { AdvancedImage } from '@cloudinary/react';
import { cld, cloudName } from '../cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as qAuto } from '@cloudinary/url-gen/qualifiers/quality';

export default function CloudinaryImage({ 
  src, 
  alt = "", 
  width = 300, 
  height = 200, 
  className = "",
  ...props 
}) {
  if (!src) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500">Pas d'image</span>
      </div>
    );
  }

  // Si c'est déjà une URL complète (https://...)
  if (src.startsWith('http')) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  }

  // Pour Cloudinary
  try {
    // Si c'est une URL complète Cloudinary, extraire le public_id
    let publicId = src;
    if (src.includes('res.cloudinary.com')) {
      const parts = src.split('/');
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
