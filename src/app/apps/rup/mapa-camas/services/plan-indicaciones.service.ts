import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, combineLatest, of, forkJoin } from 'rxjs';
import { auditTime, map, mergeMap, switchMap } from 'rxjs/operators';
import { MapaCamasHTTP } from './mapa-camas.http';

@Injectable({ providedIn: 'root' })

export class PlanIndicacionesServices extends ResourceBaseHttp {
    protected url = '/modules/rup/internacion/plan-indicaciones';
    public medicamentosFiltrados$: Observable<any[]>;
    public lastResults = new BehaviorSubject<any[]>(null);
    public organizacion = new BehaviorSubject<string>(null);
    public paciente = new BehaviorSubject<string>(null);
    public sector = new BehaviorSubject<string>(null);
    public unidadO = new BehaviorSubject<string>(null);
    private limit = 15;
    private skip;

    constructor(
        protected server: Server,
        private camasHTTP: MapaCamasHTTP,) {
        super(server);
        this.medicamentosFiltrados$ = combineLatest([
            this.organizacion,
            this.paciente,
            this.lastResults,
            this.sector,
            this.unidadO
        ]).pipe(
            auditTime(0),
            switchMap(([organizacion, paciente, lastResults, sector, unidadO]) => {

                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    return EMPTY;
                }
                const params: any = {
                    limit: this.limit,
                    aceptadas: true,
                    skip: this.skip,
                    delDia: true
                };
                if (organizacion) {
                    params.organizacion = organizacion;
                }
                if (paciente) {
                    params.paciente = '^' + (paciente as string).toUpperCase();
                }
                return this.search(params).pipe(
                    map(resultados => {
                        const listado = lastResults ? (lastResults as any[]).concat(resultados) : resultados;
                        this.skip = listado.length;
                        const desde = moment().subtract(1, 'y').toDate();
                        if (resultados.length === 0) {
                            return of([]);
                        } else {

                            return forkJoin(
                                listado.map(int =>
                                    this.camasHTTP.historialInternacion('internacion', 'medica', desde as Date, null, int.idInternacion, int.organizacion.id)
                                )
                            ).pipe(
                                map((results) => {
                                    return listado.filter((int, index) => {
                                        const camas = results[index];
                                        if (camas[0]?.sectores) {
                                            int.sector = camas[0].sectores[1]?.tipoSector?.semanticTag + ' | ' + camas[0].sectores[1]?.nombre + ' | habitación: ' + (camas[0].sectores[2]?.nombre ? camas[0].sectores[2]?.nombre : 'S/D');
                                            int.sectorID1 = camas[0].sectores[0]?._id;
                                            int.sectorID2 = camas[0].sectores[1]?._id;
                                            int.sectorID3 = camas[0].sectores[2]?._id;
                                        } else {
                                            int.sector = 'S/D';
                                        }
                                        camas[0]?.unidadOrganizativa?.fsn ? int.unidadOrganizativa = camas[0].unidadOrganizativa.fsn : int.unidadOrganizativa = 'S/D';
                                        const matchSector = !sector || sector === int.sectorID1 || sector === int.sectorID2 || sector === int.sectorID3;
                                        const matchUnidadO = !unidadO || camas[0]?.unidadOrganizativa?.id === unidadO;
                                        return matchSector && matchUnidadO;
                                    });
                                })
                            );
                        }

                    })
                );
            })
        ).pipe(mergeMap(x => x));
    }


    updateEstado(idIndicacion: string, estado) {
        return this.server.patch(`${this.url}/${idIndicacion}/estado`, estado);
    }

    getIndicaciones(idInternacion: string, fecha: Date, capa: string, excluyeEstado?: string) {
        return this.search({
            internacion: idInternacion,
            rangoFechas: fecha,
            excluyeEstado: excluyeEstado
        }).pipe(
            map(indicaciones => {
                const fechaMax = moment(fecha).endOf('day').toDate();
                return indicaciones
                    .filter(ind => (!ind.fechaBaja || moment(fechaMax).startOf('day').isBefore(ind.fechaBaja)) && (!ind.deletedAt || !ind.deletedBy))
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
