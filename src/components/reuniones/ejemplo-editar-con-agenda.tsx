// ejemplo-editar-reunion-con-agenda.tsx
// Ejemplo actualizado mostrando el desplegable de agendas en la edición

import React, { useState } from 'react';
import { MeetingsDashboard, EditMeetingDialog } from "@/components/reuniones";
import { Button } from "@/components/ui/button";

// Ejemplo 1: Dashboard completo con edición y selector de agendas
export function EjemploDashboardConAgendas() {
  const organizacionId = "tu-organizacion-id";

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        Gestión de Reuniones con Selector de Agendas
      </h1>
      
      <MeetingsDashboard 
        organizacionId={organizacionId}
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

// Ejemplo 2: Uso del diálogo de edición de forma independiente
export function EjemploDialogoEditarIndependiente() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const organizacionId = "tu-organizacion-id";

  const handleUpdateMeeting = async (id: string, updateData: any) => {
    try {
      console.log("Actualizando reunión:", id, updateData);
      
      // Aquí iría la lógica para actualizar la reunión
      // Por ejemplo, usando fetch o tu hook de reuniones
      
      // Simular actualización exitosa
      return true;
    } catch (error) {
      console.error('Error updating meeting:', error);
      return false;
    }
  };

  // Ejemplo de reunión para editar
  const reunionEjemplo = {
    _id: "123",
    titulo: "Reunión de ejemplo",
    agenda: "agenda-id-123", // Este será el ID de agenda seleccionado
    lugar: "Sala de conferencias",
    tipo_reunion: "Ordinaria" as const,
    modalidad: "Presencial" as const,
    hora_inicio: "2025-06-15T09:00:00.000Z",
    hora_fin: "2025-06-15T10:00:00.000Z",
    organizacion: "org-123",
    convocados: [],
    archivos: []
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ejemplo de Edición de Reunión</h2>
      
      <Button 
        onClick={() => {
          setSelectedMeeting(reunionEjemplo);
          setShowEditDialog(true);
        }}
      >
        Editar Reunión de Ejemplo
      </Button>

      <EditMeetingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        meeting={selectedMeeting}
        onUpdate={handleUpdateMeeting}
        organizacionId={organizacionId}
      />
    </div>
  );
}

/*
NUEVA FUNCIONALIDAD IMPLEMENTADA:

✅ SELECTOR DE AGENDAS EN EDICIÓN:
1. El campo "Agenda" ahora es un desplegable (Select) en lugar de un textarea
2. Muestra todas las agendas disponibles de la organización
3. Permite seleccionar una agenda existente
4. Carga automáticamente las agendas al abrir el diálogo
5. Muestra estados de carga ("Cargando agendas...")
6. Maneja casos cuando no hay agendas disponibles

DIFERENCIAS CON LA VERSIÓN ANTERIOR:
❌ Antes: Campo de texto libre para escribir la agenda
✅ Ahora: Desplegable con agendas existentes de la organización

FLUJO DE USO:
1. Usuario hace click en editar reunión (botón ⋮)
2. Se abre el diálogo de edición
3. El hook useAgendas carga automáticamente las agendas disponibles
4. El campo "Agenda" muestra un desplegable con las opciones:
   - "Cargando agendas..." (mientras carga)
   - "No hay agendas disponibles" (si no hay agendas)
   - Lista de agendas existentes (cuando hay datos)
5. Usuario selecciona una agenda del desplegable
6. Al guardar, se envía el ID de la agenda seleccionada
7. La reunión se actualiza con la nueva agenda

CAMPOS DEL FORMULARIO DE EDICIÓN:
- Título de la reunión ✅
- Agenda (NUEVO: Desplegable de agendas) ✅
- Lugar ✅
- Tipo de reunión (Ordinaria/Extraordinaria) ✅
- Modalidad (Presencial/Virtual) ✅
- Hora de inicio ✅
- Hora de fin ✅

VALIDACIONES:
- Agenda es campo requerido (*)
- Validación de que existe una agenda seleccionada
- Manejo de errores de carga de agendas

DEPENDENCIAS NECESARIAS:
- useAgendas hook (ya existe)
- Componente Select de UI (ya existe)
- Ícono FileText para el label (agregado)

PROPS ACTUALIZADAS:
- EditMeetingDialog ahora requiere organizacionId como prop
- Todos los usos del componente han sido actualizados

Esta mejora hace que la edición de reuniones sea más consistente
con la creación de reuniones y evita errores de tipeo en las agendas.
*/
