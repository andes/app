import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'paciente', pure: false })
// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
export class PacientePipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        if (!value) {
            return null;
        } else if (value.alias) {
            return value.apellido + ', ' + value.alias;
        } else {
            return value.apellido + ', ' + value.nombre;
        }
    }
}
