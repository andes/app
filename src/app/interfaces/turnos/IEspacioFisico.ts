import { IDireccion } from './../IDireccion';
import { IContacto } from './../IContacto';
export interface IEspacioFisico {
    id: string;
    nombre: String;
    descripcion: String;
    edificio: {
        id: String,
        descripcion: String,
        contacto: IContacto,
        direccion: IDireccion
    };
    detalle: String;
    activo: Boolean;
}
