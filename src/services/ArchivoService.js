// Sube archivos y elimínalos de Supabase Storage

import { supabase } from '@/lib/supabase';
import { env } from 'process';

const BUCKET_NAME = env.SUPABASE_BUCKET_NAME;

// Upload file using standard upload
export async function subirArchivo(file, reunionID) {
  const { data, error } = await supabase
    .storage.from(BUCKET_NAME).upload(`${reunionID}/${file.name}`, file)

  if (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  } else {
    console.log('File uploaded successfully:', data);
    return data;
    // returned data example:
    // {
    //   fullPath: "bucket-name/meetingID/filename.ext"
    //   id: "d478600d-02f6-4aca-9a16-eae023318bad"
    //   path: "meetingID/filename.ext"
    // }
  }
}

// Delete file from storage
export async function eliminarArchivo(filename, reunionID) {
  const { error } = await supabase
    .storage.from(BUCKET_NAME).remove([`${reunionID}/${filename}`]);

  if (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  } else {
    console.log('File deleted successfully');
  }
}