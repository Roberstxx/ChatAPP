# KaapehChat Backend (Java + Spring Boot + WebSocket + MySQL)

Este documento explica en detalle cómo funciona el backend de **KaapehChat**, cómo configurarlo paso a paso y cómo ejecutarlo en cualquier PC sin problemas.

---

## 1) ¿Qué hace este backend?

El backend de KaapehChat se encarga de:

- Registrar e iniciar sesión de usuarios (`auth:register`, `auth:login`).
- Emitir y validar JWT para autenticación.
- Gestionar chats directos y grupos.
- Guardar y listar mensajes en base de datos.
- Gestionar señalización WebRTC por WebSocket (`rtc:signal`) para llamadas.

Tecnologías principales:

- **Java 17+**
- **Spring Boot**
- **Spring WebSocket**
- **Spring JDBC/JPA**
- **MySQL / MariaDB**

---

## 2) Estructura importante

- Código Java: `src/main/java/com/connectchat`
- Configuración Spring: `src/main/resources/application.yml`
- Esquema SQL: `src/main/resources/db/schema.sql`
- Maven: `pom.xml`

---

## 3) Requisitos previos (cualquier PC)

Instala lo siguiente:

1. **Java JDK 17 o superior**
2. **Maven 3.9 o superior**
3. **MySQL 8+ o MariaDB**

Verificación rápida:

```bash
java -version
mvn -version
```

Si usas XAMPP/WAMP, normalmente MySQL/MariaDB corre en el puerto `3306`.

---

## 4) Configurar la base de datos

### 4.1 Crear base `chatapp`

```sql
CREATE DATABASE IF NOT EXISTS chatapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 4.2 Importar esquema

Desde esta carpeta (`backend-java`):

```bash
mysql -u root -p chatapp < src/main/resources/db/schema.sql
```

Si tu instalación local no usa contraseña para `root` (caso común en XAMPP), puedes dejarla vacía.

---

## 5) Variables de entorno

Este backend usa variables de entorno del sistema. Estas son las principales:

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

### Recomendación para evitar errores

- Usa un `JWT_SECRET` largo (32+ caracteres).
- No dejes credenciales productivas hardcodeadas.
- Si cambias variables, **reinicia** la app backend.

---

## 6) Cómo levantar el backend

### 6.1 Windows PowerShell

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

mvn spring-boot:run
```

### 6.2 Linux / macOS

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

mvn spring-boot:run
```

Al iniciar correctamente, el WebSocket queda disponible en:

- `ws://localhost:8443/ws/chat`

---

## 7) Flujo funcional interno

### 7.1 Autenticación

- El frontend envía evento `auth:register` o `auth:login`.
- Backend valida datos con `AuthService`.
- Si es correcto, responde con JWT y datos de usuario.

### 7.2 Gestión de chats

- `chat:list`: devuelve los chats del usuario.
- `chat:createDirect`: crea o reutiliza chat directo entre dos usuarios.
- `group:create`: crea un grupo y agrega miembros.
- `group:invite`: agrega miembros a grupo existente.

### 7.3 Mensajes

- `message:send`: persiste mensaje en DB y lo reenvía a miembros.
- `message:list`: lista historial de un chat.

### 7.4 Señalización RTC

- `rtc:signal`: transporta `offer`, `answer`, `ice`, `end` entre peers.

---

## 8) Endpoint y puertos

- Puerto backend por defecto: **8443**
- Endpoint WebSocket: **`/ws/chat`**

Si el frontend vive en otra máquina/dispositivo, asegúrate de:

- usar IP LAN correcta en frontend (`ws://IP_DEL_BACKEND:8443/ws/chat`),
- abrir firewall para `8443`,
- mantener ambos equipos en la misma red.

---

## 9) Pruebas y validación recomendadas

Desde `backend-java`:

```bash
mvn test
```

También puedes validar compilación:

```bash
mvn -q -DskipTests package
```

---

## 10) Solución de problemas comunes

### Error: `Access denied for user`

Revisa `DB_USERNAME` y `DB_PASSWORD`.

### Error: no conecta a DB

- Confirma que MySQL esté encendido.
- Verifica `DB_HOST`, `DB_PORT`, `DB_NAME`.
- Comprueba que `chatapp` existe y que importaste `schema.sql`.

### Error: frontend no conecta WebSocket

- Revisa URL (`VITE_WS_URL`) en el frontend.
- Si es desde celular, no usar `localhost`.
- Verifica firewall del sistema operativo.

### Error: token inválido / sesión rara

- Borra token anterior en frontend.
- Vuelve a iniciar sesión.
- Revisa que `JWT_SECRET` no haya cambiado entre reinicios sin renovar token.

---

## 11) Checklist para ejecutar sin problemas en cualquier PC

1. ✅ Java 17+ instalado.
2. ✅ Maven instalado y en PATH.
3. ✅ MySQL/MariaDB ejecutándose.
4. ✅ Base `chatapp` creada.
5. ✅ `schema.sql` importado.
6. ✅ Variables `DB_*` y `JWT_*` configuradas.
7. ✅ Backend levantado con `mvn spring-boot:run`.
8. ✅ Puerto `8443` permitido en firewall si habrá acceso por red.

---

## Autor

- **KaapehChat**
