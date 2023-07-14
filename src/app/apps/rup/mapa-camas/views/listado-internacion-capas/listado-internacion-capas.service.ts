import { Auth } from '@andes/auth';
import { cache } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { auditTime, map, switchMap } from 'rxjs/operators';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
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
    public listadoInternacion = [];

    constructor(
        private resumenHTTP: InternacionResumenHTTP,
        private auth: Auth,
        private camasHTTP: MapaCamasHTTP
    ) {
        this.listaInternacion$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta,
            this.refresh
        ]).pipe(
            auditTime(0),
            switchMap(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta, refresh]) => {
                this.listadoInternacion = [];
                if ((fechaIngresoDesde && fechaIngresoHasta) || fechaEgresoDesde && fechaEgresoHasta) {
                    return this.resumenHTTP.search({
                        organizacion: this.auth.organizacion.id,
                        ingreso: this.resumenHTTP.queryDateParams(fechaIngresoDesde, fechaIngresoHasta),
                        egreso: this.resumenHTTP.queryDateParams(fechaEgresoDesde, fechaEgresoHasta),
                        populate: 'idPrestacion'
                    }).pipe(
                        // En este switchMap se carga en un array los datos relevantes de cada internación y se
                        // obtienen los historiales correspondientes para tener las unidades organizativas segun
                        // su ingreso o egreso correspondiente.
                        map(resumen => {
                            if (!resumen.length) {
                                return [];
                            }
                            resumen.forEach(inter => {
                                const nuevoListado = {};
                                nuevoListado['id'] = inter.id;
                                nuevoListado['fechaIngreso'] = inter.fechaIngreso;
                                nuevoListado['fechaEgreso'] = inter.fechaEgreso;
                                nuevoListado['paciente'] = inter.paciente;
                                nuevoListado['idPrestacion'] = inter.idPrestacion;
                                nuevoListado['diagnostico'] = inter.registros.find(reg => reg.esDiagnosticoPrincipal && reg.tipo === 'valoracion-inicial')?.concepto;
                                this.listadoInternacion.push(nuevoListado);
                            });
                            return resumen;
                        })
                    );
                }
                return of([]);
            })
        );
        this.listaInternacionFiltrada$ = combineLatest([
            this.listaInternacion$,
            this.pacienteText,
            this.estado
        ]).pipe(
            map(([listaInternacion, paciente, estado]) =>
                this.filtrarListaInternacion(listaInternacion, paciente)
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
        ),
        cache();

    }

    filtrarListaInternacion(listaInternacion: IResumenInternacion[], paciente: string) {
        let listaInternacionFiltrada = listaInternacion;
        if (paciente) {
            const esNumero = Number.isInteger(Number(paciente));
            if (esNumero) {
                listaInternacionFiltrada = listaInternacionFiltrada.filter(
                    (internacion: IResumenInternacion) => internacion.paciente.documento.includes(paciente)
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
        return listaInternacionFiltrada;
    }

    setFechaHasta(fecha: Date) {
        this.fechaIngresoHasta.next(fecha);
    }
}
