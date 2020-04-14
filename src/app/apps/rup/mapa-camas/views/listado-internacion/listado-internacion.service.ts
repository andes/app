import { Injectable } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class ListadoInternacionService {

    public listaInternacion$: Observable<IPrestacion[]>;
    public listaInternacionFiltrada$: Observable<IPrestacion[]>;

    public pacienteDocumento = new BehaviorSubject<string>(null);
    public pacienteApellido = new BehaviorSubject<string>(null);
    public fechaIngresoDesde = new BehaviorSubject<Date>(moment().subtract(1, 'months').toDate());
    public fechaIngresoHasta = new BehaviorSubject<Date>(moment().toDate());
    public estado = new BehaviorSubject<any>(null);

    constructor(
        private prestacionService: PrestacionesService,
        private auth: Auth,
    ) {
        this.listaInternacion$ = combineLatest(
            this.fechaIngresoDesde,
            this.fechaIngresoHasta,
        ).pipe(
            switchMap(([fechaIngresoDesde, fechaIngresoHasta]) => {
                const filtros = {
                    fechaDesde: fechaIngresoDesde, fechaHasta: fechaIngresoHasta,
                    organizacion: this.auth.organizacion.id,
                    conceptId: PrestacionesService.InternacionPrestacion.conceptId,
                    ordenFecha: true,
                    estado: ['validada', 'ejecucion']
                };

                return this.prestacionService.get(filtros);
            })
        );

        this.listaInternacionFiltrada$ = combineLatest(
            this.listaInternacion$,
            this.pacienteDocumento,
            this.pacienteApellido,
            this.estado
        ).pipe(
            map(([listaInternacion, documento, apellido, estado]) =>
                this.filtrarListaInternacion(listaInternacion, documento, apellido, estado)
            )
        );

    }

    filtrarListaInternacion(listaInternacion: IPrestacion[], documento: string, apellido: string, estado: string) {
        let listaInternacionFiltrada = listaInternacion;

        if (documento) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) => internacion.paciente.documento.toLowerCase().includes(documento.toLowerCase()));
        }

        if (apellido) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) => internacion.paciente.apellido.toLowerCase().includes(apellido.toLowerCase()));
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
