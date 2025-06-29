import { PersonaModel, IPersona } from '@/models/Persona';
import { CrearPersonaDTO, PersonaResponseDTO } from '@/types/PersonaDTO';
import { connectToDatabase } from '@/lib/mongodb';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export interface IPersonaDAO {
  crearPersona(persona: CrearPersonaDTO): Promise<IPersona>;
  buscarPorCorreo(correo: string): Promise<IPersona | null>;
  buscarPorId(id: string): Promise<IPersona | null>;
  actualizarPersona(id: string, persona: Partial<CrearPersonaDTO>): Promise<IPersona | null>;
  actualizarContrasena(id: string, contrasena: string): Promise<void>;
  actualizarToken(id: string, token: string, expires: Date): Promise<void>;
  buscarPorResetToken(token: string): Promise<IPersona | null>;
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

  async buscarPorId(id: string): Promise<IPersona | null> {
    await connectToDatabase();
    return await PersonaModel.findById(id).exec();
  }

  async actualizarPersona(id: string, personaData: Partial<CrearPersonaDTO>): Promise<IPersona | null> {
    await connectToDatabase();
    return await PersonaModel.findByIdAndUpdate(id, personaData, { new: true }).exec();
  }

  async actualizarContrasena(id: string, contrasena: string): Promise<void> {
    await connectToDatabase();
    await PersonaModel.findByIdAndUpdate(id, {
      contrasena,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    }).exec();
  }

  async actualizarToken(id: string, token: string, expires: Date): Promise<void> {
    await connectToDatabase();
    await PersonaModel.findByIdAndUpdate(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    }).exec();
  }

  async buscarPorResetToken(token: string): Promise<IPersona | null> {
    await connectToDatabase();
    return await PersonaModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).exec();
  }
}