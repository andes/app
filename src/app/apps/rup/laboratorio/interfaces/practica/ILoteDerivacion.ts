import { IItemLoteDerivacion } from './IItemLoteDerivacion';
export interface ILoteDerivacion {
    id?: string;
    numero?: string;
    fecha?: Date;
    laboratorioOrigen: {
        nombre: string,
        id: string
    };
    laboratorioDestino?: {
        nombre: string,
        id: string
    };
    estados: [{
        tipo: String
    }];
    itemsLoteDerivacion: IItemLoteDerivacion[];
    usuarioResponsablePreparacion?: String;
    usuarioEntrega?: String;
}
