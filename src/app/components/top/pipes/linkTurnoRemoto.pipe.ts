import { Pipe, PipeTransform } from '@angular/core';
import { TurnoService } from '../../../services/turnos/turno.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'linkTurnoRemoto' })
export class LinkTurnoRemotoPipe implements PipeTransform {

    constructor(
        public servicioTurnos: TurnoService
    ) { }

    transform(prestacion: any): Observable<string> {
        let link = '';
        if (prestacion.solicitud?.turno) {
            return (this.servicioTurnos.getTurnos({ id: prestacion.solicitud.turno }).pipe( map ( turnos => {
                link = turnos[0]?.bloques[0]?.turnos[0]?.link;
                if (!link) {
                    link = '';
                }
                return link;
            })));
        }
        return of('');
    }
}
