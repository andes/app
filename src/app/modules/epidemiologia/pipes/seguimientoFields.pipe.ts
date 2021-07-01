import { Pipe, PipeTransform } from '@angular/core';
import { ColoresPrioridades } from 'src/app/utils/enumerados';

@Pipe({
    name: 'seguimientoFields'
})
export class SeguimientoFieldsPipe implements PipeTransform {
    transform(seguimiento: any): any {
        let prioridad;
        let colorPrioridad;
        const score = seguimiento.score?.value;

        if (score >= 9) {
            prioridad = 'alta';
        } else if (score >= 5) {
            prioridad = 'media';
        } else {
            prioridad = 'baja';
        }
        colorPrioridad = ColoresPrioridades.find(x => x.name === prioridad);
        const ultimaInterccion = seguimiento.ultimoEstado ? moment().diff(moment(seguimiento.ultimoEstado.valor), 'days') : 0;
        const alarma = score === 10 ? `Último llamado hace ${ultimaInterccion} días.` : false;
        const seguimientoFields = {
            alarma,
            colorPrioridad
        };
        return seguimientoFields;
    }
}
