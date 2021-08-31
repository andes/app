import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { ISectores } from '../../../../interfaces/IOrganizacion';

export interface ISalaComun {
    id: String;
    nombre: string;
    organizacion: {
        id: String;
        nombre: String;
    };
    capacidad?: number;
    ambito: string;
    unidadOrganizativas: ISnomedConcept[];
    sectores: ISectores[];
    estado: string;
    lastSync?: Date;
}
