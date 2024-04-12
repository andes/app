import { IUbicacion } from '../../../interfaces/IUbicacion';

export interface IDireccion {
    valor: String;
    codigoPostal: String;
    ubicacion: IUbicacion;
    ranking: Number;
    geoReferencia: [Number, Number];
    ultimaActualizacion: Date;
    activo: Boolean;
    situacionCalle?: boolean;
}
