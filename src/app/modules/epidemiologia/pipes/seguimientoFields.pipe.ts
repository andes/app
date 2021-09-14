import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'seguimientoFields'
})
export class SeguimientoFieldsPipe implements PipeTransform {
    transform(seguimiento: any): any {
        const profesional = seguimiento.ultimaAsignacion?.profesional;
        const profesionalAsignado = profesional ? `${profesional.nombre} ${profesional.apellido}` : '';
        const seguimientoFields = { profesionalAsignado };
        return seguimientoFields;
    }
}
