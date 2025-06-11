# PUNTO API

## Índice

- [Crear Punto](#crear-punto)
- [Obtener Punto](#obtener-punto)
- [Editar Punto](#editar-punto)
- [Eliminar Punto](#eliminar-punto)

## Crear Punto

`POST` `/api/mongo/punto/crearPunto`

```json
{
  "titulo": "string",
  "tipo": "Informativo" | "Aprobacion" | "Fondo",
  "duracion": number,
  "comentarios": "string", // opcional
  "expositor": "string",
  "archivos": ["string"], // array de URLs, opcional
  "votosAFavor": number, // opcional, para tipo Aprobacion
  "votosEnContra": number, // opcional, para tipo Aprobacion
  "decisiones": ["string"], // opcional, para tipo Fondo
  "agenda": "string" // ObjectId de la agenda
}
```

### Respuesta `201`
```json
{
  "_id": "string", // Generado automáticamente por MongoDB
  "titulo": "string",
  "tipo": "string",
  "duracion": number,
  "comentarios": "string",
  "expositor": "string",
  "archivos": ["string"],
  "votosAFavor": number,
  "votosEnContra": number,
  "decisiones": ["string"],
  "agenda": "string",
  "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
  "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
  "__v": 0
}
```

### Respuesta `400`
```json
{
  "message": "ID de agenda inválido"
}
```

### Respuesta `500`
```json
{
  "message": "Error interno del servidor"
}
```

### Ejemplo
```json
{
  "titulo": "Aprobación del presupuesto 2024",
  "tipo": "Aprobacion",
  "duracion": 30,
  "comentarios": "Revisar incremento del 15%",
  "expositor": "Juan Pérez",
  "archivos": ["https://example.com/presupuesto.pdf"],
  "votosAFavor": 0,
  "votosEnContra": 0,
  "agenda": "675a1b2c3d4e5f6789012345"
}
```

## Obtener Punto

`GET` `/api/mongo/Punto/obtenerPunto?id=id_punto`

### Respuesta `200`
```json
{
  "_id": "string",
  "titulo": "string",
  "tipo": "string",
  "duracion": number,
  "comentarios": "string",
  "expositor": "string",
  "archivos": ["string"],
  "votosAFavor": number,
  "votosEnContra": number,
  "decisiones": ["string"],
  "agenda": "string",
  "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
  "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
  "__v": 0
}
```

### Respuesta `400`
```json
{
  "message": "El ID debe ser una cadena"
}
```

### Respuesta `404`
```json
{
  "message": "Punto no encontrado"
}
```

### Ejemplo
`/api/mongo/Punto/obtenerPunto?id=675a1b2c3d4e5f6789012345`

## Editar Punto

`PUT` `/api/mongo/Punto/editarPunto`

```json
{
  "id": "string", // ObjectId del punto a editar
  "titulo": "string", // opcional
  "tipo": "Informativo" | "Aprobacion" | "Fondo", // opcional
  "duracion": number, // opcional
  "comentarios": "string", // opcional
  "expositor": "string", // opcional
  "archivos": ["string"], // opcional
  "votosAFavor": number, // opcional
  "votosEnContra": number, // opcional
  "decisiones": ["string"] // opcional
}
```

### Respuesta `200`
```json
{
  "message": "Punto actualizado correctamente",
  "punto": {
    "_id": "string",
    "titulo": "string",
    "tipo": "string",
    "duracion": number,
    "comentarios": "string",
    "expositor": "string",
    "archivos": ["string"],
    "votosAFavor": number,
    "votosEnContra": number,
    "decisiones": ["string"],
    "agenda": "string",
    "createdAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "updatedAt": "AAAA-MM-DDTHH:MM:SS.SSSZ",
    "__v": 0
  }
}
```

### Respuesta `400`
```json
{
  "message": "ID requerido"
}
```

### Respuesta `404`
```json
{
  "message": "Punto no encontrado"
}
```

### Ejemplo
```json
{
  "id": "675a1b2c3d4e5f6789012345",
  "titulo": "Aprobación del presupuesto 2024 - Actualizado",
  "votosAFavor": 5,
  "votosEnContra": 2
}
```

## Eliminar Punto

`DELETE` `/api/mongo/Punto/eliminarPunto`

```json
{
  "id": "string" // ObjectId del punto a eliminar
}
```

### Respuesta `200`
```json
{
  "message": "Punto eliminado correctamente"
}
```

### Respuesta `400`
```json
{
  "message": "ID requerido"
}
```

### Respuesta `404`
```json
{
  "message": "Punto no encontrado"
}
```

### Ejemplo
```json
{
  "id": "675a1b2c3d4e5f6789012345"
}
```

## Tipos de Punto

### Informativo
- Solo requiere: `titulo`, `tipo`, `duracion`, `expositor`, `agenda`
- Campos opcionales: `comentarios`, `archivos`

### Aprobacion
- Requiere: `titulo`, `tipo`, `duracion`, `expositor`, `agenda`
- Campos específicos: `votosAFavor`, `votosEnContra`
- Campos opcionales: `comentarios`, `archivos`

### Fondo
- Requiere: `titulo`, `tipo`, `duracion`, `expositor`, `agenda`
- Campos específicos: `decisiones` (array de strings)
- Campos opcionales: `comentarios`, `archivos`

## Ejemplos de uso por tipo

### Punto Informativo
```json
{
  "titulo": "Informe de actividades trimestrales",
  "tipo": "Informativo",
  "duracion": 15,
  "expositor": "María García",
  "agenda": "675a1b2c3d4e5f6789012345"
}
```

### Punto de Aprobación
```json
{
  "titulo": "Aprobación del nuevo reglamento",
  "tipo": "Aprobacion",
  "duracion": 45,
  "expositor": "Carlos López",
  "votosAFavor": 0,
  "votosEnContra": 0,
  "agenda": "675a1b2c3d4e5f6789012345"
}
```

### Punto de Fondo
```json
{
  "titulo": "Restructuración organizacional",
  "tipo": "Fondo",
  "duracion": 60,
  "expositor": "Ana Martínez",
  "decisiones": [],
  "agenda": "675a1b2c3d4e5f6789012345"
}
```