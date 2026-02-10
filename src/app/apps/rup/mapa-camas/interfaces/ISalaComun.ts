import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { ISectores } from '../../../../interfaces/IOrganizacion';

export interface ISalaComun {
    id: string;
    nombre: string;
    organizacion: {
        id: string;
        nombre: string;
    };
    capacidad?: number;
    ambito: string;
    unidadOrganizativas: ISnomedConcept[];
    sectores: ISectores[];
    estado: string;
    lastSync?: Date;
}
