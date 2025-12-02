import { IUbicacion } from '../../../interfaces/IUbicacion';

export interface IDireccion {
    valor: string;
    codigoPostal: string;
    ubicacion: IUbicacion;
    ranking: number;
    geoReferencia: [number, number];
    ultimaActualizacion: Date;
    activo: boolean;
    situacionCalle?: boolean;
}
