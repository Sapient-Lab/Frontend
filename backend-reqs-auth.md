# Requerimientos de Backend: Flujo de Autenticación (Auth)

Necesitamos que expongan los siguientes Endpoints REST para el manejo de usuarios. Lo ideal es que devuelvan un JWT (JSON Web Token) para manejar la sesión.

### 1. Crear Cuenta (Registro)
- **Endpoint:** `POST /api/auth/register`
- **Body esperado (JSON):**
  ```json
  {
    "name": "Juan Perez",
    "email": "juan@example.com",
    "password": "Password123!"
  }
  ```
- **Respuesta esperada:** Datos del usuario creado y el token de sesión (o solo un success `201` indicando que se creó exitosamente).

### 2. Iniciar Sesión (Login)
- **Endpoint:** `POST /api/auth/login`
- **Body esperado (JSON):**
  ```json
  {
    "email": "juan@example.com",
    "password": "Password123!"
  }
  ```
- **Respuesta esperada:** El `access_token` (JWT) para poder guardarlo en el Frontend (Local Storage/Cookies) y enviarlo en las siguientes peticiones como Bearer token.

### 3. Recuperar Contraseña
Necesitamos dos pasos para esto:
- **A. Solicitar recuperación:** `POST /api/auth/forgot-password`
  - **Body:** `{ "email": "juan@example.com" }`
  - **Acción del backend:** Generar token y enviar correo electrónico.
  
- **B. Cambiar la contraseña:** `POST /api/auth/reset-password`
  - **Body:** `{ "token": "abc123token", "newPassword": "NewPassword456!" }`

---

# Requerimientos de Backend: Flujo de Proyectos / Laboratorio

Basado en la Interfaz de Usuario que ya tenemos construida (Onboarding, Dashboard y Laboratorio), necesitamos los siguientes Endpoints para conectarlos.

### 4. Gestión de Proyectos / Equipos (Onboarding)
En el Front, el usuario decide si juega "Solo" o "En equipo".
- **Obtener proyectos disponibles:** `GET /api/projects`
  - **Respuesta:** Una lista de proyectos públicos a los que el usuario puede solicitar unirse `[{ id, name, owner, desc }]`.
- **Crear un nuevo proyecto (Modo Solo o Admin):** `POST /api/projects`
  - **Body:** `{ "projectName": "Mi API", "projectDesc": "Descripción" }`
- **Unirse a un proyecto (Modo Equipo):** `POST /api/projects/:id/join`
  - **Body:** `{ "userId": 123 }`

### 5. Flujo de Progreso de Módulos (En Dashboard)
El Front muestra un resumen de los módulos y el % de completado.
- **Obtener perfil y progreso del usuario:** `GET /api/users/me/progress`
  - **Respuesta esperada:** 
    ```json
    {
      "currentModule": "API REST con Spring",
      "completionPercentage": 28,
      "pendingTasks": 2,
      "recentActivity": [ ... ]
    }
    ```

### 6. Sistema de Logs de Equipo / Bitácora (En Laboratorio)
En la parte izquierda del IDE, los usuarios o el Agente IA dejan mensajes.
- **Obtener historial de Logs:** `GET /api/projects/:id/logs`
- **Publicar un nuevo Log (Mensaje humano):** `POST /api/projects/:id/logs`
  - **Body:** `{ "message": "Arreglé la base de datos." }`

---

# Requerimientos de Backend: Servicios de Inteligencia Artificial (AI)

Para soportar las funcionalidades avanzadas implementadas en el Frontend (Análisis de código, Visión, Escáner de protocolos y Evaluación de tareas), se necesitan los siguientes endpoints que conecten con Mistral o el proveedor de IA:

### 7. Análisis de Imágenes de Laboratorio
- **Endpoint:** `POST /api/ai/analyze-image`
- **Body:** `{ "image": "base64_string", "prompt": "¿Qué muestra esta gráfica?" }`
- **Respuesta:** `{ "analysis": "La imagen muestra una gráfica de dispersión..." }`

### 8. Explicación de Código y Detección de Errores
- **Endpoint:** `POST /api/ai/explain-code`
- **Body:** `{ "code": "function()...", "context": "Error en React" }`
- **Respuesta JSON estructurado:** 
  ```json
  {
    "summary": "Explicación general",
    "risks": ["Posible memory leak", "No manejas excepciones"],
    "improvements": ["Usa try/catch", "Añade tipado"]
  }
  ```

### 9. Escáner de Protocolos (Data Analysis)
- **Endpoint:** `POST /api/ai/interpret-protocol`
- **Body:** `{ "protocolText": "Pasos del experimento..." }`
- **Respuesta JSON estructurado:**
  ```json
  {
    "riskLevel": "alto",
    "summary": "Manejo de ácidos peligrosos",
    "hazards": ["Corrosivo", "Gases tóxicos"],
    "checklist": ["Usar gafas", "Trabajar en campana extractora"]
  }
  ```

### 10. Análisis de CSV (Estructurado)
- **Endpoint:** `POST /api/ai/analyze-results`
- **Body:** `{ "data": "csv_parsed_array_or_string", "columns": ["A", "B"] }`
- **Respuesta:** `{ "analysis": "Se observa una correlación positiva..." }`

---

# Requerimientos de Backend: Tareas y Recursos

### 11. Gestión de Tareas (Tareas y Entregables)
- **Listar Tareas:** `GET /api/tasks` (Debe devolver las tareas asignadas al usuario y su estado: `pending`, `evaluating`, `approved`, `rejected`).
- **Entregar Tarea:** `POST /api/tasks/:id/submit`
  - **Body:** `{ "content": "https://github.com/repo..." }` o archivo.
- **Evaluación Automática (IA):** `POST /api/ai/evaluate-task`
  - **Body:** `{ "taskId": "123", "submission": "..." }`
  - **Respuesta:** Estado de aprobación y feedback autogenerado.

### 12. Repositorio de Recursos
- **Listar Documentación:** `GET /api/resources`
  - **Query Params:** `?category=pdf&module=1`
  - **Respuesta:** Una lista de objetos `{ id, title, type, module, url, tags }`.
