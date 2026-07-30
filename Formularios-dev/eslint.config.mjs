import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint flat config nativa (Next.js 16).
 *
 * Antes se usaba `FlatCompat` para envolver los configs legacy de
 * `eslint-config-next`; desde la v16 ambos subpaths ya exportan flat
 * config directamente, así que el shim de compatibilidad sobra.
 *
 * Se ejecuta con `yarn lint` → `eslint .` (el comando `next lint` fue
 * eliminado del framework en Next 16).
 */
const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    /**
     * `<img>` intencionales: todos apuntan a data-URIs base64 generadas en el
     * cliente (firmas, esquema de daños del vehículo, QR, imágenes de pregunta
     * subidas por el usuario), que `next/image` no puede optimizar — solo
     * añadiría overhead. Además `VehicleDamageSelector` necesita un `ref` real
     * sobre el `<img>` para html2canvas y para mapear las coordenadas del clic;
     * `next/image` rompería esa lógica. Todos ya tienen `alt`.
     */
    files: [
      "src/components/features/form-builder/presentation/components/SectionBuilderView.tsx",
      "src/components/features/herra-equipos/common/Step5ReviewSection.tsx",
      "src/components/features/herra-equipos/presentation/components/selectors/VehicleDamageSelector.tsx",
      "src/components/features/qr-generator/presentation/components/Qr.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    /**
     * Reglas nuevas del plugin `react-hooks` v6 (React Compiler) que llegaron
     * con `eslint-config-next@16`. Marcan ~63 hallazgos en código preexistente
     * que no cambió en la migración, así que se dejan en `warn`: siguen
     * visibles pero no bloquean el lint.
     *
     * TODO: atender en un PR aparte — no forman parte de la migración a Next 16.
     */
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn",

      /**
       * Análisis conservador sobre el patrón canónico de RHF
       * `onSubmit={handleSubmit(fn)}`: si `fn` cierra sobre un ref, el
       * compilador asume que podría leerse durante el render, cuando en
       * realidad solo se invoca al enviar el formulario.
       */
      "react-hooks/refs": "warn",

      /**
       * En `error` y en cero: los 10 hallazgos originales eran el `watch()`
       * de RHF y se resolvieron migrando a la API correcta en cada caso
       * (`useWatch` para lecturas en render, `getValues` para lecturas en
       * callback, `subscribe` para suscripciones en efecto). Se deja como
       * error para que no vuelva a introducirse `watch()`.
       */
      "react-hooks/incompatible-library": "error",
    },
  },
];

export default eslintConfig;
