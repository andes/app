import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { BehaviorSubject, combineLatest, Observable, EMPTY } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class CarnetPerinatalService extends ResourceBaseHttp {
    // URL to web api
    protected url = '/modules/perinatal/carnet-perinatal';
    public paciente = new BehaviorSubject<string>(null);
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public fechaProximoControl = new BehaviorSubject<Date>(null);
    public fechaUltimoControl = new BehaviorSubject<Date>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    private limit = 15;
    private skip;
    public carnetsFiltrados$: Observable<any[]>;

    constructor(protected server: Server) {
        super(server);

        this.carnetsFiltrados$ = combineLatest(
            this.fechaDesde,
            this.fechaHasta,
            this.paciente,
            this.fechaProximoControl,
            this.fechaUltimoControl,
            this.lastResults
        ).pipe(
            switchMap(([fechaDesde, fechaHasta, paciente, fechaProximoControl, fechaUltimoControl, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (this.skip > 0 && this.skip % this.limit !== 0) {
                    // si skip > 0 pero no es multiplo de 'limit' significa que no hay mas resultados
                    return EMPTY;
                }
                let params: any = {
                    limit: this.limit,
                    skip: this.skip
                };
                if (paciente) {
                    params.paciente = paciente;
                }
                if (fechaProximoControl) {
                    params.fechaProximoControl = fechaProximoControl;
                }
                if (fechaUltimoControl) {
                    params.fechaUltimoControl = fechaUltimoControl;
                }
                const desdeF = moment(fechaDesde).startOf('day').toDate();
                const hastaF = moment(fechaHasta).endOf('day').toDate();
                if (fechaDesde) {
                    if (fechaHasta) {
                        params.fecha = `${desdeF}|${hastaF}`;
                    } else {
                        params.fecha = `>${desdeF}`;
                    }
                } else {
                    if (fechaHasta) {
                        params.fecha = `<${hastaF}`;
                    }
                }

                return this.search(params).pipe(
                    map(resultados => {
                        let listado = lastResults ? lastResults.concat(resultados) : resultados;
                        this.skip = listado.length;
                        return listado;
                    })
                );
            }
            ));
    }

}
