import { IContacto } from '../IContacto';
import { IDireccion } from '../../core/mpi/interfaces/IDireccion';

export interface IInstitucion {
    id: string;
    nombre: String;
    detalle: String;
    tipo: String;
    contacto: IContacto;
    direccion: IDireccion;
    activo: Boolean;
    estado: String;
}
