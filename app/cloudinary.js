import { Cloudinary } from '@cloudinary/url-gen';

// Configuration côté client avec des valeurs par défaut
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ddha9qehs';

const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    apiSecret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  },
  url: {
    secure: true
  }
});

export { cld, cloudName };
