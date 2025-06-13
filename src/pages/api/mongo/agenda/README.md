# AGENDA API

## Índice

- [Crear Agenda](#crear-agenda)
- [Eliminar Agenda](#eliminar-agenda)
- [Editar Agenda](#editar-agenda)
- [Obtener Agenda](#obtener-agenda)

## Crear Agenda

`POST` `/api/mongo/agenda/crearAgenda`

```json
{
  "nombre": "string",
  "organizacion": "string", // ObjectId de la organización
  "puntos": ["string"], // array de ObjectIds referentes a puntos (opcional)
  "reuniones": ["string"] // array de ObjectIds referentes a reuniones (opcional)
}
```

### Respuesta `201`
```json
{
    "_id": "string", // Generado automáticamente por MongoDB
    "nombre": "string",
    "organizacion": "string",
    "puntos": [],
    "reuniones": [],
    "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "__v": 0
}
```

### Respuesta `400`
```json
{
  "message": "Datos incompletos. nombre y organizacion son requeridos."
}
```

### Ejemplo
```json
{
    "nombre": "Agenda Trimestral 2024",
    "organizacion": "675a1b2c3d4e5f6789012345"
}
```

## Eliminar Agenda
`DELETE` `/api/mongo/agenda/eliminarAgenda?id=id_agenda`

### Respuesta `200`
```json
{
  "message": "Agenda eliminada correctamente"
}
```

### Respuesta `404`
```json
{
  "message": "Agenda no encontrada"
}
```

### Respuesta `400`
```json
{
  "message": "ID requerido"
}
```

### Ejemplo
`/api/mongo/agenda/eliminarAgenda?id=675a1b2c3d4e5f6789012345`

## Editar Agenda
`PUT` `/api/mongo/agenda/editarAgenda`

```json
{
  "_id": "string", // de tipo ObjectId
  "nombre": "string",
  "organizacion": "string", // ObjectId de la organización
  "puntos": ["string"], // array de ObjectIds referentes a puntos
  "reuniones": ["string"] // array de ObjectIds referentes a reuniones
}
```

### Respuesta `200`
```json
{   
    "message": "Agenda actualizada correctamente",
    "agenda": {
        "_id": "string",
        "nombre": "string",
        "organizacion": "string",
        "puntos": ["string"],
        "reuniones": ["string"],
        "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "__v": 0
    }
}
```

### Respuesta `404`
```json
{
  "message": "Agenda no encontrada"
}
```

### Respuesta `400`
```json
{
  "message": "ID requerido"
}
```

### Ejemplo
```json
{
    "_id": "675a1b2c3d4e5f6789012345",
    "nombre": "Agenda Trimestral Actualizada 2024",
    "organizacion": "675a1b2c3d4e5f6789012340",
    "puntos": ["675a1b2c3d4e5f6789012346"],
    "reuniones": ["675a1b2c3d4e5f6789012347"]
}
```

## Obtener Agenda
`GET` `/api/mongo/agenda/obtenerAgenda`

### Parámetros de consulta (opcionales)

- `id`: Obtener agenda específica por ID
- `organizacion`: Obtener agendas de una organización específica
- `nombre`: Buscar agendas por nombre (búsqueda parcial)
- `poblado`: Si es `true`, incluye datos poblados de organización, puntos y reuniones

### Obtener todas las agendas
`GET` `/api/mongo/agenda/obtenerAgenda`

### Respuesta `200`
```json
[
    {
        "_id": "string",
        "nombre": "string",
        "organizacion": "string",
        "puntos": ["string"],
        "reuniones": ["string"],
        "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "__v": 0
    }
]
```

### Obtener agenda por ID
`GET` `/api/mongo/agenda/obtenerAgenda?id=id_agenda`

### Respuesta `200`
```json
{
    "_id": "string",
    "nombre": "string",
    "organizacion": "string",
    "puntos": ["string"],
    "reuniones": ["string"],
    "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "__v": 0
}
```

### Obtener agendas por organización
`GET` `/api/mongo/agenda/obtenerAgenda?organizacion=id_organizacion`

### Respuesta `200`
```json
[
    {
        "_id": "string",
        "nombre": "string",
        "organizacion": "string",
        "puntos": ["string"],
        "reuniones": ["string"],
        "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "__v": 0
    }
]
```

### Obtener agenda con datos poblados
`GET` `/api/mongo/agenda/obtenerAgenda?id=id_agenda&poblado=true`

### Respuesta `200`
```json
{
    "_id": "string",
    "nombre": "string",
    "organizacion": {
        "_id": "string",
        "nombre": "string",
        "correo": "string",
        // ... otros campos de la organización
    },
    "puntos": [
        {
            "_id": "string",
            "titulo": "string",
            "descripcion": "string",
            // ... otros campos del punto
        }
    ],
    "reuniones": [
        {
            "_id": "string",
            "titulo": "string",
            "hora_inicio": "AAAA-MM-DDTHH:MM:SS.SSSZ",
            // ... otros campos de la reunión
        }
    ],
    "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "__v": 0
}
```

### Buscar agendas por nombre
`GET` `/api/mongo/agenda/obtenerAgenda?nombre=Trimestral`

### Respuesta `200`
```json
[
    {
        "_id": "string",
        "nombre": "Agenda Trimestral 2024",
        "organizacion": "string",
        "puntos": ["string"],
        "reuniones": ["string"],
        "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
        "__v": 0
    }
]
```

### Respuesta `404`
```json
{
  "message": "Agenda no encontrada"
}
```

### Ejemplos de uso

1. **Obtener todas las agendas:**
   ```
   GET /api/mongo/agenda/obtenerAgenda
   ```

2. **Obtener agenda específica:**
   ```
   GET /api/mongo/agenda/obtenerAgenda?id=675a1b2c3d4e5f6789012345
   ```

3. **Obtener agendas de una organización:**
   ```
   GET /api/mongo/agenda/obtenerAgenda?organizacion=675a1b2c3d4e5f6789012340
   ```

4. **Obtener agenda con datos completos:**
   ```
   GET /api/mongo/agenda/obtenerAgenda?id=675a1b2c3d4e5f6789012345&poblado=true
   ```

5. **Buscar agendas por nombre:**
   ```
   GET /api/mongo/agenda/obtenerAgenda?nombre=Trimestral
   ```