# Patrón Adapter - PersonaAuthAdapter

## Descripción del Problema

El proyecto Agendafy tenía un sistema de autenticación (`AuthService`) diseñado específicamente para entidades `Usuario` (CEOs/Administradores). Sin embargo, se necesitaba que los miembros de la junta directiva (entidades `Persona`) también pudieran acceder al sistema usando sus propias credenciales.

## Solución: Patrón Adapter

Se implementó el **patrón estructural Adapter** para permitir que las entidades `Persona` utilicen el servicio de autenticación existente sin modificar el código original del `AuthService`.

### Componentes Implementados

#### 1. **PersonaAuthAdapter** (`src/adapters/PersonaAuthAdapter.ts`)
- **Propósito**: Actúa como puente entre las entidades `Persona` y el `AuthService`
- **Funcionalidades**:
  - `iniciarSesionPersona()`: Permite login de personas
  - `solicitarRecuperacionPersona()`: Recuperación de contraseñas
  - `restablecerContrasenaPersona()`: Restablecimiento de contraseñas
  - `establecerContrasenaPersona()`: Establecer contraseña inicial

#### 2. **Extensiones de Modelos y DTOs**
- **PersonaDTO.ts**: Agregados DTOs para autenticación de personas
- **Persona.ts**: Agregados campos para contraseña y tokens de reset
- **PersonaDAO.ts**: Agregados métodos para manejo de autenticación
- **auth.ts**: Extendido JWTPayload para soportar información de personas

#### 3. **APIs REST** (`src/pages/api/auth/persona/` y `/organizacion/`)
- `login.ts`: Endpoint para login de personas
- `forgot-password.ts`: Solicitud de recuperación
- `reset-password.ts`: Restablecimiento de contraseña
- `set-password.ts`: Establecimiento de contraseña inicial
- `crear-miembro.ts`: Creación de miembros con contraseña opcional

#### 4. **Componentes de UI**
- **PersonaLoginForm**: Formulario de login específico para personas
- **SetPasswordForm**: Formulario para establecer contraseña inicial
- **BoardMemberForm**: Formulario mejorado para crear miembros con contraseña
- **Páginas de autenticación**: Login y establecimiento de contraseñas

### Flujo de Autenticación

```
OPCIÓN 1 - Flujo Simplificado (Recomendado):
1. CEO crea una Persona en la junta directiva CON contraseña
2. Persona puede hacer login directamente en /auth/persona/login
3. PersonaAuthAdapter convierte las credenciales y utiliza AuthService
4. Se genera JWT con información específica de la persona
5. Persona accede al sistema con permisos según su rol

OPCIÓN 2 - Flujo con Configuración Posterior:
1. CEO crea una Persona en la junta directiva SIN contraseña
2. Persona accede a /auth/persona/set-password?email=persona@email.com
3. Persona establece su contraseña inicial
4. Persona puede hacer login en /auth/persona/login
5. PersonaAuthAdapter convierte las credenciales y utiliza AuthService
6. Se genera JWT con información específica de la persona
7. Persona accede al sistema con permisos según su rol
```

### Ventajas del Patrón Adapter

1. **Reutilización**: No se modificó el `AuthService` original
2. **Separación de responsabilidades**: Cada entidad mantiene su lógica específica
3. **Extensibilidad**: Fácil agregar nuevos tipos de usuarios en el futuro
4. **Mantenibilidad**: Cambios en una entidad no afectan la otra
5. **Flexibilidad**: Diferentes flujos de autenticación según el tipo de usuario

### Diferencias entre Usuario y Persona

| Aspecto | Usuario (CEO) | Persona (Junta Directiva) |
|---------|---------------|---------------------------|
| Registro | Autorregistro completo | Creado por CEO, contraseña configurada inmediatamente |
| Login | `/auth/login` | `/auth/persona/login` |
| Identificación | nombreUsuario | correo electrónico |
| Información adicional | Perfil básico | rol, organización |
| JWT Token | type: 'usuario' | type: 'persona', rol, organizacion |
| Configuración inicial | Inmediata | Opcional: inmediata o posterior |

### Estructura de Archivos

```
src/
├── adapters/
│   └── PersonaAuthAdapter.ts          # Adaptador principal
├── pages/api/
│   ├── auth/persona/
│   │   ├── login.ts                   # API login personas
│   │   ├── forgot-password.ts         # API recuperación
│   │   ├── reset-password.ts          # API reset
│   │   └── set-password.ts            # API establecer contraseña
│   └── organizacion/
│       └── crear-miembro.ts           # API crear miembro con contraseña
├── app/auth/persona/
│   ├── login/page.tsx                 # Página login personas
│   └── set-password/page.tsx          # Página establecer contraseña
├── components/
│   ├── auth/
│   │   ├── persona-login-form.tsx     # Formulario login personas
│   │   └── set-password-form.tsx      # Formulario establecer contraseña
│   └── organizacion/
│       └── board-member-form.tsx      # Formulario crear miembros (mejorado)
└── types/
    └── PersonaDTO.ts                  # DTOs extendidos
```

### Ejemplo de Uso

```typescript
// Crear adaptador
const personaAuthAdapter = new PersonaAuthAdapter();

// Login de persona
const result = await personaAuthAdapter.iniciarSesionPersona({
  correo: "miembro@junta.com",
  contrasena: "password123"
});

// El adaptador internamente:
// 1. Busca la persona por correo
// 2. Verifica la contraseña
// 3. Genera JWT con información específica
// 4. Retorna respuesta adaptada
```

Este patrón permite que el sistema sea escalable y mantenga la separación de responsabilidades mientras reutiliza la lógica de autenticación existente.

## Solución de Problemas

### Error: "Module not found: Can't resolve './dist/pages/_app'"

Si encuentras este error, verifica:

1. **Estructura de APIs**: Las APIs deben usar `NextApiRequest` y `NextApiResponse` en lugar del formato App Router
2. **Configuración de Next.js**: Asegúrate de que la configuración sea compatible con tu versión
3. **Parámetros de consulta**: Usar `useEffect` con `window.location.search` en lugar de `useSearchParams` para mayor compatibilidad

### Compatibilidad

El adaptador es compatible con:
- ✅ Next.js 13+ con Pages Router
- ✅ MongoDB con Mongoose
- ✅ JWT para autenticación
- ✅ TypeScript

## Próximos Pasos

1. **Testing**: Probar todas las funcionalidades del adaptador
2. **Permisos**: Implementar control de acceso basado en roles
3. **Notificaciones**: Agregar envío de emails cuando se crea una persona
4. **Audit Trail**: Registrar acciones de personas para auditoría

## Mejoras Implementadas

### ✅ **Flujo Optimizado de Creación de Miembros**

- **Antes**: CEO creaba miembro → Miembro establecía contraseña por separado
- **Ahora**: CEO puede establecer contraseña directamente al crear el miembro
- **Beneficio**: Proceso más eficiente y menos pasos para el usuario final

### 🔧 **Componentes Mejorados**

1. **BoardMemberForm**: Incluye campos de contraseña opcionales
2. **API crear-miembro**: Maneja creación con contraseña hasheada
3. **Hook use-board-members**: Actualizado para usar nueva API
4. **Validaciones**: Contraseñas seguras y confirmación

### 🎯 **Casos de Uso**

- **CEO Eficiente**: Crea miembro con contraseña → Miembro accede inmediatamente
- **CEO Delegador**: Crea miembro sin contraseña → Miembro configura después
- **Flexibilidad**: Ambos flujos coexisten según necesidades organizacionales
