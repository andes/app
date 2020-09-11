import { Pipe, PipeTransform } from '@angular/core';

/**
 * Toma cualquier array de objetos y los imprime separados
 * Ejemplos:
 * 1. Tipos de Prestaciones: {{ tipoPrestacion | enumerar:['term'] }}       ==> prestación 1 - prestación 2 - ...
 * 2. Profesionales: {{ profesionales | enumerar:['apellido','nombre'] }}   ==> apellido 1, nombre 1 - apeliido 2, nombre 2 - ...
 * 2. Profesionales: {{ profesionales | enumerar:['apellido','nombre']:'/' }}   ==> apellido 1, nombre 1 / apeliido 2, nombre 2 / ...
 */
@Pipe({ name: 'enumerar' })
export class EnumerarPipe implements PipeTransform {
    transform(values: any[], args: any[], itemSeparator: string = '-', fieldSeparator: string = ','): string {
        return values.map((value) => {
            return args.map((key, i) => {
                return value[String(args[i])];
            }).join(`${fieldSeparator} `); // Separa valores dentro del mismo objeto con coma
        }).join(` ${itemSeparator} `); // Separa objetos con un guión (default)
    }
}
