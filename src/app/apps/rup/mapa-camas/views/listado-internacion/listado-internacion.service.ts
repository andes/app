import { Injectable } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, auditTime } from 'rxjs/operators';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { cache } from '@andes/shared';

@Injectable()
export class ListadoInternacionService {

    public listaInternacion$: Observable<IPrestacion[]>;
    public listaInternacionFiltrada$: Observable<IPrestacion[]>;
    public pacienteText = new BehaviorSubject<string>(null);
    public fechaIngresoDesde = new BehaviorSubject<Date>(moment().subtract(1, 'months').toDate());
    public fechaIngresoHasta = new BehaviorSubject<Date>(moment().toDate());
    public fechaEgresoDesde = new BehaviorSubject<Date>(null);
    public fechaEgresoHasta = new BehaviorSubject<Date>(null);
    public unidadOrganizativa = new BehaviorSubject<any>(null);
    public estado = new BehaviorSubject<any>(null);
    public obraSocial = new BehaviorSubject<any[]>(null);
    public refresh = new BehaviorSubject<any>(null);
    public missingFilters$: Observable<boolean>;

    constructor(
        private mapaHTTP: MapaCamasHTTP,
    ) {
        this.listaInternacion$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta,
        ]).pipe(
            auditTime(1),
            switchMap(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta]) => {
                if ((fechaIngresoDesde && fechaIngresoHasta) || (fechaEgresoDesde && fechaEgresoHasta)) {
                    const filtros = {
                        fechaIngresoDesde,
                        fechaIngresoHasta,
                        fechaEgresoDesde,
                        fechaEgresoHasta,
                    };

                    return this.mapaHTTP.getPrestacionesInternacion(filtros);
                }

                return of([]);
            }),
            cache()
        );

        this.listaInternacionFiltrada$ = combineLatest([
            this.listaInternacion$,
            this.pacienteText,
            this.estado,
            this.obraSocial,
            this.unidadOrganizativa
        ]).pipe(
            map(([listaInternacion, paciente, estado, obraSocial, unidad]) =>
                this.filtrarListaInternacion(listaInternacion, paciente, estado, obraSocial, unidad)
            )
        );

        this.missingFilters$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta
        ]).pipe(
            map(([
                ingresoDesde, ingresoHasta, egresoDesde, egresoHasta]) => {
                return !(
                    (moment(ingresoDesde).isValid() && moment(ingresoHasta).isValid()) ||
                    (moment(egresoDesde).isValid() && moment(egresoHasta).isValid())
                );
            })
        ),
        cache();
    }

    filtrarListaInternacion(listaInternacion: IPrestacion[], paciente: string, estado: string, obraSocial: any, unidad: any) {
        let listaInternacionFiltrada = listaInternacion;

        if (paciente) {
            const esNumero = Number.isInteger(Number(paciente));
            if (esNumero) {
                listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) => internacion.paciente.documento.includes(paciente));
            } else {
                listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) =>
                    (internacion.paciente.nombre.toLowerCase().includes(paciente.toLowerCase()) ||
                    internacion.paciente.apellido.toLowerCase().includes(paciente.toLowerCase()))
                );
            }
        }
        if (estado) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) =>
                internacion.estados[internacion.estados.length - 1].tipo === estado
            );
        }
        if (obraSocial) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter(
                (internacion: IPrestacion) => {
                    if (obraSocial._id === 'sin-obra-social') {
                        return !internacion.paciente.obraSocial;
                    }
                    return internacion.paciente.obraSocial?.nombre === obraSocial.nombre;
                }
            );
        }

        if (unidad) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) =>
                internacion.unidadOrganizativa?.term === unidad.term
            );
        }

        return listaInternacionFiltrada;
    }

    setFechaHasta(fecha: Date) {
        this.fechaIngresoHasta.next(fecha);
    }
}
