import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { auditTime, map, switchMap } from 'rxjs/operators';

@Injectable()
export class HistorialTurnosService extends ResourceBaseHttp {
    protected url = '/modules/turnos/historial';
    public paciente = new BehaviorSubject<any>(null);
    public fechaDesde = new BehaviorSubject<Date>(null);
    public fechaHasta = new BehaviorSubject<Date>(null);
    public estadoTurno = new BehaviorSubject<any>(null);
    public prestacion = new BehaviorSubject<any>(null);
    public lastResults = new BehaviorSubject<any[]>(null);
    public historialFiltrados$: Observable<any[]>;
    private limit = 15;
    private skip;

    constructor(protected server: Server) {
        super(server);

        this.historialFiltrados$ = combineLatest([
            this.paciente,
            this.fechaDesde,
            this.fechaHasta,
            this.estadoTurno,
            this.prestacion,
            this.lastResults
        ]).pipe(
            auditTime(0),
            switchMap(([paciente, fechaDesde, fechaHasta, estado, prestacion, lastResults]) => {
                if (!lastResults) {
                    this.skip = 0;
                }
                if (!paciente || (this.skip > 0 && this.skip % this.limit !== 0)) {
                    return EMPTY;
                }

                const params: any = {
                    limit: this.limit,
                    skip: this.skip,
                    pacienteId: paciente.id
                };
                params.desde = fechaDesde ? moment(fechaDesde).startOf('day').toDate() : undefined;
                params.hasta = fechaHasta ? moment(fechaHasta).endOf('day').toDate() : undefined;
                if (estado) {
                    params.estado = (estado.nombre as string).toLowerCase();
                }
                if (prestacion) {
                    params.prestacion = prestacion.id as string;
                }
                return this.search(params).pipe(
                    map(resultados => {
                        const historialTurnos = lastResults ? (lastResults as any[]).concat(resultados) : resultados;
                        this.skip = historialTurnos.length;
                        return historialTurnos;
                    })
                );
            })
        );
    }
}
