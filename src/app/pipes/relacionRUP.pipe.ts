import { Pipe, PipeTransform } from '@angular/core';

/**
 * Devuelve la descripción de una parte de una pieza dental, o una pieza dental completa
 */
@Pipe({ name: 'relacionRUP' })
export class RelacionRUPPipe implements PipeTransform {
    transform(relacion: { concepto: { term: any }, cara: any }, args: any[]): string {
        return relacion.cara ? 'diente ' + relacion.concepto.term + ' (' +
            (relacion.cara !== 'pieza' ? 'cara ' + relacion.cara :
                relacion.cara + ' completa') + ')' : relacion.concepto.term;
    }
}
