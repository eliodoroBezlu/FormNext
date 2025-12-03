import { useState, useEffect } from 'react';
import { Tag, FormularioInspeccion } from '../types/IProps';
import { getAuthHeaders } from '@/lib/actions/helpers';
import { API_BASE_URL } from '@/lib/constants';

export const useDashboardData = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [inspecciones, setInspecciones] = useState<FormularioInspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setError(null);
      const headers = await getAuthHeaders();

      const [tagsResponse, inspeccionesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/tag/`, {
          method: 'GET',
          headers,
        }),
        fetch(`${API_BASE_URL}/inspecciones-emergencia/`, {
          method: 'GET',
          headers,
        }),
      ]);

      if (!tagsResponse.ok) throw new Error(`Error tags: ${tagsResponse.status}`);
      if (!inspeccionesResponse.ok) throw new Error(`Error inspecciones: ${inspeccionesResponse.status}`);

      const tagsData = await tagsResponse.json();
      const inspeccionesData = await inspeccionesResponse.json();

      setTags(tagsData);
      setInspecciones(inspeccionesData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    tags,
    inspecciones,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  };
};