import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'codigoSisaField'
})
export class CodigSisaPipe implements PipeTransform {
    transform(ficha: any): any {
        return ficha.secciones.find(s => s.name === 'Operaciones')?.fields.find(f => (f.codigoSisa ? true : false)) || { codigoSisa: null };
    }
}
