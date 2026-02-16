# ChronoGest - Sistema de Gestión de Horarios

Sistema full-stack de gestión de horarios para centros educativos con autenticación JWT y base de datos SQLite.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 14.x
- npm >= 6.x

### Instalación

#### 1. Instalar dependencias del backend
```bash
cd backend
npm install
```

#### 2. Configurar variables de entorno
El archivo `.env` ya está configurado con valores por defecto. Puedes modificar `JWT_SECRET` para producción.

#### 3. Inicializar base de datos
```bash
npm run init-db
```

#### 4. Iniciar servidor backend
```bash
npm run dev
```
El servidor estará corriendo en http://localhost:5000

#### 5. Instalar dependencias del frontend  
```bash
cd ../frontend
npm install
```

#### 6. Iniciar aplicación frontend
```bash
npm start
```
La aplicación estará disponible en http://localhost:3000

---

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin1 | admin123 | admin |
| instructor1 | instructor123 | instructor |
| aprendiz1 | aprendiz123 | aprendiz |

---

## 📁 Estructura del Proyecto

```
ReactChronogest-main/
├── backend/
│   ├── config/
│   │   ├── db.js              # Conexión SQLite
│   │   └── initDb.js          # Inicialización de BD
│   ├── controllers/
│   │   ├── authController.js  # Autenticación (login/register)
│   │   └── userController.js  # CRUD de usuarios
│   ├── middleware/
│   │   └── auth.js            # Middleware JWT
│   ├── routes/
│   │   ├── auth.js            # Rutas de autenticación
│   │   └── users.js           # Rutas de usuarios
│   ├── .env                   # Variables de entorno
│   ├── chronogest.db          # Base de datos SQLite
│   ├── server.js              # Servidor Express
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── organisms/
│   │   │       └── LoginForm.tsx
│   │   ├── schemas/
│   │   │   └── login.ts
│   │   ├── config.js
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## 🔧 Scripts Disponibles

### Backend
```bash
npm start        # Iniciar servidor en producción
npm run dev      # Iniciar servidor con nodemon (desarrollo)
npm run init-db  # Inicializar/reinicializar base de datos
```

### Frontend  
```bash
npm start        # Iniciar en modo desarrollo
npm build        # Compilar para producción
npm test         # Ejecutar pruebas
```

---

## 📊 Base de Datos

El proyecto usa **SQLite** con las siguientes tablas:

- `usuarios` - Cuentas de usuario con autenticación
- `centros` - Centros o sedes
- `ambientes` - Salones o ambientes
- `programas` - Programas de formación
- `fichas` - Fichas (cohortes)
- `instructores` - Instructores
- `horarios` - Horarios de clases
- `asignacion_horarios` - Asignaciones de horarios

### Ubicación de la Base de Datos
`backend/chronogest.db`

### Reiniciar Base de Datos
```bash
cd backend
rm chronogest.db          # Eliminar BD existente (Windows: del chronogest.db)
npm run init-db           # Crear nueva BD con datos de prueba
```

---

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación:

1. Usuario envía credenciales a `/api/auth/login`
2. Backend valida con bcrypt
3. Si es válido, retorna JWT token
4. Frontend guarda token en localStorage
5. Token se envía en header `Authorization: Bearer <token>` para rutas protegidas

### Rutas de Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/auth/me` | Obtener usuario actual (requiere auth) |

---

## 🌐 API Endpoints

### Autenticación (No requiere auth)

#### POST /api/auth/login
```json
// Request
{
  "username": "admin1",
  "password": "admin123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "username": "admin1",
    "name": "Admin User",
    "role": "admin", 
    "email": "admin@chronogest.com"
  }
}
```

### Usuarios (Requiere auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario (soft delete) |

---

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcrypt - Hash de contraseñas
- CORS
- dotenv

### Frontend
- React 19
- TypeScript
- React Hook Form
- Zod - Validación
- Axios - Cliente HTTP
- React Router DOM

---

## ⚙️ Configuración

### Variables de Entorno (backend/.env)

```env
PORT=5000                                          # Puerto del servidor
JWT_SECRET=chronogest_super_secret_key_2026        # Clave secreta JWT
JWT_EXPIRE=7d                                      # Expiración del token
NODE_ENV=development                               # Entorno
```

**⚠️ IMPORTANTE**: Cambiar `JWT_SECRET` en producción

---

## 🔍 Troubleshooting

### Backend no inicia

**Error**: `Cannot find module 'better-sqlite3'`
```bash
cd backend
npm install
```

**Error**: `JWT_SECRET is not defined`  
- Verificar que existe el archivo `backend/.env`

### Base de datos corrupta

```bash
cd backend
rm chronogest.db
npm run init-db
```

### CORS errors en el navegador

- Verificar que frontend corre en puerto 3000 o 5173
- Revisar configuración CORS en `backend/server.js`

### Login no funciona

1. Verificar que backend esté corriendo (puerto 5000)
2. Revisar consola del navegador para errores
3. Revisar logs del servidor backend
4. Verificar que usuarios de prueba existen: `npm run init-db`

---

## 📝 Notas de Desarrollo

- ✅ **Base de datos**: SQLite local (sin Docker)
- ✅ **Autenticación**: JWT con bcrypt
- ✅ **CORS**: Configurado para localhost:3000 y localhost:5173
- ✅ **Hot Reload**: Nodemon en backend, React dev server en frontend
- ❌ **NO usar**: Docker, Composer, MySQL

---

## 📄 Licencia

ISC

---

## 👥 Roles de Usuario

- **admin**: Acceso completo al sistema
- **instructor**: Gestión de horarios y fichas
- **aprendiz**: Visualización de horarios

---

## 🔄 Flujo de Login

```
1. Usuario ingresa username y password en frontend
2. Frontend envía POST a /api/auth/login
3. Backend busca usuario en SQLite
4. Backend compara contraseña con bcrypt.compare()
5. Si coincide, backend genera JWT token
6. Frontend recibe token y lo guarda en localStorage
7. Frontend redirige al usuario al dashboard
8. Próximas peticiones incluyen token en header Authorization
```

---

## 📞 Soporte

Para problemas o preguntas, revisar:
1. Los logs del servidor backend
2. La consola del navegador (DevTools)
3. El archivo [walkthrough.md](file:///C:/Users/mige/.gemini/antigravity/brain/3cfef9c2-1338-4927-93a7-bc68871ae3ed/walkthrough.md) para detalles técnicos completos
