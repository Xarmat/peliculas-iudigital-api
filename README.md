# Plataforma de Películas y Series (API REST + Frontend)

**Estudiante:** Pablo Martínez Ortiz

Proyecto de la asignatura Proyecto Integrado II (Ingeniería de Software y Datos, IU Digital de Antioquia). Incluye las dos evidencias de aprendizaje en un mismo proyecto:

- **EA1: API REST - NodeJs** (backend y base de datos).
- **EA2: Front End - ReactJs** (aplicación web que consume la API).

Es una aplicación para que un administrador gestione el catálogo de una plataforma de entretenimiento de la universidad (tipo "Cuevana", con producciones licenciadas). Siguiendo el caso de estudio, es un proyecto monolítico con backend y frontend trabajados por separado: el backend vive en la raíz y el frontend en la carpeta `frontend/`. Por ahora no incluye registro de usuarios ni seguridad, ni pantallas para el público final.

## Qué hace el proyecto

Gestiona cinco módulos, tanto por API como desde pantallas en el navegador:

| Módulo | Ruta de la API | Ruta de la pantalla | Operaciones |
|---|---|---|---|
| Género | `/api/generos` | `/generos` | Listar, consultar, crear, editar |
| Director | `/api/directores` | `/directores` | Listar, consultar, crear, editar |
| Productora | `/api/productoras` | `/productoras` | Listar, consultar, crear, editar |
| Tipo | `/api/tipos` | `/tipos` | Listar, consultar, crear, editar |
| Media (películas y series) | `/api/medias` | `/medias` | Listar, consultar, crear, editar, eliminar |

Los cuatro catálogos no se eliminan porque el caso solo pide "registrar y editar": se desactivan con `estado: "Inactivo"`. Así una película nunca queda apuntando a un género, director o productora que ya no existe.

## Tecnologías

- **Backend:** Node.js (20.6 o superior), Express, Mongoose y cors.
- **Base de datos:** MongoDB Atlas (nube).
- **Frontend:** React, Vite y React Router.
- **Pruebas de la API:** Postman (o cualquier cliente HTTP).

## Instalación y ejecución

Se necesitan dos terminales abiertas a la vez: una para el backend y otra para el frontend.

### Backend (carpeta raíz)

1. Instalar dependencias (una sola vez): `npm install`
2. Crear el archivo de variables de entorno (una sola vez): `cp .env.example .env`
3. Editar `.env` con la cadena de conexión de MongoDB Atlas, incluyendo el nombre de la base de datos:
   ```
   PORT=3000
   MONGO_URI=mongodb+srv://USUARIO:CLAVE@cluster0.xxxxx.mongodb.net/peliculas_db
   ```
4. Iniciar el servidor: `npm run dev`

Si todo va bien, la terminal muestra `MongoDB conectado` y `API en http://localhost:3000`. El archivo `.env` contiene credenciales y está excluido del repositorio con `.gitignore`.

### Frontend (carpeta `frontend`)

1. Entrar a la carpeta: `cd frontend`
2. Instalar dependencias (una sola vez): `npm install`
3. Iniciar la aplicación: `npm run dev`
4. Abrir en el navegador la dirección que muestra la terminal (normalmente `http://localhost:5173`).

La dirección de la API viene por defecto como `http://localhost:3000/api`. Si hiciera falta cambiarla, se copia `frontend/.env.example` a `frontend/.env` y se edita `VITE_API_URL`. Para compilar la versión de producción se usa `npm run build`.

## Arquitectura

El backend sigue el patrón MVC adaptado a una API REST:

- **Modelo** (`models/`): define los datos y sus validaciones con Mongoose.
- **Controlador** (`controllers/`): contiene la lógica de cada operación y las reglas de negocio.
- **Rutas** (`routes/`): solo conectan cada método y URL con su función del controlador.
- **Vista**: es el frontend en React, que consume la API y muestra la información al usuario.

## Estructura del proyecto

```
peliculas-api/
├── package.json            Dependencias y scripts del backend (start, dev)
├── .env.example            Plantilla de variables de entorno
├── .env                    Variables reales (no se sube a Git)
├── .gitignore              Excluye node_modules y .env
├── README.md
├── src/                    BACKEND
│   ├── app.js              Punto de entrada: configura Express, registra las rutas,
│   │                       maneja los errores y conecta a la base de datos
│   ├── config/
│   │   └── db.js           Conexión a MongoDB con Mongoose
│   ├── models/
│   │   ├── opciones.js     Opciones comunes: fechaCreacion, fechaActualizacion y sin __v
│   │   ├── Genero.js       Esquema del módulo Género
│   │   ├── Director.js     Esquema del módulo Director
│   │   ├── Productora.js   Esquema del módulo Productora
│   │   ├── Tipo.js         Esquema del módulo Tipo
│   │   └── Media.js        Esquema de películas y series, con referencias a los otros cuatro
│   ├── controllers/
│   │   ├── crud.controller.js   Lógica de los cuatro catálogos (listar, obtener, crear, editar)
│   │   └── media.controller.js  Lógica y reglas de negocio de Media (validaciones, relaciones)
│   └── routes/
│       ├── crud.routes.js       Rutas de los catálogos (GET, POST, PUT)
│       └── media.js             Rutas de Media (GET, POST, PUT, DELETE)
└── frontend/               FRONTEND (React + Vite)
    ├── package.json        Dependencias y scripts del frontend (dev, build)
    ├── index.html          Página base donde se monta React
    ├── vite.config.js      Configuración de Vite
    ├── .env.example        Plantilla con la dirección de la API (opcional)
    └── src/
        ├── main.jsx        Punto de entrada: monta la aplicación y activa las rutas
        ├── App.jsx         Barra de navegación y definición de las rutas
        ├── index.css       Estilos globales (tema oscuro)
        ├── config/
        │   └── modulos.js  Descripción de los 4 catálogos (campos, endpoint, estado)
        ├── services/
        │   └── api.js      Única capa que habla con la API (listar, crear, editar, eliminar)
        ├── components/
        │   ├── Navbar.jsx        Barra de navegación superior
        │   └── CatalogoPage.jsx  Pantalla genérica de los catálogos: tabla y formulario
        └── pages/
            ├── Inicio.jsx        Pantalla de bienvenida con accesos a cada módulo
            ├── MediaPage.jsx     Pantalla de Media: tarjetas, filtros, formulario y eliminación
            └── MediaPage.css     Estilos propios de la pantalla de Media
```

## Flujo de una petición

```
Usuario (navegador)
   │  acción en pantalla (clic en Guardar, filtro, eliminar...)
   ▼
Componente React (CatalogoPage / MediaPage)   ── guarda el estado con useState
   │
   ▼
services/api.js  ── fetch con JSON ──►  API (Express)
                                          │  app.js: cors + express.json()
                                          ▼
                                   routes/  →  controllers/
                                          │  Media: valida que género, director, productora
                                          │  y tipo existan y que los tres primeros estén Activos
                                          ▼
                                   Modelo de Mongoose  →  MongoDB Atlas
                                          │
   ◄──────────── respuesta JSON con su código HTTP ◄──────────────┘
   │  (errores: el manejador de app.js los convierte en 400, 404, 409 o 500)
   ▼
El componente actualiza su estado y React vuelve a pintar la pantalla
(éxito en verde, error en rojo con el mensaje de la API)
```

## Modelos de datos

Todos incluyen `_id`, `fechaCreacion` y `fechaActualizacion`, generados automáticamente.

**Género:** `nombre` (obligatorio, único), `estado` (`Activo` o `Inactivo`, por defecto `Activo`), `descripcion`.

**Director:** `nombres` (obligatorio), `estado`.

**Productora:** `nombre` (obligatorio, único), `estado`, `slogan`, `descripcion`.

**Tipo:** `nombre` (obligatorio, único), `descripcion`. No tiene estado porque el caso de estudio no lo pide.

**Media:**

| Campo | Detalle |
|---|---|
| `serial` | Obligatorio, único |
| `titulo` | Obligatorio |
| `sinopsis` | Opcional |
| `url` | Obligatorio, único |
| `imagenPortada` | Opcional (URL de la imagen) |
| `anioEstreno` | Obligatorio, número mayor o igual a 1888 |
| `genero` | Obligatorio, `_id` de un Género activo |
| `director` | Obligatorio, `_id` de un Director activo |
| `productora` | Obligatorio, `_id` de una Productora activa |
| `tipo` | Obligatorio, `_id` de un Tipo existente |

## Endpoints de la API

Los cuatro catálogos (`/api/generos`, `/api/directores`, `/api/productoras`, `/api/tipos`) comparten:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/<modulo>` | Lista los registros (admite `?estado=Activo` o `?estado=Inactivo`, salvo en Tipo) |
| GET | `/api/<modulo>/:id` | Consulta un registro por su `_id` |
| POST | `/api/<modulo>` | Crea un registro |
| PUT | `/api/<modulo>/:id` | Edita un registro (basta con enviar los campos a cambiar) |

Media:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/medias` | Lista las producciones con los datos de género, director, productora y tipo. Filtros opcionales: `?genero=ID`, `?director=ID`, `?productora=ID`, `?tipo=ID` |
| GET | `/api/medias/:id` | Consulta una producción |
| GET | `/api/medias/siguiente-serial`| Devuelve el siguiente serial libre |
| POST | `/api/medias` | Crea una producción |
| PUT | `/api/medias/:id` | Edita una producción (solo se validan las relaciones que se envíen) |
| DELETE | `/api/medias/:id` | Elimina una producción |

Ejemplo, crear un género: `POST /api/generos`
```json
{ "nombre": "Acción", "descripcion": "Películas de acción" }
```

## Pantallas del frontend

- **Inicio (`/`):** accesos directos a los cinco módulos.
- **Géneros, Directores, Productoras y Tipos:** una tabla con los registros y un formulario para crear o editar. Los mensajes de la API (campos obligatorios, valores repetidos) se muestran sobre el formulario. Una sola pantalla genérica (`CatalogoPage.jsx`) sirve a los cuatro, configurada desde `config/modulos.js`.
- **Media:** tarjetas con portada, título, año, tipo, género, director y productora. Permite filtrar por género y por tipo, crear y editar producciones, abrir la URL de la película y eliminar con confirmación. Las listas desplegables del formulario solo ofrecen géneros, directores y productoras activos. Al editar, solo se envían las relaciones que cambiaron, de modo que se puede corregir una producción aunque su género se haya desactivado después.

## Reglas de negocio

- Una producción tiene un único género, director principal, productora y tipo.
- Al crear o editar una producción, el género, el director y la productora deben existir y estar `Activo`. El tipo solo debe existir.
- El `serial` y la `url` de una producción no pueden repetirse.
- Solo se aceptan los campos definidos en cada módulo; las fechas las asigna el sistema.
- El serial se genera automáticamente con formato `MED-0001` y lo puede modificar el Administrador.

## Códigos de respuesta de la API

| Código | Cuándo ocurre |
|---|---|
| 200 | Consulta, edición o eliminación exitosa |
| 201 | Registro creado |
| 400 | Datos inválidos (campo obligatorio faltante, valor no permitido, ID mal formado, género/director/productora inactivo o inexistente) |
| 404 | No existe un registro con ese `_id` |
| 409 | Valor duplicado en un campo único (nombre, serial o url) |
| 500 | Error interno del servidor |

## Pruebas de la API

La colección `EA1_API_Peliculas.postman_collection.json` se importa desde **File > Import** en Postman. Tiene una carpeta por módulo y se ejecuta de arriba hacia abajo con el backend encendido: los POST guardan automáticamente los `_id` creados en variables de la colección y las peticiones siguientes los reutilizan. Incluye dos pruebas de error intencionales: crear una producción con un género inactivo (400) y repetir una producción con serial y URL ya existentes (409).

## Alcance actual y siguientes pasos

Quedan fuera por ahora, según el caso de estudio: autenticación y roles, pantallas para el público final (estudiantes, docentes y colaboradores) y el despliegue.
