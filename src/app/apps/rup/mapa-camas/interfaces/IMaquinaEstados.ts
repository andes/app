import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';

export interface IMaquinaEstados {
    id: String;
    organizacion: String;
    ambito: String;
    capa: String;
    estados: IMAQEstado[];
    relaciones: IMAQRelacion[];
}

export interface IMAQEstado {
    key: String;
    label: String;
    color: String;
    icon: String;
    acciones: {
        label: String,
        tipo: String,
        parametros: {
            concepto?: ISnomedConcept
        }
    }[];
}

export interface IMAQRelacion {
    nombre: String;
    origen: String;
    destino: String;
    color: String;
    icon: String;
    accion: String;
    parametros?: [{
        label: String;
        options?: [{
            nombre: String;
        }]
    }];
}
