import { IDireccion } from './../IDireccion';
import { IContacto } from './../IContacto';
export interface IEspacioFisico {
    id: string;
    nombre: String;
    descripcion: String;
    detalle: String;
    organizacion: {
        id: String,
        nombre: String
    };
    edificio: {
        id: String,
        descripcion: String,
        contacto: IContacto,
        direccion: IDireccion,
    };
    sector: {
        id: String,
        nombre: String
    };
    servicio: {
        id: String,
        nombre: String
    };
    activo: Boolean;
}
