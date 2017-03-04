import { IUbicacion } from './IUbicacion';

export interface IDireccion {
    valor: String;
    codigoPostal: String;
    ubicacion: IUbicacion;
    ranking: Number;
    geoReferencia: [Number];
    ultimaActualizacion: Date;
    activo: Boolean;
}
