'use client';

import { v4 as uuidv4 } from 'uuid';
import { useState, useMemo } from 'react';
import { subirArchivo } from '@/services/subirArchivo';

export default function ReunionesForm() {
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/reuniones/";
  const reunionID = useMemo(() => uuidv4(), []); // Generate a unique ID for the meeting

  type FormState = {
    _id: string;
    titulo: string;
    organizacion: string;
    hora_inicio: string;
    hora_fin: string;
    lugar: string;
    tipo_reunion: string;
    modalidad: string;
    convocados: string[];
    archivos: string[];
  };

  const [form, setForm] = useState<FormState>({
    _id: reunionID, 
    titulo: '',
    organizacion: '',
    hora_inicio: '',
    hora_fin: '',
    lugar: '',
    tipo_reunion: 'Ordinaria',
    modalidad: 'Presencial',
    convocados: [], // Can be multiple
    archivos: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConvocadoChange = (index: number, value: string) => {
    const updated = [...form.convocados];
    updated[index] = value;
    setForm({ ...form, convocados: updated });
  };

  const addConvocado = () => {
    setForm({ ...form, convocados: [...form.convocados, ''] });
  };

  const subirArchivoHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await subirArchivo(files[i], reunionID); // <- your upload service
        uploadedUrls.push(url.path);
      }
      setForm(prev => ({ ...prev, archivos: [...prev.archivos, ...uploadedUrls] }));
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('No se pudo subir el archivo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos a enviar:', form);
    // Aquí puedes hacer POST al backend
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Crear Reunión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" type="text" name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
        <input className="input" type="text" name="organizacion" placeholder="Organización" value={form.organizacion} onChange={handleChange} required />
        <input className="input" type="datetime-local" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} required />
        <input className="input" type="datetime-local" name="hora_fin" value={form.hora_fin} onChange={handleChange} required />
        <input className="input" type="text" name="lugar" placeholder="Lugar" value={form.lugar} onChange={handleChange} required />

        <select name="tipo_reunion" value={form.tipo_reunion} onChange={handleChange} className="input">
          <option value="Ordinaria">Ordinaria</option>
          <option value="Extraordinaria">Extraordinaria</option>
        </select>

        <select name="modalidad" value={form.modalidad} onChange={handleChange} className="input">
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
        </select>

        <div>
          <label className="block font-medium mb-1">Convocados:</label>
          {form.convocados.map((convocado, index) => (
            <input
              key={index}
              className="input mb-2"
              type="text"
              value={convocado}
              placeholder={`Correo convocado #${index + 1}`}
              onChange={(e) => handleConvocadoChange(index, e.target.value)}
            />
          ))}
          <button type="button" onClick={addConvocado} className="text-blue-600 hover:underline text-sm mt-1">+ Añadir otro convocado</button>
        </div>

        <div>
          <label className="block font-medium mb-1">Subir archivo:</label>
          <input type="file" onChange={subirArchivoHandler} className="block mb-2" multiple />
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition-colors mb-2"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            Seleccionar archivo
          </button>
          <ul className="text-sm mt-2 list-disc list-inside">
            {form.archivos.map((url, idx) => (
              <li key={idx}>
                <a href={supabaseURL+url} target="_blank" className="text-blue-600 underline">{url}</a>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear Reunión</button>
      </form>
    </div>
  );
}
