# Uruwork · aplicación móvil

Primera versión de una aplicación real en React Native / Expo para iOS y Android. No es un APK ni un archivo IPA firmado. El proyecto compila sus paquetes JavaScript para las dos plataformas; todavía necesita pruebas en dispositivos y compilaciones firmadas.

## Funciones implementadas

- Ofertas desde `https://uruwork.com/api.php?action=list_vacancies`, sin duplicar la carga de la web.
- Búsqueda sin distinción de acentos, filtros por categoría y ubicación.
- Detalle con texto completo e imagen del aviso; la imagen se puede abrir en tamaño completo.
- Postulación por correo y WhatsApp cuando el aviso incluye esos datos. Números móviles uruguayos normalizados a +598.
- Guardados persistentes en este dispositivo. No requiere registro.
- Compartir enlace a la oferta original.
- Recursos: Gallito, lista de empresas, PDF de empleo en Montevideo y PDF de LinkedIn, abiertos en el navegador.
- Estados de carga, error y listado vacío; actualización manual y al volver a la app.
- Vista de demostración optativa, rotulada y sin contactos de postulación.

El 7 de noviembre de 2026, la API pública respondió `{"ok":true,"items":[]}`. La ausencia de ofertas en la app refleja esa respuesta. No se cargaron ofertas históricas ni se escribió en la web.

## Ejecutar y verificar

Node 24, npm y dependencias fijadas en package-lock.json:

```sh
npm ci
npm start
npm run typecheck
npm test
npx eslint .
npx expo export --platform all
```

Se usa SDK 58. Durante su transición Expo Go puede requerir otra versión; para pruebas nativas se debe generar una compilación de desarrollo compatible. No se probó Expo Go en un teléfono.

## Compilaciones y publicación

`eas.json` prepara un perfil Android APK de prueba y un perfil de producción para las tiendas. Antes de ejecutar una compilación:

1. Conectar la cuenta Expo del propietario con `npx eas-cli@latest login` y ejecutar `npx eas-cli@latest init`. Proyecto ya creado y vinculado: https://expo.dev/accounts/managerbtu/projects/uruwork — ID 6818c07f-b43b-4e15-a530-fa8c10e24a1a. No se incluyen claves ni sesiones de Expo en el código.
2. Confirmar disponibilidad/propiedad de `com.uruwork.app` en ambas tiendas; es un identificador propuesto.
3. Conectar las cuentas de Apple Developer y Google Play Console del propietario. Completar las credenciales en los flujos oficiales; no guardarlas en este proyecto.
4. Generar Android de prueba con `npx eas-cli@latest build --platform android --profile preview`. Probar búsqueda, filtros, persistencia, imagen, correo, WhatsApp, recursos, enlaces y errores en dispositivos reales.
5. Verificar las fechas y el estado activo con una vacante de prueba autorizada desde el sistema habitual de la web. La API es la fuente del estado de publicación. El cliente también respeta `expires_at` cuando está presente.
6. Completar capturas, soporte, política de privacidad y declaraciones de datos a partir del funcionamiento final de app y servidor. Probar accesibilidad y tamaño de texto.
7. Compilar producción con `npx eas-cli@latest build --platform all --profile production` y enviar con `npx eas-cli@latest submit --platform ios` y `npx eas-cli@latest submit --platform android`. Las tiendas determinan la aprobación.

## Pendientes concretos

- Expo vinculado a managerbtu. Pendientes: cuentas Apple y Google, compilaciones firmadas, pruebas en dispositivos y publicación.
- Notificaciones push: no implementadas ni solicitadas al usuario. Requieren registrar dispositivos, definir preferencias y conectar un emisor al sistema que publica avisos. No hay un interruptor que finja activarlas.
- Prueba del flujo con avisos reales, porque la API estaba vacía durante la preparación.
- No hay administración ni envío de CV dentro de la app. La carga de avisos continúa en el sistema actual; los CV van directamente a las empresas.
- La versión web exportada es auxiliar. Su acceso a la API requiere que el servidor permita CORS desde su origen; la app nativa no necesita ese permiso de navegador.

## Datos y dependencias

Los guardados contienen únicamente IDs de vacantes en AsyncStorage. Las lecturas públicas de la API pueden quedar registradas por el servidor de Uruwork. Los servicios externos (correo, WhatsApp, navegador y compartir) tienen sus propios comportamientos. No se integraron publicidad ni analítica dentro de la app.

El logo se obtuvo del archivo público de Uruwork. No se incluyen credenciales, datos privados ni copias de avisos reales. `dist/` contiene una exportación técnica, no ejecutables nativos instalables.
