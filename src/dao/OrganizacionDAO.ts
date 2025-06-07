import { OrganizacionModel, IOrganizacion } from '@/models/Organizacion';

/* 
DAO es responsable de acceder a los datos de una base de datos. 
Encapsula toda la lógica para interactuar con la base de datos, 
como consultas, inserciones, actualizaciones o eliminaciones.
*/

export class OrganizacionDAO {
  async create(data: Partial<IOrganizacion>): Promise<IOrganizacion> {
    const doc = new OrganizacionModel(data);
    return doc.save();
  }

  async findAll(): Promise<IOrganizacion[]> {
    return OrganizacionModel.find().exec();
  }
}