import { IContacto } from './IContacto';
import { IDireccion } from '../core/mpi/interfaces/IDireccion';

export interface IEdificio {
    id: string;
    descripcion: string;
    contacto: IContacto;
    direccion: IDireccion;
}
