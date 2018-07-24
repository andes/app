import { IPacienteMatch } from './IPacienteMatch.inteface';

export interface PacienteBuscarResultado {
    err: any;
    pacientes: IPacienteMatch[];
}
