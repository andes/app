import { ITipoPrestacion } from './../ITipoPrestacion';
import { IPaciente } from './../IPaciente';
export interface IAuditoriaPrestacionPaciente {
    id: String;
    organizacion: {
        id: String,
        nombre: String
    };
    llaveTipoPrestacion: ITipoPrestacion;
    paciente: IPaciente;
    estado: String;
}
