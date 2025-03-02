import axios from 'axios';

export const fetchPdf = async (id: string): Promise<void> => {
  try {
    const response = await axios.get(`http://localhost:3001/inspecciones/${id}/pdf`, {
      responseType: 'blob', // Importante para manejar archivos binarios
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inspeccion_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Error fetching PDF:', error);
  }
};