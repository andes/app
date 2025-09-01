export interface IDerivacionHistorial {
    estado: string;
    organizacionDestino: {
        id: string;
        nombre: string;
    };
    observacion: string;
    adjuntos: any;
    eliminado: boolean;
}
