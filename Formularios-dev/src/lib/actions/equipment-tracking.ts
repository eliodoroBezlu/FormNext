    // lib/actions/equipment-tracking.ts
    "use server";

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    export interface CheckEquipmentStatusResponse {
    canProceed: boolean;
    openForm: string;
    message: string;
    shouldRedirect: boolean;
    requiresFrecuente: boolean;
    trackingData?: {
        preUsoCount?: number;
        usageInterval?: number;
        remainingUses?: number;
        lastInspection?: Date;
        
    };
    redirectToPreUso?: boolean;
    }

    export async function checkEquipmentStatus(
    equipmentId: string,
    templateCode: string
    ) {
    try {
        console.log(`🔍 [ACTION] Verificando TAG: ${equipmentId} para form: ${templateCode}`);

        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipment-tracking/check-status?equipmentId=${equipmentId}&templateCode=${templateCode}`,
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
        );

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar el equipo');
        }

        const data = await response.json();
        
        console.log('📨 [ACTION] Respuesta del backend:', data);

        return {
        success: true,
        data: {
            canProceed: data.canProceed,
            openForm: data.openForm,
            shouldRedirect: data.shouldRedirect, // ✅ NUEVO campo
            message: data.message,
            trackingData: data.trackingData,
        },
        };
    } catch (error) {
        console.error('❌ [ACTION] Error:', error);
        return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
    }