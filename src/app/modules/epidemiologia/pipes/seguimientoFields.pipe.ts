import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'seguimientoFields'
})
export class SeguimientoFieldsPipe implements PipeTransform {
    transform(seguimiento: any): any {
        let prioridad;
        const score = seguimiento.score?.value;

        if (score >= 9) {
            prioridad = 'alta';
        } else if (score >= 5) {
            prioridad = 'media';
        } else {
            prioridad = 'baja';
        }
        const ultimaInterccion = seguimiento.ultimoEstado ? moment().diff(moment(seguimiento.ultimoEstado.valor), 'days') : 0;
        const alarma = score === 10 ? `Último llamado hace ${ultimaInterccion} días.` : false;
        const seguimientoFields = { alarma };
        return seguimientoFields;
    }
}
