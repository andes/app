import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { MapaCamaListadoColumns } from './mapa-camas.internface';

export interface IMaquinaEstados {
    id: string;
    organizacion: string;
    ambito: string;
    capa: string;
    estados: IMAQEstado[];
    relaciones: IMAQRelacion[];
    columns: MapaCamaListadoColumns;
    ingresos: { [key: string]: string };
    turnero: { [key: string]: string };
    historialMedico?: boolean;
    listadoInternacion: boolean;
    configPases: {
        sala: string;
        allowCama: boolean;
    };
}

export interface IMAQEstado {
    key: string;
    label: string;
    color: string;
    icon: string;
    acciones: {
        label: string;
        tipo: string;
        parametros: {
            concepto?: ISnomedConcept;
            unidadOrganizativa?: string[];
        };
    }[];
    checkRupTiposPrestacion: boolean;
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
        }];
    }];
}
