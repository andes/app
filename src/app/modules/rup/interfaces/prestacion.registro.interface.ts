import { IElementoRUP, IElementoRUPRequeridos } from './elementoRUP.interface';
import { ISnomedConcept } from './snomed-concept.interface';
import { ObjectID } from 'bson';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IPrestacion } from './prestacion.interface';

export class IRegistroPrivacy {
    scope: string;
}

export class IPrestacionRegistro {
    id: string;
    idPrestacion: string;
    elementoRUP: string;
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
    registros: IPrestacionRegistro[];
    // Indica los id de otros registros dentro array 'registros' de la prestación
    relacionadoCon: any[];

    esDiagnosticoPrincipal: Boolean;

    isEmpty: Boolean;

    privacy: IRegistroPrivacy;

    solicitud: any;

    evoluciones: any;
    transformado: any;
    esPrimeraVez: boolean;

    hasSections: Boolean;
    isSection: Boolean;
    noIndex: Boolean;

    createdAt: Date;

    // Virtuales 🤷
    paciente: IPaciente;

    constructor(elementoRUP: IElementoRUP, snomedConcept: ISnomedConcept, prestacion?: IPrestacion) {
        this.id = (new ObjectID()).toString();
        this.elementoRUP = elementoRUP ? elementoRUP.id : null;
        this.nombre = snomedConcept.term;
        this.concepto = snomedConcept;
        this.destacado = false;
        this.esSolicitud = false;
        this.valor = null;
        this.relacionadoCon = [];
        this.registros = [];
        this.hasSections = false;
        this.isSection = false;
        this.noIndex = false;
        if (elementoRUP && elementoRUP.requeridos) {
            elementoRUP.requeridos.forEach((item) => {
                const canAdd = this.checkSexRule(prestacion, item);
                if (canAdd) {
                    this.registros.push(new IPrestacionRegistro(item.elementoRUP, item.concepto, prestacion));
                }
            });
        }

    }

    private checkSexRule(prestacion: IPrestacion, requerido: IElementoRUPRequeridos) {
        const sexo = prestacion && prestacion.paciente && prestacion.paciente.sexo;
        const sexoFilter = requerido && requerido.sexo;
        return !sexo || !sexoFilter || sexo === sexoFilter;
    }
}
