# REUNION API

## Índice

- [Crear Reunion](#crear-reunion)
- [Eliminar Reunion](#eliminar-reunion)
- [Actualizar Reunion](#editar-reunion)
- [Obtener Reunion](#obtener-reunion)
- [Enviar Correo](#enviar-correo)

## Crear Reunion

`POST` `/api/mongo/Reunion/crearReunion`

```json
{
  "_id": "string", // de tipo ObjectId -> debe ser generado manualmente
  "titulo": "string",
  "organizacion": "string", // de tipo ObjectId
  "hora_inicio": "AAAA-MM-DDTHH:MM:SSZ",
  "hora_fin": "AAAA-MM-DDTHH:MM:SSZ",
  "archivos": ["string"],
  "convocados": ["string"],
  "lugar": "string",
  "tipo_reunion": "string",
  "modalidad": "string",
  "agenda": "string", // nombre de la agenda
  "puntos": ["string"] // referente a los puntos de la reunion
}
```

### Respuesta `200`
```json
{
    "_id": "string",
    "titulo": "string",
    "organizacion": "string",
    "hora_inicio": "AAAA-MM-DDTHH:MM:SSZ",
    "archivos": [],
    "convocados": [
        "string"
    ],
    "lugar": "string",
    "tipo_reunion": "string",
    "modalidad": "string",
    "agenda": "string",
    "puntos": [],
    "__v": 0
}
```

### Respuesta `400`
```json
{
  "error": "Error al crear la reunion"
}
```

### Ejemplo
```json
{
    "_id": "60f7c7c3f8a7c23eec0f5f6e",
    "titulo": "TEC-123",
    "organizacion": "60f7c7c3f8a7c23eec0f5f6d",
    "hora_inicio": "2025-06-05T15:32:00.000Z",
    "convocados": ["miguel"],
    "lugar": "tec",
    "tipo_reunion": "Extraordinaria",
    "modalidad": "Presencial",
    "agenda": "No tengo idea"
}
```

## Eliminar Reunion
`DELETE` `/api/mongo/Reunion/eliminarReunion?id=id_reunion`

### Respuesta `200`
```json
{
  "message": "Reunion eliminada correctamente"
}
```

### Respuesta `400`
```json
{
  "error": "Error al eliminar la reunion"
}
```

### Ejemplo
`api/mongo/Reunion/eliminarReunion?id=60f7c7c3f8a7c23eec0f5f6e`

## Editar Reunion
`PUT` `/api/mongo/Reunion/editarReunion`

```json
{
  "_id": "string", // de tipo ObjectId
  "titulo": "string",
  "hora_inicio": "AAAA-MM-DDTHH:MM:SSZ",
  "hora_fin": "AAAA-MM-DDTHH:MM:SSZ",
  "archivos": ["string"],
  "convocados": ["string"],
  "lugar": "string",
  "tipo_reunion": "string",
  "modalidad": "string",
  "agenda": "string", // nombre de la agenda
  "puntos": ["string"] // referente a los puntos de la reunion
}
```

### Respuesta `200`
```json
{   
    "message": "Reunión actualizada correctamente",
    "reunion": {
        "_id": "string",
        "titulo": "string",
        "organizacion": "string",
        "hora_inicio": "AAAA-MM-DDTHH:MM:SSZ",
        "hora_fin": "AAAA-MM-DDTHH:MM:SSZ",
        "archivos": [],
        "convocados": [
            "string"
        ],
        "lugar": "string",
        "tipo_reunion": "string",
        "modalidad": "string",
        "agenda": "string",
        "puntos": [],
        "__v": 0
    }
}
```

### Respuesta `400`
```json
{
  "error": "Error al editar la reunion"
}
```

### Ejemplo
```json
{
    "_id": "60f7c7c3f8a7c23eec0f5f6e",
    "titulo": "Hola Mundo"
}
```

## Obtener Reunion
`GET` `/api/mongo/Reunion/obtenerReunion?id=id_reunion`

### Respuesta `200`
```json
{
    "_id": "string",
    "titulo": "string",
    "organizacion": "string",
    "hora_inicio": "AAAA-MM-DDTHH:MM:SSZ",
    "hora_fin": "AAAA-MM-DDTHH:MM:SSZ",
    "archivos": [],
    "convocados": [
        "string"
    ],
    "lugar": "string",
    "tipo_reunion": "string",
    "modalidad": "string",
    "agenda": "string",
    "puntos": [],
    "__v": 0
}
```

### Respuesta `404`
```json
{
  "error": "Reunion no encontrada"
}
```

### Ejemplo
`api/mongo/Reunion/obtenerReunion?id=60f7c7c3f8a7c23eec0f5f6e`

## Enviar Correo
`POST` `/api/mongo/Reunion/enviarCorreo`

```json
{
  "to": "string",
  "subject": "string",
  "detalles": {
    "titulo": "string",
    "hora_inicio": "AAAA-MM-DDTHH:MM:SSZ",
    "hora_fin": "AAAA-MM-DDTHH:MM:SSZ",
    "lugar": "string",
    "tipo_reunion": "string",
    "modalidad": "string",
    "archivos": ["string"],
    "agenda": "string",
    "puntos": ["string"]
  }
}
