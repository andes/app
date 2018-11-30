import { IPracticasHojaTrabajo } from './IPracticaHojaTrabajo';
import { ObjectID } from 'bson';

export class IHojaTrabajo {
    id: string;
    _id: any;
    laboratorio: String;
    nombre: String;
    responsable: String;
    area: {
        id: String,
        nombre: String
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
        formato: String, // A4 | Oficio
        orientacion: String, // Horizontal | Vertical
        anchoColumnasMilimetros: Number,
        textoInferiorDerecha: String,
        textoInferiorIzquierda: String,
    };
    baja: Boolean;
    // practicas: [];
    practicas: IPracticasHojaTrabajo[];

    constructor() {
        this.area = {
            id: '',
            nombre: ''
        };
        this.protocolo = {
            imprimirPrioridad: false,
            imprimirOrigen: false,
            imprimirDiagnostico: false
        };
        this.paciente = {
            imprimirApellidoNombre: false,
            imprimirEdad: false,
            imprimirSexo: false,
            cantidadLineaAdicional: 0
        };
        this.papel = {
            formato: 'A4', // A4 | Oficio
            orientacion: 'Horizontal', // Horizontal | Vertical
            anchoColumnasMilimetros: 0,
            textoInferiorDerecha: '',
            textoInferiorIzquierda: '',
        };
        this.baja = false;


        // HARDCODEEEE.,...............
        // this.area = {
        //     nombre: 'QUIMICA CLINICA',
        //     conceptoSnomed: {
        //         'fsn': 'servicio de bioquímica clínica (calificador)',
        //         'term': 'servicio de bioquímica clínica',
        //         'conceptId': '310076001',
        //         'semanticTag': 'calificador'
        //     }
        // };

        this.laboratorio = new ObjectID();
        this.responsable = new ObjectID();
        this.practicas = [];
    }
}
