import { PersonaModel, IPersona } from '@/models/Persona';
import { CrearPersonaDTO } from '@/types/PersonaDTO';
import { connectToDatabase } from '@/lib/mongodb';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export interface IPersonaDAO {
  crearPersona(persona: CrearPersonaDTO): Promise<IPersona>;
  buscarPorCorreo(correo: string): Promise<IPersona | null>;
  actualizarPersona(id: string, persona: Partial<CrearPersonaDTO>): Promise<IPersona | null>;
}

/*
Esta clase implementa la interfaz IPersonaDAO y proporciona
la lógica para interactuar con la base de datos MongoDB
a través del modelo PersonaModel.
*/

export class PersonaDAOImpl implements IPersonaDAO {
  async crearPersona(personaData: CrearPersonaDTO): Promise<IPersona> {
    await connectToDatabase();
    
    const persona = new PersonaModel(personaData);
    return await persona.save();
  }

  async buscarPorCorreo(correo: string): Promise<IPersona | null> {
    await connectToDatabase();
    return await PersonaModel.findOne({ correo, isActive: true }).exec();
  }

  async actualizarPersona(id: string, personaData: Partial<CrearPersonaDTO>): Promise<IPersona | null> {
    await connectToDatabase();
    return await PersonaModel.findByIdAndUpdate(id, personaData, { new: true }).exec();
  }
}