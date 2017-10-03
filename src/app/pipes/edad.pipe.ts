import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'edad', pure: false })
// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
export class EdadPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difD: any;
        let difHs: any;
        let difMn: any;

        fechaNac = moment(value.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'años'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'meses'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'días'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'horas'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minutos'
            };
        }

        return (String(edad.valor) + ' ' + edad.unidad);
    }
}

