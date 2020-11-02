import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

@Pipe({ name: 'edad', pure: false })
// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
export class EdadPipe implements PipeTransform {
    transform(value: any): any {
        const fechaLimite = value.fechaFallecimiento ? moment(value.fechaFallecimiento) : moment();
        let fechaNac: any;
        let difAnios: number;
        let difDias: number;
        let difMeses: number;
        let difHs: number;
        let difMn: number;

        fechaNac = moment(value.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaLimite.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaLimite.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaLimite.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            return `${String(difAnios)} años`;
        } else if (difMeses !== 0) {
            return `${String(difMeses)} meses`;
        } else if (difDias !== 0) {
            return `${String(difDias)} días`;
        } else if (difHs !== 0) {
            return `${String(difHs)} horas y ${difMn - (difHs * 60)} minutos`;
        } else if (difMn !== 0) {
            return `${String(difMn)} minutos`;
        }

        return '';
    }
}

