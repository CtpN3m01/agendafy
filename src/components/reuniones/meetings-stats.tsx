// src/components/reuniones/meetings-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Activity } from "lucide-react";

interface MeetingsStatsProps {
  stats: {
    total: number;
    programadas: number;
    enCurso: number;
    finalizadas: number;
  };
  isLoading?: boolean;
}

export function MeetingsStats({ stats, isLoading = false }: MeetingsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total",
      value: stats.total,
      icon: Calendar,
      variant: "default" as const,
      description: "Reuniones totales"
    },
    {
      title: "Programadas",
      value: stats.programadas,
      icon: Clock,
      variant: "secondary" as const,
      description: "Por realizar"
    },
    {
      title: "En Curso",
      value: stats.enCurso,
      icon: Activity,
      variant: "destructive" as const,
      description: "Actualmente"
    },
    {
      title: "Finalizadas",
      value: stats.finalizadas,
      icon: Users,
      variant: "outline" as const,
      description: "Completadas"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <Badge variant={stat.variant} className="text-xs">
                  {stat.description}
                </Badge>
              </div>
              {stats.total > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground">
                    {((stat.value / stats.total) * 100).toFixed(1)}% del total
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(stat.value / stats.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
