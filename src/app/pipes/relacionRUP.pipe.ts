import { Pipe, PipeTransform } from '@angular/core';

/**
 * Devuelve la descripción de una parte de una pieza dental, o una pieza dental completa
 */
@Pipe({ name: 'relacionRUP' })
export class RelacionRUPPipe implements PipeTransform {
    transform(relacion: { concepto: { term: any }, cara: any }, args: any[]): string {
        if (relacion.cara) {
            return 'diente ' + relacion.concepto.term + ' (' + (relacion.cara !== 'pieza' ? 'cara ' + relacion.cara : relacion.cara + ' completa') + ')';
        } else if (relacion.concepto?.term) {
            return relacion.concepto.term;
        }
        return '';
    }
}
