import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
    transform(value: any, args: string[], hora = false): any {
        let fecha: any;
        console.log(hora);
        if (hora) {
            fecha = moment(value).format('DD/MM/YYYY H:m:s');
        } else {
            fecha = moment(value).format('DD/MM/YYYY');
        }
        return (fecha);
    }
}
