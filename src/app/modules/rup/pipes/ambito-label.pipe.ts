import { Pipe, PipeTransform } from '@angular/core';
import { AMBITOS_ORIGEN } from '../interfaces/prestacion.interface';

/**
 * Etiqueta legible de un valor de ámbito / procedencia ('internacion' -> 'Internación').
 * Si el valor no es conocido, lo devuelve tal cual.
 */
@Pipe({
    name: 'ambitoLabel'
})
export class AmbitoLabelPipe implements PipeTransform {
    transform(valor: string): string {
        return AMBITOS_ORIGEN.find(opcion => opcion.id === valor)?.nombre || valor;
    }
}
