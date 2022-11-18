import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
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

    getIndicaciones(idInternacion: string, fecha: Date, capa: string) {
        return this.search({
            internacion: idInternacion,
            rangoFechas:fecha
        }).pipe(
            map(indicaciones => {
                const fechaMax = moment(fecha).endOf('day').toDate();
                return indicaciones
                    .filter(ind => !ind.fechaBaja || moment(fechaMax).startOf('day').isBefore(ind.fechaBaja))
                    .map(ind => {
                        const estado = ind.estados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime()).reduce(
                            (acc, current) => {
                                if (!acc) { return current; }
                                if (current.fecha.getTime() < fechaMax.getTime()) {
                                    return current;
                                }
                                return acc;
                            },
                            null
                        );
                        if (estado.tipo !== 'draft' && moment(estado.fecha).isBefore(fecha, 'd')) {
                            estado.tipo = 'pending';
                        }
                        return {
                            ...ind,
                            estado,
                            seccion: ind.seccion || { term: ' - sin sección -' },
                            readonly: capa !== ind.capa
                        };
                    })
                    .filter(ind => ind.estado.tipo !== 'draft' || ind.capa === capa)
                    .sort((a, b) => {
                        if (!a.seccion) {
                            return -1;
                        }
                        if (!b.seccion) {
                            return 1;
                        }
                        return (a.seccion.term as string).localeCompare(b.seccion.term);
                    })
                    .sort((a) => a.estado.tipo === 'cancelled' ? 1 : -1);
            })
        );
    }

    getSeccion() {
        return of(null);
    }

    getSugeridos() {
        return of([]);
    }
}
