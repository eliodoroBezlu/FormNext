import { useState } from 'react';
import { uploadImageAdapter } from '../../infrastructure/adapters/cloudinaryAdapter';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    // Validaciones de dominio
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande (máximo 5MB)");
      setIsUploading(false);
      return null;
    }

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      setIsUploading(false);
      return null;
    }

    try {
      const url = await uploadImageAdapter(file);
      return url;
    } catch (err) {
      console.error(err);
      setError("Error al subir el archivo a Cloudinary");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error, setError };
};
