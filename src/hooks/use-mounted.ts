// src/hooks/use-mounted.ts
"use client";

import { useEffect, useState } from 'react';

/**
 * Hook para verificar si el componente está montado en el cliente
 * Para evitar errores de hidratación con localStorage y otras APIs del navegador
 */
export function useMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
