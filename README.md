# La Morada — API local

Backend de la plataforma educativa La Morada, preparado para un ambiente local reproducible y para actividades de validación y verificación de software.

## Requisitos

- Node.js 20 o superior
- Docker Desktop con `docker compose`

## Inicio rápido

1. Copia `.env.example` como `.env`.
2. Ejecuta `npm install`.
3. Inicia MongoDB y Redis con `npm run infra:up`.
4. Carga datos sintéticos con `npm run seed`.
5. Inicia la API con `npm run dev`.

La API queda disponible en `http://localhost:3000` y el diagnóstico en `http://localhost:3000/health`.

## Usuarios de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Psicóloga | `psicologa@lamorada.test` | `Morada123!` |
| Paciente | `paciente@lamorada.test` | `Morada123!` |

Los datos son completamente sintéticos. El envío de correo queda en modo consola y el pago es una simulación local: no existe una pasarela real ni se guardan el número completo de tarjeta o el CVV.

## Verificación

- `npm test`: ejecuta pruebas de integración sobre API, autenticación, carrito, citas, autorización y pago simulado.
- `npm audit`: revisa las dependencias.
- `npm run infra:down`: detiene la infraestructura local.

## Variables principales

Consulta `.env.example`. Para el frontend local, `CORS_ORIGINS` debe incluir `http://localhost:4200`.
