// Sube archivos y elimínalos de Supabase Storage

import { supabase } from '@/lib/supabase';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'reuniones';

// Upload file using standard upload
export async function subirArchivo(file, orgID) {
  try {
    // Verificar conectividad de Supabase
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('Error checking Supabase connectivity:', bucketError);
      throw new Error(`Supabase connection failed: ${bucketError.message}`);
    }
    
    console.log('Available buckets:', buckets);
    
    const filePath = `${orgID}/${file.name}`;
    
    const { data, error } = await supabase
      .storage.from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    console.log('File uploaded successfully:', data);
    
    // Obtener la URL pública del archivo
    const { data: urlData } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      filename: file.name
    };
  } catch (error) {
    console.error('Error in subirArchivo:', error);
    throw error;
  }
}

// Upload multiple files and return their filenames
export async function subirArchivos(files, orgID) {
  const uploadPromises = files.map(file => subirArchivo(file, orgID));
  
  try {
    const results = await Promise.all(uploadPromises);
    return results.map(result => result.filename);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}

// Delete file from storage
export async function eliminarArchivo(filename, orgID) {
  const { error } = await supabase
    .storage.from(BUCKET_NAME).remove([`${orgID}/${filename}`]);

  if (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  } else {
    console.log('File deleted successfully');
  }
}