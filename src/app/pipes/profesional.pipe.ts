import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'profesional' })
export class ProfesionalPipe implements PipeTransform {
    transform(value: any, args?: string[]): any {
        return value.apellido + ', ' + value.nombre;
    }
}
