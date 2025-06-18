import { Pipe, PipeTransform } from '@angular/core';

/**
 * Imprime el tamaño de un archivo en la unidad mas cercana. Por defecto la entrada se considera en bytes.
 */

@Pipe({ name: 'fileSize' })
export class FileSize implements PipeTransform {
    transform(value: number): String {
        const unidades = ['bytes', 'KB', 'MB'];
        let indice = 0;

        while (value >= 1024 && indice < unidades.length - 1) {
            value /= 1024;
            indice++;
        }
        // Redondear a entero si es menor que 1 MB o a dos decimales si es mayor o igual a 1
        value = indice > 1 ? Math.round(value * 100) / 100 : Math.round(value);
        return `${value} ${unidades[indice]}`;
    }
}
