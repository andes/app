import { ISnomedConcept } from './../../../../modules/rup/interfaces/snomed-concept.interface';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

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
    esMovimiento: Boolean;
}
