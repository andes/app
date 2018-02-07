import { ISnomedConcept } from './../modules/rup/interfaces/snomed-concept.interface';
import { IPaciente } from './IPaciente';
import { ICamaEstado } from './ICamaEstado';

export interface ICama {
    id: String;
    organizacion: {
        id: String,
        nombre: String
    };
    sector: String;
    habitacion: String;
    numero: String;
    esCensable: Boolean;
    unidadOrganizativa: [ISnomedConcept];
    tipoCama: ISnomedConcept;
    equipamiento: [ISnomedConcept]; // oxigeno / bomba / etc
    // ultimo estado de la cama
    ultimoEstado: ICamaEstado;
    estados: [ICamaEstado];
}

