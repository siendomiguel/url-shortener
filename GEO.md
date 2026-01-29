# Sistema de Geolocalización por IP

Este documento explica cómo funciona el sistema de rastreo de ubicación para los inicios de sesión en la aplicación.

## Arquitectura del Sistema

El sistema opera en tres capas principales dentro del backend:

### 1. Captura de Datos (`SessionLogService`)
Cada vez que se realiza un intento de autenticación (Exitoso o Fallido), el `SessionLogService` intercepta la solicitud y extrae:
- Dirección IP del cliente.
- User Agent (Navegador y Sistema Operativo).
- Email del intento.

### 2. Resolución de Ubicación (`GeolocationService`)
La IP capturada se envía al servicio de geolocalización, el cual utiliza la API externa de [ip-api.com](http://ip-api.com).

- **API Externa**: `http://ip-api.com/json/{ip}`
- **Campos Recuperados**: País, Código de País, Región, Ciudad, Latitud, Longitud, Zona Horaria e ISP (Proveedor de Internet).
- **Manejo de IPs Privadas**: El sistema detecta automáticamente si la IP es local (`localhost`, `127.0.0.1`, `::1`) o pertenece a un rango privado (redes locales). En estos casos, marca la ubicación como `Unknown` para evitar errores en la API externa.

### 3. Persistencia (`Prisma / PostgreSQL`)
Los datos procesados se almacenan en la tabla `session_logs` de la base de datos:

```prisma
model SessionLog {
  id            String   @id @default(cuid())
  ip            String
  country       String?  // Nombre del país
  countryCode   String?  // Ej: MX, CO, US
  city          String?
  isp           String?  // Proveedor de internet
  success       Boolean  @default(false)
  timestamp     DateTime @default(now())
  // ... otros campos
}
```

## Dashboard de Administración
Los datos recolectados son consumidos por el panel de administración para generar las estadísticas de **"Top Países"**. El sistema agrupa los registros por el campo `country` y cuenta las ocurrencias para mostrar el ranking en tiempo real.

---

> [!NOTE]
> **¿Por qué veo "Unknown"?**
> Si estás ejecutando el proyecto en un entorno de desarrollo local, la IP siempre será identificada como privada. Los nombres de los países reales aparecerán automáticamente una vez que el proyecto esté desplegado en un servidor con una IP pública.
