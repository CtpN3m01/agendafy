import { PersonaModel, IPersona } from '@/models/Persona';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class PersonaDAO {
  async create(personaData: Partial<IPersona>): Promise<IPersona> {
    const persona = new PersonaModel(personaData);
    return persona.save();
  }

  async findAll(): Promise<IPersona[]> {
    return PersonaModel.find().exec();
  }
}