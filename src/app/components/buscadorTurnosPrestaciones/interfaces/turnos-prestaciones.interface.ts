import { IFinanciador } from '../../../interfaces/IFinanciador';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import { IProfesional } from '../../../interfaces/IProfesional';
import { ITurno } from '../../../interfaces/turnos/ITurno';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

export interface ITurnosPrestaciones {
    fecha: Date;
    paciente: IPaciente;
    financiador: any; // TODO: cuando suba la interface de financiador (Pendiente PR)
    prestacion: ITipoPrestacion;
    profesionales: IProfesional[];
    estado: String;
    idAgenda: String;
    idBloque: String;
    turno: ITurno;
    idPrestacion: String;
}
