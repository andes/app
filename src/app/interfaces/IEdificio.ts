import { IContacto } from './IContacto';
import { IDireccion } from './IDireccion';

export interface IEdificio {
    id: String;
    descripcion: String;
    contacto: IContacto;
    direccion: IDireccion;
}
