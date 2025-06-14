// ejemplo-uso-editar-reunion.tsx
// Este es un ejemplo de cómo usar los componentes con la funcionalidad de editar

import React from 'react';
import { MeetingsDashboard, MeetingList } from "@/components/reuniones";

// Ejemplo 1: Usando el Dashboard completo (recomendado)
export function EjemploDashboardCompleto() {
  return (
    <div className="container mx-auto py-6">
      <MeetingsDashboard 
        organizacionId="tu-organizacion-id"
        enableFeatures={{
          stats: true,
          pagination: true,
          autoRefresh: true,
          sorting: true
        }}
      />
    </div>
  );
}

// Ejemplo 2: Usando solo la lista de reuniones
export function EjemploListaReuniones() {
  const handleCreateMeeting = () => {
    console.log("Crear nueva reunión");
  };

  const handleJoinMeeting = (meetingId: string) => {
    console.log("Unirse a reunión:", meetingId);
  };

  return (
    <div className="container mx-auto py-6">
      <MeetingList 
        organizacionId="tu-organizacion-id"
        enableAutoRefresh={true}
        refreshInterval={30000}
        onCreateMeeting={handleCreateMeeting}
        onJoinMeeting={handleJoinMeeting}
      />
    </div>
  );
}

// Ejemplo 3: Usando componentes personalizados con edición
export function EjemploPersonalizado() {
  const organizacionId = "tu-organizacion-id";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Reuniones</h1>
      
      {/* Dashboard con todas las funcionalidades */}
      <MeetingsDashboard 
        organizacionId={organizacionId}
        enableFeatures={{
          stats: true,
          pagination: true,
          autoRefresh: false, // Desactivar auto-refresh en este ejemplo
          sorting: true
        }}
      />
    </div>
  );
}

/*
FUNCIONALIDADES INCLUIDAS:

1. ✅ Botón de editar en cada reunión
2. ✅ Menú desplegable con opciones
3. ✅ Diálogo de edición funcional
4. ✅ Actualización automática después de editar
5. ✅ Manejo de errores y estados de carga
6. ✅ Separación de clicks (card vs botón editar)
7. ✅ Interfaz responsive y moderna
8. ✅ Integración completa con el backend

CÓMO FUNCIONA EL BOTÓN DE EDITAR:

1. El usuario hace click en el menú de tres puntos (⋮)
2. Se abre un menú desplegable con la opción "Editar reunión"
3. Al hacer click, se abre un diálogo modal con los datos actuales
4. El usuario puede modificar los campos necesarios
5. Al guardar, se envía la actualización al backend
6. La lista se actualiza automáticamente
7. Se muestra una notificación de éxito o error

CAMPOS EDITABLES:
- Título de la reunión
- Agenda/Descripción
- Lugar
- Tipo de reunión (Ordinaria/Extraordinaria)
- Modalidad (Presencial/Virtual)
- Hora de inicio
- Hora de fin

VALIDACIONES:
- Campos requeridos validados
- Formato de fechas correcto
- Hora de inicio anterior a hora de fin
- Manejo de errores del servidor

USO RECOMENDADO:
Para la mayoría de casos, usar MeetingsDashboard que incluye
todas las funcionalidades optimizadas.
*/
