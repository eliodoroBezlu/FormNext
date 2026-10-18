# Plan: que cada usuario pueda cambiar su contraseña desde forms

## Contexto

Hoy un usuario de forms que quiere cambiar su contraseña tiene que pedírselo a un
administrador, o saber que existe el portal del IAM y entrar ahí a «Perfil».
Los inspectores no conocen el portal.

**La contraseña no es de forms.** Vive en el IAM y es la misma para forms, Sync y
el portal. Forms no guarda contraseñas: el backend de forms le reenvía al IAM el
inicio de sesión (`auth.controller.ts:51`) y ya le reenvía otros pedidos con el
token del usuario, como la activación del 2FA (`auth.controller.ts:170`).

Por eso este plan **no agrega una contraseña a forms**: agrega una pantalla en
forms que le pide el cambio al IAM.

### Lo que ya existe

| Dónde | Qué |
|---|---|
| IAM `PATCH /auth/me/password` (`auth.controller.ts:291`) | Cambia la contraseña del usuario autenticado; pide la actual |
| IAM `UsersService.changePassword` (`users.service.ts:168`) | Compara la actual y guarda la nueva |
| IAM `UsersService.esSuClaveActual` (`users.service.ts:200`) | Reconoce los dos formatos de contraseña: bcrypt y el antiguo de Sync |
| IAM cambio obligatorio al iniciar sesión (`auth.service.ts:~145`) | Ya hace bien lo que falta aquí: rechaza repetir la contraseña y deja constancia en la auditoría |
| Portal `dashboard/profile` | Usa `/auth/me/password` |

---

## Decisiones

| # | Decisión | Por qué |
|---|---|---|
| D1 | La pantalla va **dentro de forms**, no como enlace al portal | El usuario no sale de la aplicación que conoce |
| D2 | Forms **no valida ni guarda** la contraseña: reenvía al IAM | Una sola fuente de verdad; las reglas viven en el IAM |
| D3 | La pantalla avisa que el cambio **aplica a forms, Sync y el portal** | Si no se dice, alguien la cambia aquí y después no puede entrar a Sync |
| D4 | Al cambiarla se **cierran todas las sesiones**, también la actual, y se vuelve al inicio de sesión | Ver «Sesiones» abajo |
| D5 | Las reglas de contraseña se escriben **una sola vez** en el IAM | Hoy están repetidas en 4 DTOs |
| D6 | La cuenta compartida «Inspector Técnico» **no** puede cambiar la contraseña: el backend lo rechaza (403) y el menú oculta la opción | Es una sola cuenta de servicio para todos; un cambio cerraría la sesión de todos los inspectores |
| D7 | El proxy de forms reenvía también el `refresh_token` | El IAM cuenta el límite de intentos por sesión solo si lo trae; sin él cuenta por IP, y todo forms sale de una sola IP |

### Sesiones (D4)

El token de acceso del IAM no lleva el identificador de la sesión: solo
`sub`, roles y servicios (`token.service.ts:8`). Por eso el IAM no puede cerrar
«todas menos esta» sin cambiar el contenido del token, que leen forms, Sync y el
portal.

Lo simple y correcto: cerrar todas las sesiones con `revokeAll` y mandar al
usuario a iniciar sesión con la contraseña nueva.

- **Lo que queda abierto:** un token de acceso ya emitido sigue siendo válido
  hasta que vence, **15 minutos** como máximo (`JWT_ACCESS_EXPIRY`). Pasado ese
  tiempo, el otro dispositivo no puede renovarlo y queda fuera.
- **Para un cambio de contraseña es aceptable:** el riesgo se corta en minutos,
  no en días.

Mantener abierta la sesión actual queda fuera de alcance (ver al final).

---

## Cambios

### 1. IAM — `central-identity-suite/iam-core`

**1.1. Que los usuarios que vinieron de Sync puedan cambiarla.**

- **Hoy:** `changePassword` compara la contraseña actual con `bcrypt.compare`
  directamente (`users.service.ts:182`). Las cuentas migradas de Sync que todavía
  tienen la contraseña en el formato antiguo reciben «Contraseña actual
  incorrecta» aunque la escriban bien.
- **Cambio:** usar `esSuClaveActual(user.passwordHash, dto.currentPassword)`,
  que reconoce los dos formatos.

**1.2. No aceptar la misma contraseña.**

- Si `esSuClaveActual(user.passwordHash, dto.newPassword)` da verdadero,
  responder 400 con «La contraseña nueva debe ser distinta de la actual».
- El cambio obligatorio al iniciar sesión ya lo hace (`auth.service.ts:169`);
  esto lo iguala.

**1.3. Cerrar las sesiones y dejar constancia.**

En el controlador de `PATCH /auth/me/password`, después de guardar:

- `sessionsService.revokeAll(userId)`;
- `audit.log` con `AuditEvent.PASSWORD_CHANGED`, la IP, el agente de usuario y
  `metadata: { motivo: 'cambio_propio', sesionesCerradas: n }`;
- borrar las cookies de sesión (`clearTokenCookies`), como hace
  `DELETE /auth/sessions/all`.

**1.4. Límite de intentos.**

- Agregar `@Throttle({ strict: { limit: 10, ttl: 300_000 } })`, igual que el
  login. El endpoint compara la contraseña actual, así que sin límite sirve para
  probar contraseñas con una sesión robada.

**1.5. Reglas de contraseña en un solo lugar (D5).**

- **Hoy:** la misma expresión está copiada en 4 DTOs y solo acepta `@$!%*?&`
  como caracteres especiales. Una contraseña con `#` o `.` se rechaza con un
  mensaje que no dice cuáles valen.
- **Cambio:** una constante en `src/common/` con la regla y su mensaje, usada
  por los 4 DTOs. Un carácter especial pasa a ser **cualquiera que no sea letra
  ni número**: `(?=.*[^A-Za-z0-9])`.
- **No afecta a las contraseñas ya guardadas:** la regla solo se aplica al
  crear o cambiar una contraseña.

**1.6. Pruebas.**

El IAM tiene hoy solo dos archivos de prueba. Agregar
`users.service.spec.ts` para `changePassword`:

- acepta la actual en formato bcrypt y en el antiguo de Sync;
- rechaza una actual incorrecta;
- rechaza una nueva igual a la actual;
- `provisional` deja `mustChangePassword` como corresponde.

Para el controlador:

- cierra las sesiones;
- registra `PASSWORD_CHANGED`.

Y para las reglas:

- una contraseña con `#` como único carácter especial pasa;
- una sin carácter especial no pasa.

### 2. Backend de forms — `BackendForm`

**2.1. `IamProxyService.patch`.** Hoy el proxy solo tiene `post` y `get`
(`iam-proxy.service.ts`). Se agrega `patch` con la misma forma: token del
usuario, reenvío de errores del IAM con su código y su mensaje.

**2.2. `PATCH /auth/me/password`.** Va en `auth.controller.ts`, junto a los
endpoints de 2FA:

- toma el `access_token` de la cookie, como `totp/setup`;
- reenvía `{ currentPassword, newPassword }` al IAM;
- al responder bien, **borra las cookies de sesión de forms** con
  `iam.clearCookies(res)`.

Sin `@Roles`: cualquier usuario autenticado cambia la suya, y solo la suya,
porque el IAM toma el usuario del token, no del cuerpo.

**2.3. Que no quede la contraseña en ningún registro.** Revisar que la
auditoría global por interceptor no guarde el cuerpo de esta ruta. Si guarda
cuerpos, agregar `currentPassword` y `newPassword` a los campos que se ocultan.

**2.4. Pruebas.**

- reenvía al IAM con el token de la cookie;
- un 400 del IAM llega con su mensaje;
- borra las cookies solo si el cambio salió bien.

### 3. Frontend de forms — `FormNext`, feature `auth`

Siguiendo las capas de la feature:

```
components/features/auth/
├── domain/schemas/cambioClave.schema.ts         ← Zod: mismas reglas que el IAM
├── infrastructure/adapters/authAdapter.ts       ← + cambiarClave()
├── application/hooks/useCambiarClave.ts         ← envía, traduce errores, cierra sesión
└── presentation/components/CambiarClaveDialog.tsx
app/actions/auth.ts                               ← + cambiarClaveAction()
```

`auth` hoy no tiene `domain/` (CLAUDE.md lo explica: no había tipos que
centralizar). El esquema Zod es el primer contenido de esa capa.

**El diálogo:**

- **Entrada:** en el menú del usuario de `src/app/dashboard/layout.tsx`, un ítem
  **«Cambiar contraseña»** antes del separador de «Cerrar sesión».
- **Aviso arriba:** *«Es tu contraseña para forms, Sync y el portal: cambia en
  los tres. Al guardar se cerrarán tus sesiones y volverás a iniciar sesión.»*
- **Campos**, cada uno con el botón de mostrar u ocultar:
  - contraseña actual;
  - nueva contraseña, con la lista de reglas que se marcan a medida que se
    cumplen: 8 caracteres o más, mayúscula, minúscula, número, carácter especial;
  - confirmar la nueva: tiene que coincidir.
- **Formulario:** React Hook Form con `mode: "onTouched"`, `noValidate` y el
  botón de cancelar con `type="button"`.
- **Errores:** «Contraseña actual incorrecta» se marca **en ese campo**; los
  demás errores del IAM, arriba del formulario. Un 429 se muestra como «Demasiados
  intentos, espera unos minutos».
- **Al guardar bien:** se cierra el diálogo y se va al inicio de sesión con el
  mensaje «Contraseña cambiada. Inicia sesión con la nueva.» (por parámetro de
  la URL, sin datos personales).

**Tipos:** `npx tsc --noEmit` y lint de los archivos tocados.

---

## Verificación

### Automática

Las pruebas de 1.6 y 2.4, y la suite completa de los dos backends.

### Manual, en local

1. Usuario normal (no admin): «Cambiar contraseña» con la actual equivocada →
   el error aparece en el campo de la contraseña actual.
2. Nueva igual a la actual → rechazo con el mensaje claro.
3. Nueva con `#` como único carácter especial → se acepta.
4. Cambio correcto → vuelve al inicio de sesión con el aviso; la contraseña
   vieja ya no entra y la nueva sí.
5. Con el mismo usuario abierto en otro navegador: pasados 15 minutos como
   máximo, ese navegador queda fuera.
6. Entrar a **Sync** y al **portal** con la contraseña nueva.
7. Una cuenta migrada de Sync que todavía tiene la contraseña en el formato
   antiguo: puede cambiarla.
8. En la auditoría del IAM aparece `PASSWORD_CHANGED` con `cambio_propio`.
9. En la auditoría de forms no aparece la contraseña.

---

## Despliegue

En este orden, porque forms depende de lo que haga el IAM:

1. **IAM y portal juntos:** sin migraciones de base. El portal se ajustó en
   la implementación: tras el cambio cierra la sesión local y lleva al inicio
   de sesión con el aviso, y usa la misma regla de contraseña que el IAM
   (`src/lib/reglaClave.ts`). Desplegar el IAM sin el portal deja al usuario
   del portal con un «actualizada» y una sesión que ya no sirve.
2. **Backend de forms.**
3. **Frontend de forms.**

Si se despliega forms antes que el IAM, el cambio funciona pero no cierra las
otras sesiones ni corrige el caso de las cuentas de Sync.

---

## Fuera de alcance

- **«Olvidé mi contraseña».** Necesita un canal fuera de la sesión (correo o
  administrador). Hoy lo resuelve el administrador desde el portal.
- **Mantener abierta la sesión actual al cambiar la contraseña.** Requiere que
  el token lleve el identificador de sesión, y eso toca a todos los sistemas
  que leen el token.
- **Caducidad periódica de contraseñas.** No se pidió, y obliga a cambios que
  terminan en contraseñas peores.

## Preguntas resueltas

- **P1.** No hay cuentas por grupos. La única cuenta compartida es la de
  servicio del acceso «Inspector Técnico» (D6).
