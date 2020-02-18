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
}

export interface IMAQRelacion {
    origen: String;
    destino: String;
    color: String;
    icon: String;
    accion: String;
}
