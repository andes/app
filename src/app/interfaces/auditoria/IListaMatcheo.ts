import { IPaciente } from '../IPaciente';

export interface IListaMatcheo {
    paciente: IPaciente;
    matcheos: {
        entidad: String,
        matcheo: Number
    };

}
