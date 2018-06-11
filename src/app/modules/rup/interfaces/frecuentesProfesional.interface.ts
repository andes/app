import { SemanticTag } from './semantic-tag.type';
import { ISnomedConcept } from './snomed-concept.interface';
import { IProfesional } from './../../../interfaces/IProfesional';

export interface IFrecuentesProfesional {
    profesional: {
        id: any,
        nombre: any,
        apellido: any,
        documento: any
    };
    frecuentes: [{
        concepto: ISnomedConcept,
        frecuencia: Number
    }];
};
