import { IPaciente } from '../../core/mpi/interfaces/IPaciente';

export interface IListaMatcheo {
    paciente: IPaciente;
    matcheos: {
        entidad: String;
        matcheo: Number;
    };

}
