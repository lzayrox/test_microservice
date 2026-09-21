# Orders service: pipeline CI/CD con Docker Compose

> Esta versión valida el despliegue con Docker Compose dentro de GitHub Actions, sin depender de un servidor externo.

Implementación del pipeline propuesto en `segunda_unidad (1).html`:

1. Ejecutar pruebas unitarias.
2. Construir una imagen Docker.
3. Publicar la imagen en GitHub Container Registry (GHCR).
4. Levantarla con Docker Compose y comprobar su estado de salud.

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
- En cada *push* a `main`, ejecuta las pruebas, publica dos etiquetas en GHCR (`sha-<commit>` y `latest`) y levanta la etiqueta inmutable del commit con Docker Compose.
- Los trabajos usan `needs`, así que una etapa solo comienza cuando la anterior termina correctamente.
- El despliegue usa el entorno `production`, que permite agregar aprobaciones desde la configuración de GitHub.

## Configuración requerida en GitHub

1. Subir el proyecto a un repositorio cuya rama principal sea `main`.
2. No es necesario crear secretos adicionales: GitHub genera automáticamente `GITHUB_TOKEN` para publicar y descargar la imagen del mismo repositorio.

Durante la validación, el workflow descarga desde GHCR la imagen exacta del commit, ejecuta `docker compose up` y consulta `/health`. La opción `--wait` hace fallar el pipeline si el contenedor no supera el `healthcheck` en 120 segundos. Finalmente elimina el entorno temporal del runner.

`GITHUB_TOKEN` es creado automáticamente por GitHub Actions; el workflow le concede únicamente lectura del repositorio y escritura de paquetes.
