import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';

export interface IMaquinaEstados {
    id: string;
    organizacion: string;
    ambito: string;
    capa: string;
    estados: IMAQEstado[];
    relaciones: IMAQRelacion[];
}

export interface IMAQEstado {
    key: string;
    label: string;
    color: string;
    icon: string;
    acciones: {
        label: string,
        tipo: string,
        parametros: {
            concepto?: ISnomedConcept,
            unidadOrganizativa?: string[],
        }
    }[];
}

export interface IMAQRelacion {
    nombre: string;
    origen: string;
    destino: string;
    color: string;
    icon: string;
    accion: string;
    parametros?: [{
        label: string;
        options?: [{
            nombre: string;
        }]
    }];
}
