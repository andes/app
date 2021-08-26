import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'checkEdit'
})
export class CheckEditPipe implements PipeTransform {

    transform(ficha: any, organizaciones: any): any {
        return (organizaciones.some(org => org.id === ficha.secciones[0].fields[0].organizacion?.id));
    }
}
