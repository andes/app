import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, combineLatest, of, Subscription, forkJoin } from 'rxjs';
import { auditTime, filter, map, switchMap } from 'rxjs/operators';
import { IOrganizacion } from 'src/app/interfaces/IOrganizacion';
import { MapaCamasHTTP } from './mapa-camas.http';

@Injectable({ providedIn: 'root' })

export class PlanIndicacionesServices extends ResourceBaseHttp {
    protected url = '/modules/rup/internacion/plan-indicaciones';
    public medicamentosFiltrados$: Observable<any[]>;
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    public organizacion = new BehaviorSubject<IOrganizacion>(null);
    public paciente = new BehaviorSubject<string>(null);
    public sector = new BehaviorSubject<string>(null);


    private fRango;
    private limit = 15;
    private skip;

    constructor(
        protected server: Server,
        private camasHTTP: MapaCamasHTTP
    ) {
        super(server);
        this.medicamentosFiltrados$ = combineLatest([
            this.fechaDesde,
            this.fechaHasta,
            this.organizacion,
            this.paciente,
            this.lastResults,
            this.sector
        ]).pipe(
            auditTime(0),
            switchMap(([fechaDesde, fechaHasta, organizacion, paciente, lastResults, sector]) => {
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
                };
                console.log(organizacion);
                if (organizacion) {
                    params.organizacion = (organizacion as IOrganizacion).id;
                }
                if (paciente) {
                    params.paciente = '^' + (paciente as string).toUpperCase();
                }
                if (fechaDesde || fechaHasta) {
                    this.fRango = this.queryDateParams(fechaDesde as Date, fechaHasta as Date);
                    params.fechaRango = this.queryDateParams(fechaDesde as Date, fechaHasta as Date);
                }
                return this.search(params).pipe(
                    switchMap(resultados => {
                        const listado = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listado.length;
                        const desde = moment().subtract(3, 'y').toDate();
                        const hasta = moment().toDate();
                        return forkJoin(
                            listado.map(int =>
                                this.camasHTTP.historialInternacion('internacion', 'medica', desde as Date, null, int.idInternacion)
                            )
                        ).pipe(
                            map((results: any[]) => {
                                return listado.filter((int, index) => {
                                    const camas = results[index];
                                    const filtrar = true;
                                    if (camas[0]?.sectores) {
                                        int.sector = camas[0].sectores[1]?.tipoSector?.semanticTag + '| ' + camas[0].sectores[1]?.nombre + '| habitación: ' + camas[0].sectores[2]?.nombre;
                                        int.sectorID = camas[0].sectores[2]?._id;

                                    } else {
                                        int.sector = 'S/D';
                                    }
                                    return !sector || sector === int.sectorID;
                                });
                            })
                        );
                    })
                );
            })
        );
    }


    updateEstado(idIndicacion: string, estado) {
        return this.server.patch(`${this.url}/${idIndicacion}/estado`, estado);
    }

    getIndicaciones(idInternacion: string, fecha: Date, capa: string) {
        return this.search({
            internacion: idInternacion,
            rangoFechas: fecha
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
