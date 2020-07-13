import { Injectable } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { switchMap, map } from 'rxjs/operators';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';

@Injectable()
export class ListadoInternacionService {

    public listaInternacion$: Observable<IPrestacion[]>;
    public listaInternacionFiltrada$: Observable<IPrestacion[]>;

    public pacienteText = new BehaviorSubject<string>(null);
    public fechaIngresoDesde = new BehaviorSubject<Date>(moment().subtract(1, 'months').toDate());
    public fechaIngresoHasta = new BehaviorSubject<Date>(moment().toDate());
    public fechaEgresoDesde = new BehaviorSubject<Date>(null);
    public fechaEgresoHasta = new BehaviorSubject<Date>(null);

    public estado = new BehaviorSubject<any>(null);

    constructor(
        private auth: Auth,
        private mapaHTTP: MapaCamasHTTP,
    ) {
        this.listaInternacion$ = combineLatest(
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
            this.fechaEgresoDesde,
            this.fechaEgresoHasta,
            ).pipe(
            switchMap(([fechaIngresoDesde, fechaIngresoHasta, fechaEgresoDesde, fechaEgresoHasta]) => {
                const filtros = {
                    fechaIngresoDesde, fechaIngresoHasta,
                    fechaEgresoDesde, fechaEgresoHasta,
                };

                return this.mapaHTTP.getPrestacionesInternacion(filtros);
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

    filtrarListaInternacion(listaInternacion: IPrestacion[], paciente: string, estado: string) {
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

        return listaInternacionFiltrada;
    }

    setFechaHasta(fecha: Date) {
        this.fechaIngresoHasta.next(fecha);
    }
}
