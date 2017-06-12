import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'paciente' })
export class PacientePipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let fullName;
        if (value.alias) {
            fullName = value.apellido + ', ' + value.alias;
        } else {
            fullName = value.apellido + ', ' + value.nombre;
        }

        return fullName;
    }
}
