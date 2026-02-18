# KaapehChat — Guía **súper detallada** para clonar, configurar y ejecutar (PC servidor + celulares en red local)

> Objetivo: que **cualquier persona** pueda clonar este repo y levantarlo sin errores comunes, incluyendo base de datos, variables de entorno, uso por IP local y verificación completa de funcionamiento.

---

## Tabla de contenido

1. [Qué incluye este repositorio](#1-qué-incluye-este-repositorio)
2. [Requisitos exactos](#2-requisitos-exactos)
3. [Clonar e instalar dependencias](#3-clonar-e-instalar-dependencias)
4. [Configurar base de datos (phpMyAdmin/XAMPP)](#4-configurar-base-de-datos-phpmyadminxampp)
5. [Configurar variables de entorno (backend y frontend)](#5-configurar-variables-de-entorno-backend-y-frontend)
6. [Levantar el sistema en orden correcto](#6-levantar-el-sistema-en-orden-correcto)
7. [Uso en red local (teléfonos/tablets)](#7-uso-en-red-local-teléfonostablets)
8. [Checklist de verificación funcional](#8-checklist-de-verificación-funcional)
9. [Errores frecuentes y solución rápida](#9-errores-frecuentes-y-solución-rápida)
10. [Comandos útiles](#10-comandos-útiles)
11. [Notas importantes del proyecto](#11-notas-importantes-del-proyecto)

---

## 1) Qué incluye este repositorio

Este repo tiene **2 apps**:

- **Frontend** (carpeta raíz): React + Vite + TypeScript.
- **Backend** (carpeta `backend-java`): Spring Boot + WebSocket + JDBC/JPA sobre MySQL/MariaDB.

Flujo general:

1. Frontend abre en navegador (PC o celular).
2. Frontend se conecta por WebSocket al backend (`/ws/chat`).
3. Backend persiste usuarios/chats/mensajes en MySQL (DB `chatapp`).

---

## 2) Requisitos exactos

### Frontend
- Node.js **20+**
- npm **10+** (recomendado)

### Backend
- Java **17+**
- Maven **3.9+**

### Base de datos
- MySQL 8+ o MariaDB
- Si usas XAMPP, normalmente tendrás MariaDB en `3306`

### Opcional
- `mkcert` si quieres HTTPS/WSS local

---

## 3) Clonar e instalar dependencias

```bash
git clone <URL_DE_TU_REPO>
cd KaapehChat_Java
npm install
```

Si `npm install` falla:
- revisa proxy/red,
- borra lock/cache si aplica,
- y vuelve a ejecutar.

---

## 4) Configurar base de datos (phpMyAdmin/XAMPP)

> Puedes hacerlo por interfaz (phpMyAdmin) o por terminal. Aquí van ambas formas.

### Opción A: phpMyAdmin (recomendada para principiantes)

1. Abre XAMPP.
2. Inicia **Apache** y **MySQL**.
3. Entra a `http://localhost/phpmyadmin`.
4. Crea una base llamada: `chatapp` (collation `utf8mb4_unicode_ci` sugerida).
5. Selecciona la DB `chatapp`.
6. Ve a pestaña **Importar**.
7. Importa este archivo del repo:
   - `backend-java/src/main/resources/db/schema.sql`
8. Verifica que existan tablas:
   - `users`
   - `chats`
   - `chat_members`
   - `messages`

### Opción B: terminal (rápida)

Desde la raíz del proyecto:

```bash
cd backend-java
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS chatapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p chatapp < src/main/resources/db/schema.sql
```

> Si tu `root` no tiene password en XAMPP, al pedir password solo presiona Enter.

### Credenciales típicas en XAMPP

- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_NAME=chatapp`
- `DB_USERNAME=root`
- `DB_PASSWORD=` (vacío, salvo que tú lo hayas cambiado)

---

## 5) Configurar variables de entorno (backend y frontend)

---

### 5.1 Backend (Spring Boot)

El backend usa variables de entorno del sistema (no carga `.env` automáticamente por defecto).

Variables principales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chatapp
DB_USERNAME=root
DB_PASSWORD=
DB_USE_SSL=false
DB_TIMEZONE=UTC

SERVER_PORT=8443

JWT_SECRET=dev-secret-change-this-to-32-plus-characters
JWT_EXPIRATION_MS=86400000

SSL_ENABLED=false
SSL_KEY_STORE=classpath:localhost.p12
SSL_KEY_STORE_PASSWORD=changeit
SSL_KEY_STORE_TYPE=PKCS12
```

---

### 5.2 Frontend (`.env` en la raíz)

Crea archivo `.env` en la **raíz del repo**:

```env
VITE_WS_URL=ws://localhost:8443/ws/chat
```

Si abrirás desde celular/tablet en red local, usa la **IP LAN de tu PC servidor**:

```env
VITE_WS_URL=ws://192.168.1.50:8443/ws/chat
```

> **Clave:** en celular **NO** uses `localhost`, porque `localhost` apuntará al mismo teléfono, no a tu PC servidor.

---

## 6) Levantar el sistema en orden correcto

Orden recomendado:

1. DB (XAMPP MySQL)
2. Backend (Spring)
3. Frontend (Vite)

### 6.1 Levantar backend en Windows PowerShell

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_NAME="chatapp"
$env:DB_USERNAME="root"
$env:DB_PASSWORD=""
$env:DB_USE_SSL="false"
$env:DB_TIMEZONE="UTC"
$env:SERVER_PORT="8443"
$env:JWT_SECRET="dev-secret-change-this-to-32-plus-characters"
$env:JWT_EXPIRATION_MS="86400000"

cd backend-java
mvn spring-boot:run
```

### 6.2 Levantar backend en Linux/macOS

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=chatapp
export DB_USERNAME=root
export DB_PASSWORD=
export DB_USE_SSL=false
export DB_TIMEZONE=UTC
export SERVER_PORT=8443
export JWT_SECRET=dev-secret-change-this-to-32-plus-characters
export JWT_EXPIRATION_MS=86400000

cd backend-java
mvn spring-boot:run
```

Cuando arranque bien, debe quedar escuchando en puerto `8443`.

### 6.3 Levantar frontend

En otra terminal, desde la raíz:

```bash
npm run dev
```

Por configuración actual del proyecto, Vite corre en `8080`.

Abrir en PC:
- `http://localhost:8080`

---

## 7) Uso en red local (teléfonos/tablets)

Escenario deseado:
- Una PC corre backend + frontend (servidor local)
- Varios dispositivos de la misma red WiFi acceden por IP

### 7.1 Obtener IP LAN de la PC servidor

- **Windows:** `ipconfig` (busca IPv4, ejemplo `192.168.1.50`)
- **Linux/macOS:** `ip a` o `ifconfig`

### 7.2 Reemplazar IP en frontend

En `.env`:

```env
VITE_WS_URL=ws://192.168.1.50:8443/ws/chat
```

### 7.3 Abrir frontend desde celulares

En navegador del celular:

```text
http://192.168.1.50:8080
```

### 7.4 Firewall (muy importante)

Si no abre en celular:
- permite en firewall de la PC los puertos:
  - `8080` (frontend)
  - `8443` (backend/ws)
- confirma que todos estén en la **misma red local**
- desactiva VPN/proxy de prueba si está interfiriendo

### 7.5 Prueba rápida de conectividad

Desde otro dispositivo en la misma red:
- abrir `http://IP_PC:8080`
- si no responde, primero resuelve red/firewall antes de revisar código

---

## 8) Checklist de verificación funcional

Haz este checklist completo para confirmar que todo quedó bien:

1. ✅ `chatapp` existe en phpMyAdmin.
2. ✅ Tablas creadas: `users`, `chats`, `chat_members`, `messages`.
3. ✅ Backend levantó sin errores JDBC.
4. ✅ Frontend abre en `http://localhost:8080`.
5. ✅ Registro crea un usuario nuevo en `users`.
6. ✅ Login funciona con ese usuario.
7. ✅ Envío de mensaje crea fila nueva en `messages`.
8. ✅ Si usas grupo, miembros aparecen en `chat_members`.
9. ✅ Desde celular, abre `http://IP_PC:8080`.
10. ✅ WebSocket conecta a `ws://IP_PC:8443/ws/chat` (si aplica LAN).

---

## 9) Errores frecuentes y solución rápida

### Error A) “No guarda usuarios en DB”

Revisar:
1. ¿Backend está corriendo?
2. ¿`DB_*` apunta a la DB correcta?
3. ¿La tabla `users` existe en `chatapp`?
4. ¿Estás viendo la misma instancia MySQL en phpMyAdmin?

### Error B) “WebSocket desconecta / reconnect loop”

Revisar:
- `VITE_WS_URL` correcto.
- Si estás en celular, no uses `localhost`.
- Borra token viejo en navegador (`localStorage` key `chat.jwt`) y vuelve a login.
- Backend y frontend en puertos esperados (`8443`, `8080`).

### Error C) “Access denied for user root”

Revisar:
- `DB_USERNAME`/`DB_PASSWORD` correctos.
- En XAMPP por defecto `root` suele estar sin password.

### Error D) “En mi teléfono no abre”

Revisar:
- misma red WiFi
- IP correcta de la PC
- firewall/antivirus bloqueando puertos
- app abierta en `http://IP_PC:8080`

---

## 10) Comandos útiles

### Frontend

```bash
npm run dev
npm run build
npm run test
npm run lint
```

### Backend

```bash
cd backend-java
mvn spring-boot:run
mvn test
```

---

## 11) Notas importantes del proyecto

- El sistema usa WebSocket para auth/chat/señalización RTC.
- La persistencia principal está en MySQL/MariaDB (`chatapp`).
- Si haces cambios de variables `.env`, reinicia frontend.
- Si cambias variables del backend, reinicia backend.
- Si hay inconsistencias de sesión, limpia `chat.jwt` en localStorage y vuelve a iniciar sesión.

---

## Estructura principal del repo

- Frontend: `src/`
- Backend Java: `backend-java/src/main/java`
- Config backend: `backend-java/src/main/resources/application.yml`
- Schema DB: `backend-java/src/main/resources/db/schema.sql`

---

Si quieres, en otro commit te puedo dejar también:
- archivo `.env.example` listo para copiar,
- script para levantar backend con variables en un solo comando,
- y una guía de despliegue LAN + internet (ngrok/reverse proxy) paso a paso.


## Autor

- **KaapehChat**
