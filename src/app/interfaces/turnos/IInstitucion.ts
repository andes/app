import { IContacto } from '../IContacto';
import { IDireccion } from '../../core/mpi/interfaces/IDireccion';

export interface IInstitucion {
    id: string;
    nombre: string;
    detalle: string;
    tipo: string;
    contacto: IContacto;
    direccion: IDireccion;
    activo: boolean;
    estado: string;
}
