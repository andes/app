import { ISnomedConcept } from './snomed-concept.interface';

export interface IFrecuentesProfesional {
    concepto: ISnomedConcept;
    esSolicitud?: boolean;
    frecuencia: number;
}
