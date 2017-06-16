import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difHs: any;
        let difD: any;

        fechaNac = moment(value.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas

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
        }
        return (edad.valor + ' ' + edad.unidad);
    }
}

