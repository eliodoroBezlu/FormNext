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
/**
 * Sube un archivo a Cloudinary y devuelve su URL.
 *
 * Es un Server Action: las claves de Cloudinary viven en el servidor y nunca
 * llegan al navegador. Lo que se guarda en la base es **solo la URL**, nunca
 * la imagen.
 *
 * `carpeta` es opcional y mantiene el valor histórico por defecto, para no
 * mover de sitio lo que ya está subido.
 */
export const uploadImageToCloudinary = async (
  formData: FormData,
  carpeta = "templates-inspecciones"
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
    const isImage = file.type.startsWith("image/");

    /**
     * El SVG necesita trato aparte.
     *
     * Va por stream y sin nombre de archivo, así que `resource_type: "auto"`
     * no consigue reconocerlo —es texto XML, no tiene firma binaria— y lo
     * guarda como archivo crudo: sin formato, sin vista previa y con un
     * `public_id` sin extensión. Es el mismo problema que el comentario de
     * abajo describe para Excel y Word, pero al SVG no le llegaba ese arreglo
     * porque entra por la rama de imagen.
     *
     * Con `format` explícito Cloudinary ya no tiene que adivinar.
     */
    const esSvg =
      file.type === "image/svg+xml" ||
      file.name.toLowerCase().endsWith(".svg");

    const uploadOptions: Record<string, unknown> = {
      folder: carpeta,
      resource_type: isImage ? "auto" : "raw",
    };

    if (esSvg) {
      uploadOptions.resource_type = "image";
      uploadOptions.format = "svg";
    }

    if (!isImage) {
      // Los archivos 'raw' (Excel, Word, ZIP) pierden su extensión al subirse por stream si no se especifica.
      // Forzamos un public_id que incluya la extensión original para que puedan ser descargados correctamente.
      const ext = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 10);
      uploadOptions.public_id = `doc_${Date.now()}_${randomId}.${ext}`;
    }

    // Al SVG **no** se le aplican transformaciones: redimensionar y
    // `fetch_format: auto` lo rasterizarían a PNG o WebP, que es justo perder
    // lo único que aporta un vector. Y no hace falta: pesa unos pocos kB.
    if (isImage && !esSvg) {
      uploadOptions.transformation = [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
        { dpr: "auto" },
        { flags: "progressive" },
      ];
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          uploadOptions,
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