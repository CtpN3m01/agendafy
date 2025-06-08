import { OrganizacionModel, IOrganizacion } from '@/models/Organizacion';
import { CrearOrganizacionDTO, OrganizacionResponseDTO, ActualizarOrganizacionDTO } from '@/types/OrganizacionDTO';
import { connectToDatabase } from '@/lib/mongodb';

export interface IOrganizacionDAO {
  crearOrganizacion(organizacion: CrearOrganizacionDTO): Promise<OrganizacionResponseDTO>;
  buscarPorId(id: string): Promise<OrganizacionResponseDTO | null>;
  buscarPorUsuario(usuarioId: string): Promise<OrganizacionResponseDTO[]>;
  buscarPorNombre(nombre: string): Promise<IOrganizacion | null>;
  buscarPorCorreo(correo: string): Promise<IOrganizacion | null>;
  actualizarOrganizacion(id: string, datos: ActualizarOrganizacionDTO): Promise<OrganizacionResponseDTO | null>;
  eliminarOrganizacion(id: string): Promise<boolean>;
  agregarMiembro(organizacionId: string, personaId: string): Promise<void>;
  removerMiembro(organizacionId: string, personaId: string): Promise<void>;
  agregarReunion(organizacionId: string, reunionId: string): Promise<void>;
}

export class OrganizacionDAOImpl implements IOrganizacionDAO {
  async crearOrganizacion(organizacionData: CrearOrganizacionDTO): Promise<OrganizacionResponseDTO> {
    await connectToDatabase();
    
    const organizacion = new OrganizacionModel({
      nombre: organizacionData.nombre,
      correo: organizacionData.correo,
      telefono: organizacionData.telefono,
      direccion: organizacionData.direccion,
      foto: organizacionData.foto,
      usuario: organizacionData.usuarioId
    });

    const savedOrganizacion = await organizacion.save();
    await savedOrganizacion.populate([
      { path: 'usuario', select: 'nombre correo' },
      { path: 'miembros', select: 'nombre apellidos correo rol' },
      { path: 'reuniones', select: 'titulo hora_inicio' }
    ]);
    
    return this.mapearAResponse(savedOrganizacion);
  }

  async buscarPorId(id: string): Promise<OrganizacionResponseDTO | null> {
    await connectToDatabase();
    const organizacion = await OrganizacionModel.findById(id)
      .populate('usuario', 'nombre correo')
      .populate('miembros', 'nombre apellidos correo rol')
      .populate('reuniones', 'titulo hora_inicio')
      .exec();
    
    return organizacion ? this.mapearAResponse(organizacion) : null;
  }

  async buscarPorUsuario(usuarioId: string): Promise<OrganizacionResponseDTO[]> {
    await connectToDatabase();
    const organizaciones = await OrganizacionModel.find({ 
      usuario: usuarioId,
      isActive: true 
    })
    .populate('usuario', 'nombre correo')
    .populate('miembros', 'nombre apellidos correo rol')
    .populate('reuniones', 'titulo hora_inicio')
    .exec();
    
    return organizaciones.map(org => this.mapearAResponse(org));
  }

  async buscarPorNombre(nombre: string): Promise<IOrganizacion | null> {
    await connectToDatabase();
    return await OrganizacionModel.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
      isActive: true 
    }).exec();
  }

  async buscarPorCorreo(correo: string): Promise<IOrganizacion | null> {
    await connectToDatabase();
    return await OrganizacionModel.findOne({ 
      correo: correo.toLowerCase(),
      isActive: true 
    }).exec();
  }

  async actualizarOrganizacion(id: string, datos: ActualizarOrganizacionDTO): Promise<OrganizacionResponseDTO | null> {
    await connectToDatabase();
    const organizacion = await OrganizacionModel.findByIdAndUpdate(
      id, 
      datos, 
      { new: true }
    )
    .populate('usuario', 'nombre correo')
    .populate('miembros', 'nombre apellidos correo rol')
    .populate('reuniones', 'titulo hora_inicio')
    .exec();
    
    return organizacion ? this.mapearAResponse(organizacion) : null;
  }

  async eliminarOrganizacion(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await OrganizacionModel.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    ).exec();
    
    return !!result;
  }

  async agregarMiembro(organizacionId: string, personaId: string): Promise<void> {
    await connectToDatabase();
    await OrganizacionModel.findByIdAndUpdate(
      organizacionId,
      { $addToSet: { miembros: personaId } }
    ).exec();
  }

  async removerMiembro(organizacionId: string, personaId: string): Promise<void> {
    await connectToDatabase();
    await OrganizacionModel.findByIdAndUpdate(
      organizacionId,
      { $pull: { miembros: personaId } }
    ).exec();
  }

  async agregarReunion(organizacionId: string, reunionId: string): Promise<void> {
    await connectToDatabase();
    await OrganizacionModel.findByIdAndUpdate(
      organizacionId,
      { $addToSet: { reuniones: reunionId } }
    ).exec();
  }

  private mapearAResponse(organizacion: any): OrganizacionResponseDTO {
    return {
      id: organizacion._id.toString(),
      nombre: organizacion.nombre,
      correo: organizacion.correo,
      telefono: organizacion.telefono,
      direccion: organizacion.direccion,
      foto: organizacion.foto,
      usuario: {
        id: organizacion.usuario._id?.toString() || organizacion.usuario,
        nombre: organizacion.usuario.nombre || '',
        correo: organizacion.usuario.correo || ''
      },
      miembros: organizacion.miembros?.map((miembro: any) => ({
        id: miembro._id?.toString() || miembro,
        nombre: miembro.nombre || '',
        apellidos: miembro.apellidos || '',
        correo: miembro.correo || '',
        rol: miembro.rol || ''
      })) || [],
      reuniones: organizacion.reuniones?.map((reunion: any) => ({
        id: reunion._id?.toString() || reunion,
        titulo: reunion.titulo || '',
        fecha: reunion.hora_inicio || new Date()
      })) || [],
      createdAt: organizacion.createdAt,
      updatedAt: organizacion.updatedAt
    };
  }
}