import { ISnomedConcept } from './snomed-concept.interface';
import { IPaciente } from '../../../interfaces/IPaciente';
import { ICamaEstado } from './ICamaEstado';

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
    equipamiento: [ISnomedConcept]; // oxigeno / bomba / etc
    // ultimo estado de la cama
    ultimoEstado: ICamaEstado;
    estados: [ICamaEstado];
}

