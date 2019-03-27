
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

export interface IPacienteMatch {
    id: String;
    paciente: IPaciente;
    match: number;
}
