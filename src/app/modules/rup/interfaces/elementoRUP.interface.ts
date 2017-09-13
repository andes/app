import { SemanticTag } from './semantic-tag.type';
import { ISnomedConcept } from './snomed-concept.interface';

export interface IElementoRUP {
    id: string;
    // Indica si este elemento está activo
    activo: Boolean;
    // Vinculación al componente de la aplicación Angular
    componente: string;
    // Indica los semantic tags para los cuales este elemento es el registro por default
    defaultFor: SemanticTag[];
    // Tipo de elemento
    tipo: string;
    // Indica si este elementoRUP aplica a una solicitud
    esSolicitud: Boolean;
    // Indica los parámetros para instanciar el componente
    params: { [key: string]: any };
    // Indica el estilo para aplicar al componente
    style: {
        columns: number,
        cssClass: string
    };
    // Conceptos SNOMED relacionados que se muestran e implementan de la misma manera.
    // Por ejemplo: "Toma de temperatura del paciente (SCTID: 56342008)" y
    //              "Toma de temperatura rectal del paciente (SCTID: 18649001")
    //              se implementan con el mismo elemento RUP "Toma de temperatura"
    conceptos: ISnomedConcept[];
    // Elementos RUP requeridos para la ejecución.
    // Por ejemplo, en "Control de Niño sano" es obligatorio ejecutar "Toma de peso"
    requeridos: [{
        elementoRUP: IElementoRUP,
        concepto: ISnomedConcept,
        // Indica estilos para la instancia del elementoRUP
        style: {
            columns: Number,
            cssClass: String
        },
        // Indica parámetros para la instancia del elementoRUP en formato {key: value}
        params: any
    }];
    // Elementos RUP más frecuentes para la ejecución.
    // Por ejemplo, en "Consulta de medicina general" se puede sugerir ejecutar "Signos vitales"
    frecuentes: ISnomedConcept[];
};
