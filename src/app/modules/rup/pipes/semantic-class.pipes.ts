import { Pipe, PipeTransform } from '@angular/core';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';

@Pipe({
    name: 'semanticClass'
})
export class SemanticClassPipe implements PipeTransform {
    transform(registro: any, esSolicitud: boolean = false): any {
        if (registro.concepto) {
            return getSemanticClass(registro.concepto, registro.esSolicitud);
        } else {
            return getSemanticClass(registro, esSolicitud);
        }
    }
}

export function getSemanticClass(concepto: ISnomedConcept, esSolicitud: boolean = false) {
    const semantic = getSemanticTag(concepto, esSolicitud);
    switch (concepto.semanticTag) {
    case 'elemento de registro':
        return 'elementoderegistro';
    default:
        return semantic;
    }
}


export function getSemanticTag(concepto: ISnomedConcept, esSolicitud: boolean = false) {
    if (esSolicitud) {
        return 'solicitud';
    } else {
        switch (concepto.semanticTag) {
        case 'hallazgo':
        case 'evento':
        case 'situación':
            return 'hallazgo';

        case 'trastorno':
            return 'trastorno';

        case 'procedimiento':
        case 'entidad observable':
        case 'régimen/tratamiento':
            return 'procedimiento';

        case 'producto':
        case 'objeto físico':
        case 'medicamento clínico':
        case 'fármaco de uso clínico':
            return 'producto';

        case 'elemento de registro':
            return 'elemento de registro';
        default:
            // No debería
            return concepto.semanticTag;
        }
    }
}
