import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';

export interface ICama {
    id: string;
    nombre: string;
    organizacion: {
        id: string;
        nombre: string;
    };
    ambito: string;
    unidadOrganizativaOriginal: ISnomedConcept;
    sectores: [{
        tipoSector: ISnomedConcept;
        unidadConcept: ISnomedConcept;
        nombre: string;
    }];
    tipoCama: ISnomedConcept;
    equipamiento: [ISnomedConcept];
}
