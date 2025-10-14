"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResponse {
  url: string;
  publicId: string;
}

// Tipo para el resultado de Cloudinary
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: unknown; // Para otras propiedades que pueda tener
}

// Server Action para subir imagen
export const uploadImageToCloudinary = async (
  formData: FormData
): Promise<CloudinaryResponse> => {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No se proporcionó archivo");
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary usando un Promise
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "templates-inspecciones",
            resource_type: "auto",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
              { dpr: "auto" },
              { flags: "progressive" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result as CloudinaryUploadResult);
            else reject(new Error("No se recibió resultado de Cloudinary"));
          }
        )
        .end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw new Error("Error al subir la imagen a Cloudinary");
  }
};

// Server Action para eliminar imagen
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    if (!publicId) {
      throw new Error("No se proporcionó publicId");
    }

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    throw new Error("Error al eliminar la imagen de Cloudinary");
  }
};