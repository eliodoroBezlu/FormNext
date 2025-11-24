'use server';

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

    // 🔥 URL del backend NestJS (debe ser la misma que en Postman)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const endpoint = `${apiUrl}/ml-recommendations/recommend`;

    console.log('🎯 Endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    console.log('📡 Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// 🔥 Función simplificada para obtener solo las acciones
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