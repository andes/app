import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'patient'})
export class patientPipe implements PipeTransform {
  transform(value: any, args: string[]): any {
    if (value.alias) {
        return value.apellido + ' ' + value.alias;
    }
    else {
        return value.apellido + ' ' + value.nombre;
    }
  }
}
