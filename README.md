# Orders service: pipeline CI/CD con Docker Compose

> Esta versión despliega con Docker Compose en un servidor remoto.

Implementación del pipeline propuesto en `segunda_unidad (1).html`:

1. Ejecutar pruebas unitarias.
2. Construir una imagen Docker.
3. Publicar la imagen en GitHub Container Registry (GHCR).
4. Desplegarla en un servidor con Docker Compose y comprobar su estado de salud.

## Ejecutar localmente

Requiere Node.js 20 o posterior.

```bash
npm ci
npm test
npm start
```

El servicio expone:

- `GET /health`
- `GET /v1/orders/:id`

También puede ejecutarse con Docker:

```bash
docker build -t orders-service:local .
docker run --rm -p 8080:8080 orders-service:local
```

O con Docker Compose:

```bash
docker compose up --build
```

## Comportamiento del pipeline

- En cada *pull request* hacia `main`, ejecuta las pruebas y valida que la imagen se pueda construir, pero no publica ni despliega.
- En cada *push* a `main`, ejecuta las pruebas, publica dos etiquetas en GHCR (`sha-<commit>` y `latest`) y despliega la etiqueta inmutable del commit con Docker Compose.
- Los trabajos usan `needs`, así que una etapa solo comienza cuando la anterior termina correctamente.
- El despliegue usa el entorno `production`, que permite agregar aprobaciones desde la configuración de GitHub.

## Configuración requerida en GitHub

1. Subir el proyecto a un repositorio cuya rama principal sea `main`.
2. Preparar un servidor Linux con Docker Engine, Docker Compose v2 y acceso SSH mediante llave. El usuario remoto debe poder ejecutar `docker` sin interacción.
3. En **Settings → Secrets and variables → Actions**, crear estos secretos:

   - `DEPLOY_HOST`: dominio o IP del servidor.
   - `DEPLOY_USER`: usuario SSH.
   - `DEPLOY_SSH_KEY`: llave SSH privada usada por GitHub Actions.
   - `DEPLOY_KNOWN_HOSTS`: huella del servidor obtenida previamente con `ssh-keyscan <host>` y verificada por el administrador.
   - `GHCR_USERNAME`: usuario de GitHub que puede descargar la imagen.
   - `GHCR_READ_TOKEN`: token de acceso personal con permiso `read:packages`.

4. Permitir el tráfico entrante al puerto `8080` del servidor, o colocar un proxy inverso con HTTPS delante del servicio.

Durante el despliegue, el workflow copia `compose.yaml` a `~/orders-service`, autentica Docker en GHCR, descarga la imagen del commit y ejecuta `docker compose up`. La opción `--wait` hace fallar el pipeline si el contenedor no supera el `healthcheck` en 120 segundos.

`GITHUB_TOKEN` es creado automáticamente por GitHub Actions; el workflow le concede únicamente lectura del repositorio y escritura de paquetes.
