export interface IMaquinaEstados {
    id: String;
    organizacion: String;
    ambito: String;
    capa: String;
    estados: [{
        key: String;
        label: String;
        color: String;
        icon: String;
    }];
    relaciones: [{
        origen: String;
        destino: String;
        color: String;
        icon: String;
        accion: String;
    }];
}


