import { IContacto } from './IContacto';
import { IDireccion } from '../core/mpi/interfaces/IDireccion';

export interface IEdificio {
    id: String;
    descripcion: String;
    contacto: IContacto;
    direccion: IDireccion;
}
