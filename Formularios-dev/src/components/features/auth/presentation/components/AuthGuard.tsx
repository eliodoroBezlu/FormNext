'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useConfigBienvenida, areaRecordada } from '@/components/features/bienvenida/application/hooks/useConfigBienvenida';
import { useEsperaEnPantalla } from '@/components/features/bienvenida/application/hooks/useEsperaEnPantalla';
import { resolver } from '@/components/features/bienvenida/domain/models/Bienvenida';
import { PantallaBienvenida } from '@/components/features/bienvenida/presentation/components/PantallaBienvenida';

/**
 * Rutas que no exigen sesión. A nivel de módulo: si se declara dentro del
 * componente se recrea en cada render y el efecto no puede depender de ella.
 */
const RUTAS_PUBLICAS = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const esRutaPublica = RUTAS_PUBLICAS.includes(pathname);

  /**
   * `null` mientras la sesión no se ha comprobado todavía; `true`/`false` con
   * el resultado.
   *
   * Antes eran dos estados —`isLoading` e `isAuthorized`— que el efecto
   * encendía de forma síncrona en las rutas públicas. Con un solo estado
   * ambos se derivan, y no hay manera de que queden descoordinados.
   */
  const [sesionValida, setSesionValida] = useState<boolean | null>(null);

  /**
   * El área se lee de la última entrada en este dispositivo: aquí todavía no
   * se sabe quién entra —esa es justamente la comprobación en curso—, así que
   * la primera vez se muestra el mensaje general.
   */
  const config = useConfigBienvenida();
  const bienvenida = resolver(config, areaRecordada());

  const isLoading = !esRutaPublica && sesionValida === null;
  const isAuthorized = esRutaPublica || sesionValida === true;

  const espera = useEsperaEnPantalla(
    isLoading,
    bienvenida.duracionMinimaMs,
    bienvenida.duracionMaximaMs,
  );

  useEffect(() => {
    // En una ruta pública no hay nada que comprobar.
    if (esRutaPublica) return;

    let vigente = true;

    fetch('/api/auth/session')
      .then((res) => {
        if (!vigente) return;
        setSesionValida(res.ok);
        if (!res.ok) router.push('/login');
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        console.error('Error verifying session:', error);
        setSesionValida(false);
        router.push('/login');
      });

    return () => {
      vigente = false;
    };
  }, [esRutaPublica, router]);

  // `espera.mostrar` y no `isLoading`: la pantalla se queda el mínimo
  // configurado aunque la sesión ya esté validada, para que no aparezca y
  // desaparezca en un destello.
  if (isLoading || espera.mostrar) {
    // Antes había aquí un spinner y un «Verificando sesión...» fijos. Ahora es
    // la pantalla configurable, que también usa el panel: una sola pantalla de
    // entrada en vez de dos escritas a mano y distintas entre sí.
    return <PantallaBienvenida contenido={bienvenida} tarda={espera.tarda} />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
