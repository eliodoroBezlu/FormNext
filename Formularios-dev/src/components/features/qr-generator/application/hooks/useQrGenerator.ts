import { useState, useTransition, useCallback } from "react";
import { qrAdapter } from "@/components/features/qr-generator/infrastructure/adapters/qrAdapter";

/**
 * Orquesta el estado y las operaciones de negocio del generador de códigos QR:
 * validación de URL, generación del código, descarga (PNG/SVG), visualización
 * y copiado al portapapeles. Encapsula el acceso a las Server Actions a
 * través de `qrAdapter`.
 */
export const useQrGenerator = () => {
  const [url, setUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  const closeSnackbar = useCallback(() => setSnackbarOpen(false), []);

  const handleGenerateQR = useCallback(() => {
    if (!url.trim()) {
      setError("Por favor ingresa una URL válida");
      return;
    }

    startTransition(async () => {
      try {
        setError("");

        // Validar URL primero
        const validacion = await qrAdapter.validateUrl(url);
        if (!validacion.valida) {
          setError(validacion.mensaje || "URL inválida");
          return;
        }

        // Generar QR
        const response = await qrAdapter.generateQR({
          text: url,
          width: 256,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        if (response.success) {
          setQrCodeUrl(response.data.qrCode);
          showSnackbar("¡Código QR generado exitosamente!");
        } else {
          setError("Error al generar el código QR");
        }
      } catch (err) {
        setError("Error al conectar con el servidor");
        console.error("Error generating QR:", err);
      }
    });
  }, [url, showSnackbar]);

  const handleDownloadPNG = useCallback(async () => {
    if (!url.trim()) return;

    try {
      const { url: imageUrl } = await qrAdapter.getImageUrl(url, {
        width: 512,
        margin: 2,
      });

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      showSnackbar("Imagen PNG descargada");
    } catch (err) {
      console.error("Error downloading PNG:", err);
      setError("Error al descargar la imagen");
    }
  }, [url, showSnackbar]);

  const handleDownloadSVG = useCallback(async () => {
    if (!url.trim()) return;

    try {
      const { url: svgUrl } = await qrAdapter.getSvgUrl(url, { width: 512 });

      const response = await fetch(svgUrl);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `qr-code-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      showSnackbar("Archivo SVG descargado");
    } catch (err) {
      console.error("Error downloading SVG:", err);
      setError("Error al descargar el SVG");
    }
  }, [url, showSnackbar]);

  const handleViewImage = useCallback(async () => {
    if (!url.trim()) return;

    try {
      const { url: imageUrl } = await qrAdapter.getImageUrl(url, {
        width: 512,
        margin: 2,
      });
      window.open(imageUrl, "_blank");
    } catch (err) {
      console.error("Error viewing image:", err);
      setError("Error al abrir la imagen");
    }
  }, [url]);

  const copyQRToClipboard = useCallback(async () => {
    if (!qrCodeUrl) return;

    try {
      // Función helper para convertir data URL a blob
      const dataURLToBlob = (dataURL: string): Blob => {
        const arr = dataURL.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      // Verificar si el navegador soporta la API de portapapeles
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error("API de portapapeles no soportada");
      }

      const blob = dataURLToBlob(qrCodeUrl);

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      showSnackbar("¡Código QR copiado al portapapeles!");
    } catch (err) {
      console.error("Error copying to clipboard:", err);

      if (err instanceof Error && err.message.includes("not supported")) {
        setError("Tu navegador no soporta copiar imágenes. Usa el botón de descarga.");
      } else {
        setError('Error al copiar. Intenta hacer clic derecho en la imagen y seleccionar "Copiar imagen".');
      }
    }
  }, [qrCodeUrl, showSnackbar]);

  return {
    url,
    setUrl,
    qrCodeUrl,
    error,
    isPending,
    snackbarOpen,
    snackbarMessage,
    closeSnackbar,
    handleGenerateQR,
    handleDownloadPNG,
    handleDownloadSVG,
    handleViewImage,
    copyQRToClipboard,
  };
};
