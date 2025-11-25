'use server';
 // Ajusta la ruta según tu proyecto
import { getAuthHeaders } from "@/lib/actions/helpers";

interface MLRecommendation {
  current_score: number;
  predicted_optimal_score: number;
  current_level: string;
  target_level: string;
  confidence: number;
  improvement_gap: number;
  priority: string;
  recommended_actions: string[];
  analysis: string;
}

interface GetRecommendationParams {
  question_text: string;
  current_response: number;
  comment?: string;
  context?: {
    sectionCompliance?: number;
    overallCompliance?: number;
    area?: string;
    naCount?: number;
  };
}

/**
 * Helper para obtener headers de autenticación
 */


/**
 * Obtiene recomendaciones ML del backend
 */
export async function getMLRecommendation(
  params: GetRecommendationParams
): Promise<{
  success: boolean;
  recommendation?: MLRecommendation;
  error?: string;
}> {
  try {
    console.log('🔄 [Server Action] Obteniendo recomendación ML');
    console.log('📝 Params:', JSON.stringify(params, null, 2));

    // 🔥 Obtener headers con autenticación
    const headers = await getAuthHeaders();

    // 🔥 URL del backend NestJS
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const endpoint = `${apiUrl}/ml-recommendations/recommend`;

    console.log('🎯 Endpoint:', endpoint);
    console.log('🔑 Headers:', { ...headers, Authorization: 'Bearer [REDACTED]' });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    console.log('📡 Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      
      // 🔥 Manejo específico de errores de autenticación
      if (response.status === 401) {
        return {
          success: false,
          error: 'No autorizado. Por favor, inicia sesión nuevamente.',
        };
      }
      
      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permisos para acceder a este recurso.',
        };
      }

      return {
        success: false,
        error: `Error ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ Data recibida:', JSON.stringify(data, null, 2));

    if (data.status === 'success' && data.recommendation) {
      return {
        success: true,
        recommendation: data.recommendation,
      };
    } else {
      console.warn('⚠️ Respuesta sin recomendación válida:', data);
      return {
        success: false,
        error: 'Respuesta inválida del servidor',
      };
    }
  } catch (error) {
    console.error('❌ Error en Server Action:', error);
    
    // 🔥 Manejo específico de error de autenticación
    if (error instanceof Error && error.message.includes('authentication')) {
      return {
        success: false,
        error: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Función simplificada para obtener solo las acciones recomendadas
 */
export async function getRecommendedActions(
  questionText: string
): Promise<{
  success: boolean;
  actions?: string[];
  error?: string;
}> {
  try {
    console.log('🔍 [getRecommendedActions] Llamando a getMLRecommendation...');
    
    const result = await getMLRecommendation({
      question_text: questionText,
      current_response: 0,
      comment: questionText,
      context: {},
    });

    console.log('📊 Resultado de getMLRecommendation:', result);

    if (result.success && result.recommendation?.recommended_actions) {
      console.log('✅ Acciones encontradas:', result.recommendation.recommended_actions);
      return {
        success: true,
        actions: result.recommendation.recommended_actions,
      };
    } else {
      console.warn('⚠️ No se encontraron acciones');
      return {
        success: false,
        error: result.error || 'No se encontraron recomendaciones',
      };
    }
  } catch (error) {
    console.error('❌ Error en getRecommendedActions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * 🔥 NUEVA: Función genérica para hacer peticiones autenticadas
 * Útil si necesitas hacer más peticiones al backend
 */
export async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{
  success: boolean;
  data?: T;
  error?: string;
}> {
  try {
    const headers = await getAuthHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const url = `${apiUrl}${endpoint}`;

    console.log('🌐 Fetching:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Error de autenticación o permisos insuficientes',
        };
      }

      return {
        success: false,
        error: `Error ${response.status}: ${errorText}`,
      };
    }

    // Manejar respuesta vacía (204 No Content)
    if (response.status === 204) {
      return { success: true, data: {} as T };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en authenticatedFetch:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}