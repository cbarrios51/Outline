# Contexto: cambios para correr Outline en local (Windows)

Resumen compacto de todo lo configurado y modificado para que Outline funcione en desarrollo local en Windows.

---

## 1. Dependencias e instalación

- **Node**: Proyecto pide Node 14–16; se usó Node 24 con `yarn config set ignore-engines true` y `yarn install --ignore-engines`.
- **Paquetes añadidos**:
  - `cross-env` (scripts compatibles con Windows).
  - `shx` (comandos tipo Unix en scripts: `mkdir`, `cp`).
- **Yarn**: `ignore-engines true` en el proyecto para poder ejecutar scripts con Node 24.

---

## 2. Variables de entorno (`.env`)

- Creado `.env` desde `.env.sample` para desarrollo local.
- **Base de datos**: `DATABASE_URL=postgres://user:pass@localhost:5532/outline` (puerto 5532 = Postgres en docker-compose).
- **Redis**: `REDIS_URL=redis://localhost:6379`.
- **App**: `URL=http://localhost:3000`, `PORT=3000`, `FORCE_HTTPS=false`.
- **S3 local**: fake-s3 en `localhost:4569`, bucket `outline-dev`, credenciales `minioadmin`/`minioadmin`.
- **Claves**: `SECRET_KEY` y `UTILS_SECRET` con valores hex de 64 caracteres.
- **Auth**: Sin OAuth; se usa login por email en desarrollo.

---

## 3. Docker

- **docker-compose.yml** (sin cambios): Postgres (puerto 5532), Redis (6379), fake-s3 (4569).
- Comando: `docker compose up -d` antes de arrancar la app.

---

## 4. Scripts `package.json` (Windows + Node 17+)

- **`dev`**:  
  `cross-env NODE_ENV=development NODE_OPTIONS=--openssl-legacy-provider concurrently ...`  
  (evita error OpenSSL con webpack en Node 17+).
- **`build:webpack`**:  
  `cross-env NODE_OPTIONS=--openssl-legacy-provider webpack --config webpack.config.prod.js`
- **`copy:i18n`**:  
  `shx mkdir -p ./build/shared/i18n && shx cp -r ./shared/i18n/locales ./build/shared/i18n`
- **`build:server`**:  
  Sustituidos `cp`/`ln -sf` por `shx cp` y `node scripts/symlink-webpack-dev.js` (en lugar de enlace simbólico a webpack dev).
- **`seed:dev`**:  
  `cross-env NODE_ENV=development node build/server/scripts/seed-dev.js`

---

## 5. Scripts propios

- **`scripts/symlink-webpack-dev.js`**  
  Pone `webpack.config.dev.js` en `build/`. Si no puede crear symlink (permisos Windows), copia el archivo y cambia `require("./webpack.config")` por `require("../webpack.config")` para que resuelva desde la raíz.

- **`server/scripts/seed-dev.ts`**  
  - Solo corre con `NODE_ENV=development`.  
  - Crea **Team** (nombre "Outline", `guestSignin: true`) y **User** (`dev@example.com`, admin) si no existen.  
  - Si ya hay equipo pero **no** tiene `AuthenticationProvider`, crea uno (nombre `"email"`, `providerId` UUID) para pasar el chequeo de arranque de Outline.  
  - Usa `AuthenticationProvider` y `Team`/`User` de `@server/models`; importa `uuid` para `providerId`.

---

## 6. Servidor (listen, HSTS y migración de datos)

- **`server/index.ts`**:  
  - `server.listen(port, "0.0.0.0")` para escuchar en todas las interfaces.  
  - **Helmet en desarrollo**: `helmet({ hsts: false })` cuando `env.ENVIRONMENT === "development"` para no enviar HSTS y que Chrome/Edge no fuercen https://localhost.

- **`server/env.ts`**:  
  `FORCE_HTTPS` en desarrollo por defecto es `false` (`process.env.NODE_ENV === "development" ? "false" : "true"`).

- **Startup** (`server/utils/startup.ts`):  
  Si hay equipos pero ningún `AuthenticationProvider`, Outline no arranca y pide un script que no existe en el repo. La solución fue que **seed-dev** cree siempre al menos un `AuthenticationProvider` por equipo (ver arriba).

---

## 7. Login por email en desarrollo

- **`server/emails/templates/SigninEmail.tsx`**:  
  En desarrollo se usa `logger.info` para imprimir en consola el enlace mágico (antes `logger.debug`).
- **`server/models/Team.ts`**:  
  `emailSigninEnabled` ya considera `env.ENVIRONMENT === "development"` sin SMTP; no se modificó.
- Usuario de desarrollo: **dev@example.com**. Flujo: pantalla de login → "Sign in with Email" → introducir ese email → enlace mágico en la consola de `yarn dev` → abrir enlace para entrar.

---

## 8. Pantalla en blanco (polyfills)

- **`app/utils/polyfills.ts`**:  
  Se usaba `global` (no definido en el navegador). Sustituido por comprobaciones sobre `window` y `typeof window === "undefined"` para no lanzar y no depender de `global`.

- **`app/components/LazyPolyfills.tsx`**:  
  Mientras los polyfills cargan se renderiza `null`. Añadido `.catch()` a la promesa de `loadPolyfills()` para que, si falla, se marque como cargado y se muestre la app de todos modos.

---

## 9. Documentación creada/actualizada

- **`docs/DESARROLLO-LOCAL.md`**:  
  Cómo levantar el proyecto, `.env`, Docker, `yarn build`, `yarn db:migrate`, `yarn seed:dev`, `yarn dev`, login con dev@example.com, troubleshooting (ERR_CONNECTION_REFUSED, migración de datos).
- **`docs/CONTEXTO-CAMBIOS-LOCAL.md`** (este archivo):  
  Resumen de todos los cambios para mantener contexto.

---

## 10. Orden típico para correr en local

1. `docker compose up -d`
2. `yarn install --ignore-engines` (solo primera vez)
3. `yarn build` (solo primera vez o tras cambios de build)
4. `yarn db:migrate` (solo primera vez o tras nuevas migraciones)
5. `yarn seed:dev` (crea equipo + usuario + auth provider si hace falta)
6. `yarn dev` → abrir http://localhost:3000 → login con **dev@example.com** (Sign in with Email) y usar el enlace que sale en la consola.

---

## 11. Archivos tocados (lista)

- `package.json` (scripts, cross-env, shx)
- `.env` (nuevo)
- `server/index.ts` (listen 0.0.0.0, helmet hsts: false en desarrollo)
- `server/env.ts` (FORCE_HTTPS por defecto false en desarrollo)
- `server/scripts/seed-dev.ts` (nuevo)
- `server/scripts/symlink-webpack-dev.js` (nuevo)
- `server/emails/templates/SigninEmail.tsx` (log enlace mágico)
- `app/utils/polyfills.ts` (global → window)
- `app/components/LazyPolyfills.tsx` (catch en loadPolyfills)
- `docs/DESARROLLO-LOCAL.md` (nuevo/actualizado)
- `docs/CONTEXTO-CAMBIOS-LOCAL.md` (este resumen)

---

*Última actualización: sesión de configuración para desarrollo local en Windows (Node 24, Docker, login por email, pantalla en blanco resuelta).*
