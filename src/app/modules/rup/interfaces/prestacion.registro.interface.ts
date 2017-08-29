import { ISnomedConcept } from './snomed-concept.interface';

export interface IPrestacionRegistro {
    id: string;
    // Indica el nombre del registro, calculado por el elementoRUP.
    // Ejemplo: 'Prescripción de novalgina'
    nombre: string;
    concepto: ISnomedConcept;
    // Indica si este registro está destacado
    destacado: Boolean;
    // Indica si este registro es una solicitud
    esSolicitud: Boolean;
    // Almacena el valor del átomo, molécula o fórmula.
    // Para el caso de las moléculas, el valor puede ser nulo.
    valor: any;
    // Almacena los registros de los átomos asociados a la molécula
    registros: [IPrestacionRegistro];
    // Indica los id de otros registros dentro array 'registros' de la prestación
    relacionadoCon: [string];
};
