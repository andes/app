import { IPrestacionRegistro } from '../../../../../modules/rup/interfaces/prestacion.registro.interface';
export interface IItemLoteDerivacion {
    idPrestacion: String;
    numeroProtocolo: String;
    fechaSolicitud?: Date;
    paciente: {
        id: string,
        documento: String,
        apellido: String,
        nombre: String,
        sexo: String
    };
    registros: IPrestacionRegistro[];
}
