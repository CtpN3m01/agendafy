// Script para probar y diagnosticar Supabase Storage
// Ejecutar con: node scripts/test-supabase-storage.js

const fs = require('fs');
const path = require('path');

// Leer .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envVars = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.error('Error leyendo .env.local:', error.message);
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = envVars.SUPABASE_BUCKET_NAME || 'reuniones';

console.log('🔍 Verificando configuración de Supabase Storage...');
console.log('URL:', SUPABASE_URL);
console.log('Bucket:', BUCKET_NAME);
console.log('');

async function testSupabaseStorage() {
  try {
    // Test 1: Verificar buckets disponibles
    console.log('📦 Verificando buckets disponibles...');
    const bucketsResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (bucketsResponse.ok) {
      const buckets = await bucketsResponse.json();
      console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
      
      const targetBucket = buckets.find(b => b.name === BUCKET_NAME);
      if (targetBucket) {
        console.log('✅ Bucket "reuniones" encontrado:', targetBucket);
        console.log('🔒 Público:', targetBucket.public ? 'Sí' : 'No');
        console.log('🔒 Restringido por tamaño:', targetBucket.file_size_limit || 'Sin límite');
        console.log('🔒 Tipos permitidos:', targetBucket.allowed_mime_types || 'Todos');
      } else {
        console.log('❌ Bucket "reuniones" no encontrado');
        console.log('📝 Necesitas crear el bucket "reuniones"');
      }
    } else {
      console.log('❌ Error obteniendo buckets:', await bucketsResponse.text());
    }

    // Test 2: Verificar políticas del bucket
    console.log('\n🔐 Verificando políticas de seguridad...');
    console.log('📝 Para solucionar el error RLS, necesitas:');
    console.log('1. Ir a Supabase Dashboard > Storage > Policies');
    console.log('2. Crear políticas para el bucket "reuniones"');
    console.log('');
    console.log('🔧 Políticas sugeridas:');
    console.log('');
    console.log('POLICY 1 - Permitir INSERT (subir archivos):');
    console.log('- Nombre: "Allow upload for everyone"');
    console.log('- Operación: INSERT');
    console.log('- Target roles: public');
    console.log('- USING expression: true');
    console.log('- WITH CHECK expression: true');
    console.log('');
    console.log('POLICY 2 - Permitir SELECT (leer archivos):');
    console.log('- Nombre: "Allow read for everyone"');
    console.log('- Operación: SELECT');
    console.log('- Target roles: public');
    console.log('- USING expression: true');
    console.log('');
    console.log('POLICY 3 - Permitir DELETE (eliminar archivos):');
    console.log('- Nombre: "Allow delete for everyone"');
    console.log('- Operación: DELETE');
    console.log('- Target roles: public');
    console.log('- USING expression: true');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSupabaseStorage();
