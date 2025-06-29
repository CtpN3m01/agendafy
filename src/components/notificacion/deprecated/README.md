# Componentes Deprecated - Sistema de Notificaciones

Este directorio contiene componentes que fueron removidos del sistema activo de notificaciones como parte de la refactorización para implementar notificaciones automáticas.

## Componentes movidos aquí:

### `notificacion-admin-panel.tsx`
- **Motivo de deprecación**: Panel de gestión manual de notificaciones eliminado
- **Funcionalidad**: Permitía envío manual de notificaciones desde la UI
- **Reemplazado por**: Sistema automático de notificaciones integrado en la API de creación de reuniones

### `crear-notificacion-demo.tsx`
- **Motivo de deprecación**: Componente de pruebas/demo ya no necesario
- **Funcionalidad**: Creación de notificaciones de prueba para testing
- **Reemplazado por**: Sistema automático y testing backend

## Razón del cambio

Estos componentes fueron eliminados del flujo activo de la aplicación para:

1. **Automatización**: Las notificaciones ahora se envían automáticamente al crear reuniones
2. **Simplificación**: Eliminar la complejidad del envío manual desde la UI
3. **Mejores prácticas**: Centralizar la lógica de notificaciones en el backend
4. **Experiencia de usuario**: Reducir la carga cognitiva del usuario eliminando pasos manuales

## Arquitectura actual

Las notificaciones ahora se manejan automáticamente a través de:
- `ReunionNotificacionService`: Servicio especializado para notificaciones de reuniones
- API `crearReunion.ts`: Integra el envío automático al crear reuniones
- Hooks especializados para la integración con React

Los componentes activos se centran únicamente en la **visualización y gestión** de notificaciones recibidas, no en su creación/envío.
