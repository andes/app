import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { auditTime, map, switchMap } from 'rxjs/operators';

@Injectable()
export class CarnetPerinatalService extends ResourceBaseHttp {
    // URL to web api
    protected url = '/modules/perinatal/carnet-perinatal';
    public paciente = new BehaviorSubject<string>(null);
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public organizacion = new BehaviorSubject<string>(null);
    public profesional = new BehaviorSubject<string>(null);
    public fechaProximoControl = new BehaviorSubject<Date>(null);
    public fechaUltimoControl = new BehaviorSubject<Date>(null);
    public estado = new BehaviorSubject<string>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;
    public carnetsFiltrados$: Observable<any[]>;

    constructor(protected server: Server) {
        super(server);
        this.carnetsFiltrados$ = combineLatest(
            this.fechaDesde,
            this.fechaHasta,
            this.organizacion,
            this.profesional,
            this.paciente,
            this.fechaProximoControl,
            this.fechaUltimoControl,
            this.estado,
            this.lastResults
        ).pipe(
            auditTime(0),
            switchMap(([fechaDesde, fechaHasta, organizacion, profesional, paciente, fechaProximoControl, fechaUltimoControl, estado, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    // si skip > 0 pero no es multiplo de 'limit' significa que no hay mas resultados
                    return EMPTY;
                }
                const params: any = {
                    limit: this.limit,
                    skip: this.skip
                };
                if (paciente) {
                    params.paciente = '^' + paciente.toUpperCase();
                }
                if (fechaProximoControl) {
                    params.fechaProximoControl = moment(fechaProximoControl).format('YYYY-MM-DD');;
                }
                if (fechaUltimoControl) {
                    params.fechaUltimoControl = moment(fechaUltimoControl).format('YYYY-MM-DD');
                }
                if (organizacion) {
                    params.organizacion = organizacion.id;
                }
                if (profesional) {
                    params.profesional = profesional.id;
                }
                params.fechaControl = this.queryDateParams(fechaDesde, fechaHasta);

                return this.search(params).pipe(
                    map(resultados => {
                        const listado = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listado.length;
                        if (estado) {
                            return listado.map(l => {
                                if ((moment().diff(moment(l?.fechaProximoControl), 'days') >= 1) && !l?.fechaFinEmbarazo) {
                                    return l;
                                }
                            });
                        } else {
                            return listado;
                        }
                    })
                );
            }
            ));
    }

}
