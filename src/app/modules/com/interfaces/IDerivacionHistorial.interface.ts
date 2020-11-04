export interface IDerivacionHistorial {
    estado: String;
    organizacionDestino: {
        id: String
        nombre: String
    };
    observacion: String;
    adjuntos: any;
    eliminado: Boolean;
}
