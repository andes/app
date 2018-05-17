import { IPaciente } from '../../../interfaces/IPaciente';
import { ISnomedConcept } from './snomed-concept.interface';

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
