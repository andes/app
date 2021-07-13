import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlanIndicacionesServices extends ResourceBaseHttp {
    protected url = '/modules/rup/internacion/plan-indicaciones';
    constructor(protected server: Server) {
        super(server);
    }


    updateEstado(idIndicacion: string, estado) {
        return this.server.patch(`${this.url}/${idIndicacion}/estado`, estado);
    }

    getIndicaciones(idInternacion: string, fecha: Date) {
        return this.search({
            internacion: idInternacion,
            fechaInicio: `<${moment(fecha).endOf('day').format()}`
        }).pipe(
            map(indicaciones => {
                const fechaMax = moment(fecha).endOf('day').toDate();
                return indicaciones
                    .filter(ind => !ind.fechaBaja || moment(fechaMax).startOf('day').isBefore(ind.fechaBaja))
                    .map(ind => {
                        const estado = ind.estados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime()).reduce(
                            (acc, current) => {
                                if (!acc) { return current; }
                                if (current.fecha.getTime() < fecha.getTime()) {
                                    return current;
                                }
                                return acc;
                            },
                            null
                        );
                        return {
                            ...ind,
                            estado
                        };
                    });
            })
        );
    }

}
