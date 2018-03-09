import { IPaciente } from './IPaciente';
import { ISnomedConcept } from '../modules/rup/interfaces/snomed-concept.interface';

export interface ICamaEstado {
    fechas: Date;
    estado: String;
    paciente: IPaciente;
    idInternacion: String;
    observaciones: String;
    unidadOrganizativa: ISnomedConcept;
    especialidades: ISnomedConcept[];
    esCensable: Boolean;
    genero: ISnomedConcept;
};
