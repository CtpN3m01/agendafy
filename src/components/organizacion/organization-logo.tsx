// src/components/organizacion/organization-logo.tsx
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface OrganizationLogoProps {
  logoUrl?: string;
  organizationName: string;
  size?: "sm" | "md" | "lg";
}

export function OrganizationLogo({ logoUrl, organizationName, size = "md" }: OrganizationLogoProps) {
  const { token } = useAuth();
  const [imageSrc, setImageSrc] = useState<string | undefined>();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16", 
    lg: "h-24 w-24"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  useEffect(() => {
    if (!logoUrl) {
      setImageSrc(undefined);
      return;
    }

    // Si es base64, usar directamente
    if (logoUrl.startsWith('data:')) {
      setImageSrc(logoUrl);
      return;
    }

    // Si es una URL de API, agregar headers de autenticación
    if (logoUrl.startsWith('/api/') && token) {
      // Para imágenes de API necesitamos manejar la autenticación diferente
      // Vamos a convertir la URL en un blob con fetch
      const loadImage = async () => {
        try {
          const response = await fetch(logoUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
          } else {
            console.error('Error loading logo from API');
            setImageSrc(undefined);
          }
        } catch (error) {
          console.error('Error fetching logo:', error);
          setImageSrc(undefined);
        }
      };

      loadImage();

      // Cleanup function para revocar la URL del blob
      return () => {
        if (imageSrc && imageSrc.startsWith('blob:')) {
          URL.revokeObjectURL(imageSrc);
        }
      };
    }

    // Para URLs normales
    setImageSrc(logoUrl);
  }, [logoUrl, token]);

  return (
    <Avatar className={sizeClasses[size]}>
      {imageSrc ? (
        <AvatarImage 
          src={imageSrc}
          alt={organizationName}
          onError={() => {
            console.error('Error displaying logo');
            setImageSrc(undefined);
          }}
        />
      ) : (
        <AvatarFallback className={textSizeClasses[size]}>
          {getInitials(organizationName)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
