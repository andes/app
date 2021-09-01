import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';

export interface ICama {
    id: String;
    nombre: String;
    organizacion: {
        id: String;
        nombre: String;
    };
    ambito: String;
    unidadOrganizativaOriginal: ISnomedConcept;
    sectores: [{
        tipoSector: ISnomedConcept;
        unidadConcept: ISnomedConcept;
        nombre: String;
    }];
    tipoCama: ISnomedConcept;
    equipamiento: [ISnomedConcept];
}
