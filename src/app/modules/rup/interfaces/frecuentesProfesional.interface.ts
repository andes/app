import { ISnomedConcept } from './snomed-concept.interface';

export interface IFrecuentesProfesional {
    profesional: {
        id: any,
        nombre: any,
        apellido: any,
        documento: any
    };
    frecuentes: [{
        concepto: ISnomedConcept,
        esSolicitud?: boolean;
        frecuencia: Number
    }];
}
