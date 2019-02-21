import { ICamaEstado } from './ICamaEstado';
import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';

export interface ICama {
    id: String;
    organizacion: {
        id: String,
        nombre: String
    };
    sectores: [{
        tipoSector: ISnomedConcept;
        unidadConcept?: ISnomedConcept;
        nombre: String;
    }];
    unidadOrganizativaOriginal: ISnomedConcept;
    nombre: String;
    tipoCama: ISnomedConcept;
    observaciones: String;
    equipamiento: [ISnomedConcept]; // oxigeno / bomba / etc
    // ultimo estado de la cama
    ultimoEstado: ICamaEstado;
    estados: [ICamaEstado];
}

