import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { auditTime, map, switchMap } from 'rxjs/operators';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IProfesional } from '../../../interfaces/IProfesional';

@Injectable()
export class CarnetPerinatalService extends ResourceBaseHttp {
    // URL to web api
    protected url = '/modules/perinatal/carnet-perinatal';
    public paciente = new BehaviorSubject<string>(null);
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public organizacion = new BehaviorSubject<IOrganizacion>(null);
    public profesional = new BehaviorSubject<IProfesional>(null);
    public fechaProximoControl = new BehaviorSubject<Date>(null);
    public fechaUltimoControl = new BehaviorSubject<Date>(null);
    public estado = new BehaviorSubject<boolean>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;
    public carnetsFiltrados$: Observable<any[]>;

    constructor(protected server: Server) {
        super(server);
        this.carnetsFiltrados$ = combineLatest([
            this.fechaDesde,
            this.fechaHasta,
            this.organizacion,
            this.profesional,
            this.paciente,
            this.fechaProximoControl,
            this.fechaUltimoControl,
            this.estado,
            this.lastResults
        ]).pipe(
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
                    params.paciente = '^' + (paciente as string).toUpperCase();
                }
                if (fechaProximoControl) {
                    params.fechaProximoControl = moment(fechaProximoControl).format('YYYY-MM-DD');;
                }
                if (fechaUltimoControl) {
                    params.fechaUltimoControl = moment(fechaUltimoControl).format('YYYY-MM-DD');
                }
                if (organizacion) {
                    params.organizacion = (organizacion as IOrganizacion).id;
                }
                if (profesional) {
                    params.profesional = (profesional as IProfesional).id;
                }
                params.fechaControl = this.queryDateParams(fechaDesde as Date, fechaHasta as Date);

                return this.search(params).pipe(
                    map(resultados => {
                        const listado = lastResults ? (lastResults as any[]).concat(resultados) : resultados;
                        this.skip = listado.length;
                        if (estado) {
                            return listado.map(elemt_list => {
                                if ((moment().diff(moment(elemt_list?.fechaProximoControl), 'days') >= 1) && !elemt_list?.fechaFinEmbarazo) {
                                    return elemt_list;
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
