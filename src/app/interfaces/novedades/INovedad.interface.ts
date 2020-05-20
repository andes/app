import { IModulo } from './IModulo.interface';
export interface INovedad {
    _id?: string;
    titulo: string;
    fecha: Date;
    descripcion: string;
    modulo: IModulo;
    imagenes?: File[];
    activa: boolean;
}
