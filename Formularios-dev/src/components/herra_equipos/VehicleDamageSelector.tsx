// VehicleDamageSelector.tsx - Versión Completa con Validación y Sin Any
"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Paper, Typography, Button, Chip, Alert } from '@mui/material';
import { ChangeHistory, Circle } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import { Control, UseFormSetValue, FieldValues, Path, PathValue } from 'react-hook-form';

// ==================== TIPOS ====================
export type DamageType = 'abollado' | 'raspado' | 'roto';

export interface DamageMarker {
  tempId?: number; // ✅ Solo para frontend
  type: DamageType;
  x: number;
  y: number;
  timestamp: string;
}

interface DamageTypeConfig {
  label: string;
  Icon: React.ComponentType<{ sx?: Record<string, unknown> }>;
  color: string;
  symbol: () => React.ReactElement;
}

// ==================== CONFIGURACIÓN DE DAÑOS ====================
const DAMAGE_TYPES: Record<DamageType, DamageTypeConfig> = {
  abollado: {
    label: 'Abollado',
    Icon: ChangeHistory,
    color: '#d32f2f',
    symbol: () => (
      <ChangeHistory
        htmlColor="currentColor"
        sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }}
      />
    ),
  },
  raspado: {
    label: 'Raspado/Rayado',
    Icon: Circle,
    color: '#1976d2',
    symbol: () => (
      <Circle
        htmlColor="currentColor"
        sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }}
      />
    ),
  },
  roto: {
    label: 'Roto',
    Icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="12,2 22,12 12,22 2,12" strokeLinejoin="round" />
      </svg>
    ),
    color: '#c2185b',
    symbol: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="12,2 22,12 12,22 2,12" strokeLinejoin="round" />
      </svg>
    ),
  },
};

export interface VehicleDamageSelectorRef {
  generateBase64: () => Promise<string | null>;
  getObservations: () => string;
}

interface VehicleDamageSelectorProps<TFieldValues extends FieldValues = FieldValues> {
  vehicleImageUrl?: string;
  control?: Control<TFieldValues>;
  setValue?: UseFormSetValue<TFieldValues>;
  damageFieldName?: string;
  observationsFieldName?: string;
  readonly?: boolean;
  initialDamages?: DamageMarker[];
  initialImage?: string;
}

// ==================== HELPER FUNCTIONS ====================
const isValidDamageType = (type: unknown): type is DamageType => {
  return typeof type === 'string' && type in DAMAGE_TYPES;
};

const isValidDamageMarker = (damage: unknown): damage is DamageMarker => {
  if (!damage || typeof damage !== 'object') return false;
  
  const d = damage as Record<string, unknown>;
  
  return (
    isValidDamageType(d.type) &&
    typeof d.x === 'number' &&
    typeof d.y === 'number' &&
    typeof d.timestamp === 'string'
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
const VehicleDamageSelectorInner = <TFieldValues extends FieldValues = FieldValues>({
  vehicleImageUrl = 'https://via.placeholder.com/800x600/e0e0e0/666666?text=Imagen+del+Vehiculo',
  setValue,
  damageFieldName = 'vehicleDamages',
  observationsFieldName = 'vehicleObservations',
  readonly = false,
  initialDamages = [],
  initialImage,
}: VehicleDamageSelectorProps<TFieldValues>, ref: React.Ref<VehicleDamageSelectorRef>) => {
  
  const [selectedTool, setSelectedTool] = useState<DamageType>('abollado');
  const [damages, setDamages] = useState<DamageMarker[]>([]);
  const [observations] = useState('');
  const [currentImage, setCurrentImage] = useState<string>(initialImage || vehicleImageUrl);
  const [hasModifications, setHasModifications] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ CARGAR DAÑOS INICIALES CON VALIDACIÓN
  useEffect(() => {
    if (initialDamages && initialDamages.length > 0) {
      console.log('📋 [DamageSelector] Cargando daños iniciales:', initialDamages.length);
      
      // ✅ Filtrar y validar daños
      const validDamages = initialDamages.filter((damage) => {
        if (!isValidDamageMarker(damage)) {
          console.warn('⚠️ [DamageSelector] Daño inválido ignorado:', damage);
          return false;
        }
        return true;
      });

      // Convertir daños guardados a daños con tempId para React
      const damagesWithTempId: DamageMarker[] = validDamages.map((damage, index) => ({
        type: damage.type,
        x: damage.x,
        y: damage.y,
        timestamp: damage.timestamp,
        tempId: Date.now() + index,
      }));
      
      setDamages(damagesWithTempId);
      
      if (validDamages.length !== initialDamages.length) {
        console.warn(
          `⚠️ [DamageSelector] Se filtraron ${initialDamages.length - validDamages.length} daños inválidos`
        );
      }
    }
  }, [initialDamages]);

  // ✅ CARGAR IMAGEN INICIAL
  useEffect(() => {
    if (initialImage) {
      console.log('🖼️ [DamageSelector] Usando imagen guardada (base64)');
      setCurrentImage(initialImage);
    } else {
      console.log('🖼️ [DamageSelector] Usando imagen limpia');
      setCurrentImage(vehicleImageUrl);
    }
  }, [initialImage, vehicleImageUrl]);

  // Sincronizar con react-hook-form
  useEffect(() => {
    if (setValue) {
      const damageFieldPath = damageFieldName as Path<TFieldValues>;
      const observationsFieldPath = observationsFieldName as Path<TFieldValues>;
      
      setValue(
        damageFieldPath, 
        damages as PathValue<TFieldValues, Path<TFieldValues>>
      );
      setValue(
        observationsFieldPath, 
        observations as PathValue<TFieldValues, Path<TFieldValues>>
      );
    }
  }, [damages, observations, setValue, damageFieldName, observationsFieldName]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (readonly || !selectedTool || !imageLoaded || !imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = +(((e.clientX - left) / width) * 100).toFixed(2);
    const y = +(((e.clientY - top) / height) * 100).toFixed(2);
    
    const newDamage: DamageMarker = {
      tempId: Date.now(),
      type: selectedTool,
      x,
      y,
      timestamp: new Date().toISOString()
    };
    
    setDamages(prev => [...prev, newDamage]);
    setHasModifications(true);
  };

  const handleRemoveDamage = (tempId: number) => {
    setDamages(prev => prev.filter(d => d.tempId !== tempId));
    setHasModifications(true);
  };

  const handleClearAll = () => {
    setDamages([]);
    setHasModifications(true);
    setCurrentImage(vehicleImageUrl);
  };

  // ==================== GENERAR BASE64 (609x483) ====================
  const generateBase64 = async (): Promise<string | null> => {
    if (damages.length === 0) {
      console.log('🖼️ [DamageSelector] Sin daños, retornando null');
      return null;
    }

    if (!hasModifications && initialImage) {
      console.log('🖼️ [DamageSelector] Sin modificaciones, usando imagen guardada');
      return initialImage;
    }

    console.log('🖼️ [DamageSelector] Generando nueva imagen con daños');

    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute',
      width: '609px',
      height: '483px',
      backgroundColor: '#f5f5f5',
      overflow: 'hidden',
      fontFamily: 'Roboto, sans-serif',
      left: '-9999px',
      top: '-9999px',
    });
    document.body.appendChild(container);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = vehicleImageUrl;
    Object.assign(img.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block',
    });

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Error cargando imagen'));
    });
    container.appendChild(img);

    // ✅ Renderizar solo daños válidos
    damages.forEach(d => {
      if (!isValidDamageType(d.type)) {
        console.warn('⚠️ [DamageSelector] Saltando daño inválido en generateBase64:', d);
        return;
      }

      const config = DAMAGE_TYPES[d.type];
      const marker = document.createElement('div');
      Object.assign(marker.style, {
        position: 'absolute',
        left: `${d.x}%`,
        top: `${d.y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: '22px',
        color: config.color,
        pointerEvents: 'none',
        userSelect: 'none',
      });

      let svg = '';
      if (d.type === 'abollado') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2.5" width="22" height="22">
          <path d="M12 2 L2 22 L22 22 Z"/>
        </svg>`;
      } else if (d.type === 'raspado') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2.5" width="22" height="22">
          <circle cx="12" cy="12" r="10"/>
        </svg>`;
      } else if (d.type === 'roto') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2.5" width="22" height="22">
          <polygon points="12,2 22,12 12,22 2,12" stroke-linejoin="round"/>
        </svg>`;
      }
      marker.innerHTML = svg;
      container.appendChild(marker);
    });

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f5f5',
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      document.body.removeChild(container);
      return dataUrl;
    } catch (err) {
      document.body.removeChild(container);
      console.error('Error html2canvas:', err);
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    generateBase64,
    getObservations: () => observations,
  }));

  const damageCounts = damages.reduce<Record<DamageType, number>>((acc, d) => {
    if (isValidDamageType(d.type)) {
      acc[d.type] = (acc[d.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<DamageType, number>);

  return (
    <Paper elevation={3} sx={{ p: 3, border: '2px solid #1976d2' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Daños en el Vehículo
      </Typography>

      {/* ✅ Indicador de modo edición */}
      {initialDamages && initialDamages.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          📝 Modo edición: {initialDamages.length} daño(s) cargado(s). 
          {hasModifications && ' ⚠️ Hay cambios sin guardar.'}
        </Alert>
      )}

      {!readonly && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Seleccione el tipo de daño y haga clic en la imagen:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {(Object.entries(DAMAGE_TYPES) as [DamageType, DamageTypeConfig][]).map(([key, config]) => (
              <Button
                key={key}
                size="small"
                variant={selectedTool === key ? 'contained' : 'outlined'}
                onClick={() => setSelectedTool(key)}
                startIcon={<config.Icon sx={{ fontSize: '1.2rem' }} />}
                sx={{ fontWeight: 'bold', textTransform: 'none' }}
              >
                {config.label}
              </Button>
            ))}
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Instrucciones:</strong> Seleccione un tipo y haga clic en la imagen. Cliquee un marcador para eliminarlo.
          </Alert>
        </Box>
      )}

      <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto', mb: 2 }}>
        <img
          ref={imageRef}
          src={currentImage}
          alt="Vehículo"
          onLoad={() => setImageLoaded(true)}
          onClick={handleImageClick}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            border: '3px solid #1976d2',
            borderRadius: 4,
            cursor: readonly ? 'default' : 'crosshair',
            userSelect: 'none'
          }}
        />
        {damages.map(damage => {
          // ✅ Validar antes de renderizar
          if (!isValidDamageType(damage.type)) {
            console.error('❌ [DamageSelector] Tipo de daño inválido en render:', damage);
            return null;
          }

          const config = DAMAGE_TYPES[damage.type];
          
          return (
            <Box
              key={damage.tempId}
              sx={{
                position: 'absolute',
                left: `${damage.x}%`,
                top: `${damage.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: '18px',
                color: config.color,
                cursor: readonly ? 'default' : 'pointer',
                zIndex: 10,
                userSelect: 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!readonly && damage.tempId) {
                  handleRemoveDamage(damage.tempId);
                }
              }}
              title={`${config.label} - Click para eliminar`}
            >
              {config.symbol()}
            </Box>
          );
        })}
      </Box>

      {/* Leyenda */}
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Leyenda:</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {(Object.entries(DAMAGE_TYPES) as [DamageType, DamageTypeConfig][]).map(([key, config]) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ fontSize: '20px', color: config.color }}>{config.symbol()}</Box>
              <Typography variant="body2">{config.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Resumen */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Daños registrados: {damages.length}
          </Typography>
          {!readonly && damages.length > 0 && (
            <Button size="small" color="error" variant="outlined" onClick={handleClearAll}>
              Limpiar todos
            </Button>
          )}
        </Box>
        {damages.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(Object.entries(damageCounts) as [DamageType, number][]).map(([type, count]) => (
              <Chip
                key={type}
                label={`${DAMAGE_TYPES[type].label}: ${count}`}
                size="small"
                sx={{ fontWeight: 'bold' }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <strong>Nota:</strong> Los daños y observaciones se guardarán con el formulario.
        {hasModifications && ' ⚠️ Recuerde guardar los cambios.'}
      </Alert>
    </Paper>
  );
};

// Componente con forwardRef genérico
const VehicleDamageSelector = forwardRef(VehicleDamageSelectorInner) as <TFieldValues extends FieldValues = FieldValues>(
  props: VehicleDamageSelectorProps<TFieldValues> & { ref?: React.Ref<VehicleDamageSelectorRef> }
) => ReturnType<typeof VehicleDamageSelectorInner>;

export default VehicleDamageSelector;