import { IDireccion } from './../IDireccion';
import { IContacto } from './../IContacto';
export interface IEspacioFisico {
    id: string;
    nombre: string;
    descripcion: string;
    detalle: string;
    organizacion: {
        id: string,
        nombre: string
    };
    edificio: {
        id: string,
        descripcion: string,
        contacto: IContacto,
        direccion: IDireccion,
    };
    sector: {
        id: string,
        nombre: string
    };
    servicio: {
        id: string,
        nombre: string
    };
    equipamiento: [{
        conceptId: string;
        term: string;
        fsn: string;
        semanticTag: string;
    }];
    activo: Boolean;
}
