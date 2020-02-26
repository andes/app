import { IModuloAndes } from './IModuloAndes.interface';

export interface IRegistroNovedades {
    _id?: string;
    titulo: string;
    fecha: Date;
    descripcion: string;
    modulo: IModuloAndes;
    imagenes?: File[];
    activa: boolean;
}
