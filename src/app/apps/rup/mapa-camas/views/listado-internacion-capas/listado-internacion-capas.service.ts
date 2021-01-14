import { Injectable } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Auth } from '@andes/auth';
import { switchMap, map, auditTime } from 'rxjs/operators';
import { InternacionResumenHTTP, IResumenInternacion } from '../../services/resumen-internacion.http';

@Injectable({ providedIn: 'root' })
export class ListadoInternacionCapasService {

    public listaInternacion$: Observable<IResumenInternacion[]>;
    public listaInternacionFiltrada$: Observable<IResumenInternacion[]>;

    public pacienteText = new BehaviorSubject<string>(null);
    public fechaIngresoDesde = new BehaviorSubject<Date>(moment().subtract(1, 'months').toDate());
    public fechaIngresoHasta = new BehaviorSubject<Date>(moment().toDate());
    public fechaEgresoDesde = new BehaviorSubject<Date>(null);
    public fechaEgresoHasta = new BehaviorSubject<Date>(null);

    public estado = new BehaviorSubject<any>(null);

    constructor(
        private resumenHTTP: InternacionResumenHTTP,
    ) {
        this.listaInternacion$ = combineLatest(
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta,
        ).pipe(
            auditTime(0),
            switchMap(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta]) => {
                if (fechaIngresoDesde && fechaIngresoHasta) {
                    return this.resumenHTTP.search({
                        ingreso: this.resumenHTTP.queryDateParams(fechaIngresoDesde, fechaIngresoHasta),
                        egreso: this.resumenHTTP.queryDateParams(fechaEgresoDesde, fechaEgresoHasta)
                    });
                }
            })
        );

        this.listaInternacionFiltrada$ = combineLatest(
            this.listaInternacion$,
            this.pacienteText,
            this.estado
        ).pipe(
            map(([listaInternacion, paciente, estado]) =>
                this.filtrarListaInternacion(listaInternacion, paciente, estado)
            )
        );

    }

    filtrarListaInternacion(listaInternacion: IResumenInternacion[], paciente: string, estado: string) {
        const listaInternacionFiltrada = listaInternacion;
        return listaInternacionFiltrada;
    }

    setFechaHasta(fecha: Date) {
        this.fechaIngresoHasta.next(fecha);
    }
}
