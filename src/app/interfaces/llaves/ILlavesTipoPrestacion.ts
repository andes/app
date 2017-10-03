import { ILlave } from './ILlave';
import { ITipoPrestacion } from './../ITipoPrestacion';
export interface ILlavesTipoPrestacion {
    id: String;
    organizacion: {
        id: String,
        nombre: String
    };
    tipoPrestacion: ITipoPrestacion;
    llave: ILlave;
    auditable: Boolean;
    activa: Boolean;
}
