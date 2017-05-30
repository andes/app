import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'fullNameProfesional' })
export class ProfesionalFullNamePipe implements PipeTransform {
    transform(value: any, args?: string[]): any {

        let fullName;
        fullName = value.apellido + ' ' + value.nombre;

        if (args && args[0]) {
            fullName = fullName.toUpperCase();
        }
        return fullName;
    }
}
