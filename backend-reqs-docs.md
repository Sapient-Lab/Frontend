# Requerimientos de Backend para Sección de Documentos ("Mini Google Scholar")

## 1. Endpoint para Subir Documentos (Upload Document)
**POST** `/api/docs/upload`
- **Body**: Ocupará `multipart/form-data` con el archivo (PDF, Word, TXT, etc.) y `projectId` (si aplica el contexto a un proyecto).
- **Acción esperada del Backend**:
  - Subir y guardar el archivo en un Storage (AWS S3, Azure Blob, o filesystem temporal).
  - Extraer el texto completo del documento (OCR / Parsing).
  - **Super Importante:** Generar *embeddings* del texto extraído y guardarlos en una Base de Datos Vectorial (Vector DB, ej. Qdrant, Pinecone, o pgvector) asociados a este usuario/proyecto. Esto habilitará el patrón RAG (Retrieval-Augmented Generation) para el chat.
- **Respuesta esperada**: Metadata del documento (docId, nombre, fecha, tamaño).

## 2. Endpoint para Consultar al "Google Scholar Interno" (Chat con Documentos)
**POST** `/api/docs/chat`
- **Body (`application/json`)**:
  ```json
  {
    "projectId": "12345", // Opcional, si queremos aislar por contexto
    "query": "lee el documento de lab34 y dime qué reglas químicas tiene"
  }
  ```
- **Acción esperada del Backend**:
  - Generar embedding del `query`.
  - Buscar los fragmentos (chunks) más parecidos/relevantes en la Base de Datos Vectorial (semantic search).
  - Enviar esos fragmentos más el `query` inicial del usuario al LLM (GPT-4, Mistral, Claude, etc.) usando un prompt de sistema rígido para que *solo* conteste con base en la documentación recuperada.
- **Respuesta esperada (`application/json`)**:
  ```json
  {
    "answer": "Según el documento Lab34, las reglas de seguridad establecen que...",
    "sources": ["Lab34_Manual.pdf", "Guia_General.docx"] // Opcional pero útil para darle transparencia al usuario final
  }
  ```

## 3. Endpoint para Listar Documentos Subidos (Biblioteca del Proyecto/Usuario)
**GET** `/api/docs/project/:projectId` (o `/api/docs/me`)
- **Acción esperada del Backend**:
  - Obtener el listado de documentos ya indexados y subidos por el usuario.
- **Respuesta esperada (`application/json`)**:
  ```json
  [
    {
      "id": "doc_1",
      "name": "manual_bioseguridad_v1.pdf",
      "size": 4500000, // bytes
      "uploadDate": "2026-03-25T10:00:00Z"
    }
  ]
  ```

---
*Cualquier detalle sobre estos endpoints, por favor agregarlos al Postman / OpenAPI swagger para que el frontend pueda consumirlos usando los servicios de Axios/Fetch habituales gracias.*