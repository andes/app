import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

@Pipe({ name: 'edad', pure: false })
// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
export class EdadPipe implements PipeTransform {
    transform(value: any): any {
        const fechaLimite = value?.fechaFallecimiento ? moment(value?.fechaFallecimiento) : moment();
        const fechaNac = moment(value?.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        const difDias = fechaLimite.diff(fechaNac, 'd'); // Diferencia en días
        const difAnios = Math.floor(difDias / 365.25);
        const difMeses = Math.floor(difDias / 30.4375);
        const difHs = fechaLimite.diff(fechaNac, 'h'); // Diferencia en horas
        const difMn = fechaLimite.diff(fechaNac, 'm'); // Diferencia en minutos

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


export function calcularEdad(fechaNacimiento: Date, unit: 'y' | 'm' | 'd' = 'y', hasta: Date = null) {
    if (!fechaNacimiento) {
        return null;
    }

    const fechaLimite = hasta ? moment(hasta) : moment();
    const from = moment(fechaNacimiento);

    const difDias = fechaLimite.diff(from, 'd');

    switch (unit) {
        case 'y':
            return Math.floor(difDias / 365.25);
        case 'm':
            return Math.floor(difDias / 30.4375);
        case 'd':
            return Math.floor(difDias);
    }
}
