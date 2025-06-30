import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, Calendar } from "lucide-react";
import { NotificacionResponseDTO } from '@/types/NotificacionDTO';

interface NotificacionResumenProps {
  notificaciones: NotificacionResponseDTO[];
  conteoNoLeidas: number;
}

export const NotificacionResumen: React.FC<NotificacionResumenProps> = ({
  notificaciones,
  conteoNoLeidas
}) => {
  const notificacionesHoy = notificaciones.filter(n => {
    const hoy = new Date();
    const fechaNotif = new Date(n.fecha);
    return fechaNotif.toDateString() === hoy.toDateString();
  }).length;

  const estadisticas = [
    {
      titulo: "Total",
      valor: notificaciones.length,
      descripcion: "Notificaciones totales",
      icono: Bell,
      color: "text-gray-600"
    },
    {
      titulo: "No leídas",
      valor: conteoNoLeidas,
      descripcion: "Requieren atención",
      icono: Mail,
      color: "text-blue-600"
    },
    {
      titulo: "Hoy",
      valor: notificacionesHoy,
      descripcion: "Recibidas hoy",
      icono: Calendar,
      color: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {estadisticas.map((stat, index) => {
        const IconComponent = stat.icono;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.titulo}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.valor}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.descripcion}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
