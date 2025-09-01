
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

export interface IPacienteMatch {
    id: string;
    paciente: IPaciente;
    _score: number;
}
