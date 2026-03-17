# Desarrollo local de Outline (Windows)

## Requisitos ya configurados

- **Node.js** (se usó con v24; el proyecto recomienda 14–16; si hay problemas, instala Node 16).
- **Yarn** y **Docker** para Postgres, Redis y S3 local.

## Cómo levantar el proyecto

### 1. Servicios con Docker

En la raíz del repo:

```powershell
docker compose up -d
```

Esto levanta:

- Postgres en `localhost:5532` (usuario/contraseña: `user`/`pass`, base: `outline`)
- Redis en `localhost:6379`
- Fake S3 en `localhost:4569`

### 2. Variables de entorno

El archivo `.env` en la raíz ya está preparado para este entorno (puerto 5532, Redis, URL `http://localhost:3000`, S3 local).

### 3. Instalar dependencias (solo la primera vez)

```powershell
yarn install --ignore-engines
```

(Si aparece error de “engine”, en este proyecto está configurado `ignore-engines`.)

### 4. Compilar

```powershell
yarn build
```

### 5. Migraciones de base de datos (solo la primera vez o tras nuevos migrations)

```powershell
yarn db:migrate
```

### 6. Iniciar el servidor de desarrollo

```powershell
yarn dev
```

Luego abre en el navegador: **http://localhost:3000**

## Inicio de sesión (desarrollo local sin OAuth)

Para poder entrar sin configurar Slack/Google:

1. **Crear equipo y usuario de desarrollo** (solo una vez, o si la base estaba vacía):
   ```powershell
   yarn seed:dev
   ```
   Esto crea un equipo con “Sign in with Email” y un usuario **dev@example.com**.

2. **Arrancar el servidor** (en una terminal):
   ```powershell
   yarn dev
   ```

3. **Abrir** http://localhost:3000.

4. En la pantalla de login, elegir **“Sign in with Email”** e introducir: **dev@example.com**.

5. El **enlace mágico** aparecerá en la consola donde corre `yarn dev`. Copia esa URL y ábrela en el navegador para iniciar sesión.

### Opcional: usar OAuth (Slack / Google)

- **Slack**: [Crear app en Slack](https://api.slack.com/apps), añadir redirect `http://localhost:3000/auth/slack.callback`, y poner `SLACK_CLIENT_ID` y `SLACK_CLIENT_SECRET` en `.env`.
- **Google**: [Crear credenciales OAuth en Google Cloud](https://console.cloud.google.com/apis/credentials), URI de redirección `http://localhost:3000/auth/google.callback`, y `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` en `.env`.

## Comandos útiles

| Comando            | Descripción                          |
|--------------------|--------------------------------------|
| `yarn dev`         | Servidor de desarrollo (puerto 3000) |
| `yarn build`       | Compilar todo                        |
| `yarn db:migrate`  | Ejecutar migraciones                 |
| `yarn seed:dev`    | Crear equipo + usuario para login por email (dev@example.com) |
| `docker compose up -d`   | Levantar Postgres, Redis y S3 |
| `docker compose down`    | Parar los contenedores        |

## Si sale "Connection Failed" o ERR_CONNECTION_REFUSED

1. **¿Está el servidor en marcha?**  
   En una terminal debe estar ejecutándose `yarn dev`. Si no, ábrela en la raíz del proyecto y ejecuta:
   ```powershell
   cd C:\Users\cbarr\Documents\Outline
   yarn dev
   ```
   No cierres esa terminal. Espera hasta ver en la consola algo como:  
   `Listening on http://localhost:3000`

2. **¿Docker está corriendo?**  
   Outline necesita Postgres, Redis y S3. Si no levantaste los contenedores:
   ```powershell
   docker compose up -d
   ```
   Si el servidor arranca y a los pocos segundos termina con un error de base de datos o Redis, suele ser porque Docker no está abierto o los contenedores no están activos.

3. **Usa exactamente esta URL:**  
   `http://localhost:3000`  
   (no uses `https://` ni otra dirección)

## Si el navegador cambia a https://localhost o sale ERR_SSL_PROTOCOL_ERROR

Si al escribir `http://localhost:3000` el navegador lo cambia a `https://localhost` (y quita el puerto), es porque **HSTS** (seguridad que fuerza HTTPS) quedó guardado para localhost. Hay que borrarlo una vez:

- **En Edge**: Ve a `edge://net-internals/#hsts`. En "Delete domain security policies" escribe `localhost` y pulsa **Delete**. Cierra y vuelve a abrir Edge; entra a **http://localhost:3000**.
- **En Chrome**: Ve a `chrome://net-internals/#hsts`. En "Delete domain security policies" escribe `localhost` y pulsa **Delete**. Cierra y vuelve a abrir Chrome; entra a **http://localhost:3000**.

En este proyecto **HSTS está desactivado en desarrollo**, así que después de borrarlo no debería volver a forzar HTTPS. Siempre usa **http://** y el puerto **3000**.

4. **Si `yarn dev` se cierra solo**, mira el mensaje de error en la misma terminal (conexión a base de datos, Redis, OpenSSL, etc.) y comprueba que Docker esté en marcha y que hayas ejecutado antes `yarn build` y `yarn db:migrate`.

---

## Cambios hechos para Windows

- **cross-env**: el script `dev` usa `NODE_ENV=development` de forma compatible con Windows.
- **shx**: los scripts `copy:i18n` y `build:server` usan `shx` para `mkdir`/`cp` en lugar de comandos Unix.
- **OpenSSL**: En Node 17+ se usa `NODE_OPTIONS=--openssl-legacy-provider` en `build:webpack` y en `dev` para evitar el error "digital envelope routines::unsupported".
- **.env**: `DATABASE_URL` apunta a `localhost:5532` (puerto que expone `docker-compose` para Postgres).
- **HSTS desactivado en desarrollo**: `helmet` no envía la cabecera HSTS cuando `NODE_ENV=development`, para que Chrome/Edge no fuercen https://localhost.
- **FORCE_HTTPS**: en desarrollo por defecto es `false`; en producción sigue pudiendo activarse con la variable de entorno.
