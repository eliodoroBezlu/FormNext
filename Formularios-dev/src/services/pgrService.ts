const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const pgrService = {
  crear: async (data: unknown) => {
    const res = await fetch(`${API_URL}/pgr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear PGR');
    return res.json();
  },

  obtenerTodos: async () => {
    const res = await fetch(`${API_URL}/pgr`);
    if (!res.ok) throw new Error('Error al obtener PGRs');
    return res.json();
  },

  obtenerPorId: async (id: string) => {
    const res = await fetch(`${API_URL}/pgr/${id}`);
    if (!res.ok) throw new Error('Error al obtener PGR');
    return res.json();
  },

  actualizar: async (id: string, data: unknown) => {
    const res = await fetch(`${API_URL}/pgr/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar PGR');
    return res.json();
  },

  aprobar: async (id: string, data: unknown) => {
    const res = await fetch(`${API_URL}/pgr/${id}/aprobar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al aprobar PGR');
    return res.json();
  },

  addSeguimiento: async (id: string, tareaId: string, data: unknown) => {
    const res = await fetch(`${API_URL}/pgr/${id}/seguimiento/tarea/${tareaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.text();
      console.error("Backend error response:", errorData);
      throw new Error(`Detalle backend: ${errorData}. Payload enviado: ${JSON.stringify(data)}`);
    }
    return res.json();
  },

  eliminar: async (id: string) => {
    const res = await fetch(`${API_URL}/pgr/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar PGR');
    return res.json();
  }
};
