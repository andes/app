import { Pipe, PipeTransform } from '@angular/core';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';

@Pipe({
    name: 'semanticIcon'
})
export class SemanticIconPipe implements PipeTransform {
    transform(registro: any, esSolicitud: boolean = false): any {
        if (registro.concepto) {
            return getCSSIcon(registro.concepto, registro.esSolicitud);
        } else {
            return getCSSIcon(registro, esSolicitud);
        }
    }
}

export function getCSSIcon(concepto: ISnomedConcept, esSolicitud: boolean = false) {
    if (esSolicitud) {
        return 'adi-mano-corazon';
    } else {
        switch (concepto.semanticTag) {
        case 'hallazgo':
        case 'evento':
        case 'situación':
            return 'adi-lupa-ojo';

        case 'trastorno':
            return 'adi-trastorno';

        case 'procedimiento':
        case 'entidad observable':
        case 'régimen/tratamiento':
            return 'adi-termometro';

        case 'producto':
        case 'objeto físico':
        case 'medicamento clínico':
        case 'fármaco de uso clínico':
            return 'adi-pildoras';

        case 'elemento de registro':
            return 'adi-documento-lapiz';
        default:
            // No debería
            return concepto.semanticTag;
        }
    }
}
