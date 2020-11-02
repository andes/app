import { SemanticTag } from './semantic-tag.type';
import { ISnomedConcept } from './snomed-concept.interface';
import { IProfesional } from './../../../interfaces/IProfesional';

export interface IFrecuentesProfesional {
    concepto: ISnomedConcept;
    esSolicitud?: boolean;
    frecuencia: Number;
}
