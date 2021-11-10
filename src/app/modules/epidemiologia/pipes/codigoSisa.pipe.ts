import { Pipe, PipeTransform } from '@angular/core';
import { SECCION_OPERACIONES } from '../constantes';

@Pipe({
    name: 'codigoSisaField'
})
export class CodigSisaPipe implements PipeTransform {
    transform(ficha: any): any {
        return ficha.secciones.find(s => s.name === SECCION_OPERACIONES)?.fields.find(f => (f.codigoSisa ? true : false)) || { codigoSisa: null };
    }
}
