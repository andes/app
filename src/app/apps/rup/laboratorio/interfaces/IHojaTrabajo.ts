import { IPractica } from './../../../../interfaces/laboratorio/IPractica';

export interface IHojaTrabajo {
    id: string;
    _id: any;
    laboratorio: String;
    nombre: String;
    responsable: String;
    area: {
        nombre: {
            type: String,
        },
        conceptoSnomed: {
            fsn: string,
            term: string,
            conceptId: string,
            semanticTag: string
        }
    };
    protocolo: {
        imprimirPrioridad: Boolean,
        imprimirOrigen: Boolean,
        imprimirDiagnostico: Boolean
    };
    paciente: {
        imprimirApellidoNombre: Boolean,
        imprimirEdad: Boolean,
        imprimirSexo: Boolean,
        cantidadLineaAdicional: Number
    };
    papel: {
        formato: Number, // A4 | Oficio
        orientacion: Boolean, // Horizontal | Vertical
        anchoColumnasMilimetros: Number,
        textoInferiorDerecha: String,
        textoInferiorIzquierda: String,
    };
    baja: Boolean;
    practicas: [{ nombre: String, practica: { type: IPractica } }];
}
