import { Auth } from '@andes/auth';
import { cache } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { auditTime, map, switchMap } from 'rxjs/operators';
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
    public refresh = new BehaviorSubject<any>(null);
    public missingFilters$: Observable<boolean>;
    public estado = new BehaviorSubject<any>(null);
    public unidadOrganizativa = new BehaviorSubject<any>(null);

    constructor(
        private resumenHTTP: InternacionResumenHTTP,
        private auth: Auth,
    ) {
        this.listaInternacion$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta,
            this.unidadOrganizativa,
            this.refresh
        ]).pipe(
            auditTime(0),
            switchMap(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta, unidad, refresh]) => {
                if ((fechaIngresoDesde && fechaIngresoHasta) || fechaEgresoDesde && fechaEgresoHasta) {
                    return this.resumenHTTP.getListado({
                        idOrganizacion: this.auth.organizacion.id,
                        ingreso: this.resumenHTTP.queryDateParams(fechaIngresoDesde, fechaIngresoHasta),
                        egreso: this.resumenHTTP.queryDateParams(fechaEgresoDesde, fechaEgresoHasta),
                        unidad: unidad?.conceptId || unidad,
                        populate: 'idPrestacion'
                    }).pipe(
                        map(resumen => {
                            return (resumen.length) ? resumen : [];
                        })
                    );
                }
                return of([]);
            })
        );
        this.listaInternacionFiltrada$ = combineLatest([
            this.listaInternacion$,
            this.pacienteText,
            this.estado,
            this.unidadOrganizativa
        ]).pipe(
            map(([listaInternacion, paciente, estado, unidad]) =>
                this.filtrarListaInternacion(listaInternacion, paciente, unidad)
            )
        );

        this.missingFilters$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta
        ]).pipe(
            map(([ingresoDesde, ingresoHasta, egresoDesde, egresoHasta]) => {
                return !(
                    (moment(ingresoDesde).isValid() && moment(ingresoHasta).isValid()) ||
                    (moment(egresoDesde).isValid() && moment(egresoHasta).isValid())
                );
            })
        ), cache();
    }

    filtrarListaInternacion(listaInternacion: IResumenInternacion[], paciente: string, unidad: any) {
        let listaInternacionFiltrada = listaInternacion;
        if (paciente) {
            const esNumero = Number.isInteger(Number(paciente));
            if (esNumero) {
                listaInternacionFiltrada = listaInternacionFiltrada.filter(
                    (internacion: IResumenInternacion) =>
                        (internacion.paciente.documento?.includes(paciente) || internacion?.paciente?.numeroIdentificacion?.includes(paciente))
                );
            } else {
                listaInternacionFiltrada = listaInternacionFiltrada.filter(
                    (internacion: IResumenInternacion) =>
                        (internacion.paciente.nombre.toLowerCase().includes(paciente.toLowerCase()) ||
                        internacion.paciente.alias?.toLowerCase().includes(paciente.toLowerCase()) ||
                        internacion.paciente.apellido.toLowerCase().includes(paciente.toLowerCase()))
                );
            }
        }

        if (unidad) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter(
                (internacion: IResumenInternacion) =>
                    (internacion as any).idPrestacion?.unidadOrganizativa?.conceptId === (unidad?.conceptId || unidad)
            );
        }
        return listaInternacionFiltrada;
    }

    setFechaHasta(fecha: Date) {
        this.fechaIngresoHasta.next(fecha);
    }
}
