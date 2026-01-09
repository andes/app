import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, map, auditTime } from 'rxjs/operators';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { cache } from '@andes/shared';
import { IInformeEstadistica } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';

@Injectable()
export class ListadoInternacionService {

    public listaInternacion$: Observable<IInformeEstadistica[]>;
    public listaInternacionFiltrada$: Observable<IInformeEstadistica[]>;
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
    public fechasIngreso$: Observable<boolean>;
    public fechasEgreso$: Observable<boolean>;

    constructor(
        private mapaHTTP: MapaCamasHTTP,
    ) {
        this.listaInternacion$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta
        ]).pipe(
            auditTime(1),
            switchMap(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta]) => {
                const filtros = {
                    fechaIngresoDesde,
                    fechaIngresoHasta,
                    fechaEgresoDesde,
                    fechaEgresoHasta,
                };
                return this.mapaHTTP.getPrestacionesInternacion(filtros);
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
                this.filtrarInformesEstadistica(listaInternacion, { paciente, estado, obraSocial, unidad })
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

        this.fechasIngreso$ = combineLatest([
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta
        ]).pipe(
            map(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta]) => {
                const algunaFechaCorrecta = !!fechaIngresoDesde || !!fechaIngresoHasta || !!fechaEgresoDesde || !!fechaEgresoHasta;
                return algunaFechaCorrecta;
            })
        );
    }

    // Método viejo
    filtrarListaInternacion(listaInternacion: IInformeEstadistica[], paciente: string, estado: string, obraSocial: any, unidad: any) {
        let listaInternacionFiltrada = listaInternacion;

        if (paciente) {
            const esNumero = Number.isInteger(Number(paciente));
            if (esNumero) {
                listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IInformeEstadistica) =>
                    (internacion.paciente.documento?.includes(paciente) || internacion.paciente?.numeroIdentificacion?.includes(paciente)));
            } else {
                listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IInformeEstadistica) =>
                    (internacion.paciente.nombre.toLowerCase().includes(paciente.toLowerCase()) ||
                    internacion.paciente.alias?.toLowerCase().includes(paciente.toLowerCase()) ||
                    internacion.paciente.apellido.toLowerCase().includes(paciente.toLowerCase()))
                );
            }
        }

        if (estado) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IInformeEstadistica) =>
                internacion.estados[internacion.estados.length - 1].tipo === estado
            );
        }

        if (obraSocial) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter(
                (internacion: IInformeEstadistica) => {
                    const cobertura = internacion.informeIngreso?.cobertura;
                    const obra = cobertura?.obraSocial;

                    if (obraSocial._id === 'sin-obra-social') {
                        return !obra;
                    }
                    return obra?.nombre === obraSocial.nombre;
                }
            );
        }

        if (unidad) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IInformeEstadistica) =>
                internacion.unidadOrganizativa?.term === unidad.term
            );
        }

        return listaInternacionFiltrada;
    }

    filtrarInformesEstadistica(informes: any[], filtros: any) {
        const { paciente, estado, obraSocial, unidad } = filtros || {};

        let listaFiltrada = informes;

        if (paciente) {
            const esNumero = Number.isInteger(Number(paciente));
            if (esNumero) {
                listaFiltrada = listaFiltrada.filter((i) =>
                    i.paciente?.documento?.includes(paciente) ||
                    i.paciente?.numeroIdentificacion?.includes(paciente)
                );
            } else {
                const valor = paciente.toLowerCase();
                listaFiltrada = listaFiltrada.filter((i) =>
                    i.paciente?.nombre?.toLowerCase().includes(valor) ||
                    i.paciente?.apellido?.toLowerCase().includes(valor) ||
                    i.paciente?.alias?.toLowerCase().includes(valor)
                );
            }
        }

        if (estado) {
            listaFiltrada = listaFiltrada.filter((i) =>
                i.estados?.[i.estados.length - 1]?.tipo === estado
            );
        }

        if (obraSocial) {
            listaFiltrada = listaFiltrada.filter((i) => {
                if (obraSocial._id === 'sin-obra-social') {
                    return !i.paciente?.obraSocial;
                }
                return i.paciente?.obraSocial?.nombre === obraSocial.nombre;
            });
        }
        if (unidad) {
            listaFiltrada = listaFiltrada.filter((i) =>
                i.unidadOrganizativa?.term === unidad.term
            );
        }
        return listaFiltrada;
    }


    setFechaHasta(fecha: Date) {
        this.fechaIngresoHasta.next(fecha);
    }
}
