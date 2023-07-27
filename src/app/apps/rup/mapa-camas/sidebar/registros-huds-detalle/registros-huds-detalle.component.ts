import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, pluck, catchError } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Auth } from '@andes/auth';
import { arrayToSet, cache, notNull } from '@andes/shared';
import { Router } from '@angular/router';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { RegistroHUDSItemAccion } from './registros-huds-item/registros-huds-item.component';
import { IMAQEstado } from '../../interfaces/IMaquinaEstados';
import { ModalMotivoAccesoHudsService } from '../../../../../modules/rup/components/huds/modal-motivo-acceso-huds.service';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-registros-huds-detalle',
    templateUrl: './registros-huds-detalle.component.html'
})
export class RegistrosHudsDetalleComponent implements OnInit {
    @ViewChild('formulario', { static: true }) formulario: NgForm;

    public historial$: Observable<any>;
    public historialFiltrado$: Observable<any>;
    private historialInternacion$: Observable<any>;

    public desde: Date;
    public hasta: Date;
    public tipoPrestacion;
    public inProgress = true;
    public prestacionesEliminadas = [];

    public refreshFecha$ = new BehaviorSubject(null);
    public tipoPrestacion$ = new BehaviorSubject(null);
    public id$ = new BehaviorSubject(null);

    public cama$ = this.mapaCamasService.selectedCama;
    public estadoCama$: Observable<IMAQEstado>;
    public accionesEstado$: Observable<any>;
    public prestacionesList$: Observable<any>;
    public min$: Observable<Date>;
    public max$: Observable<Date>;
    public paciente;

    @Output() accion = new EventEmitter();

    public esProfesional = this.auth.profesional;
    public puedeVerHuds = false;
    private planIndicConcepId = '4981000013105';
    constructor(
        private mapaCamasService: MapaCamasService,
        private prestacionService: PrestacionesService,
        private auth: Auth,
        private router: Router,
        private motivoAccesoService: ModalMotivoAccesoHudsService
    ) { }

    ngOnInit() {
        this.desde = moment(this.mapaCamasService.fecha).subtract(7, 'd').toDate();
        this.hasta = moment(this.mapaCamasService.fecha).toDate();

        this.historialInternacion$ = this.mapaCamasService.historialInternacion$.pipe(cache());

        this.puedeVerHuds = this.auth.check('huds:visualizacionHuds');
        let estaPrestacionId; // id de prestacion correspondiente a la internacion actual
        this.historial$ = combineLatest([
            this.cama$,
            this.mapaCamasService.selectedPrestacion,
            this.mapaCamasService.resumenInternacion$
        ]).pipe(
            switchMap(([cama, prestacion, resumen]) => {
                if (resumen) {
                    this.desde = resumen.fechaIngreso;
                    this.hasta = resumen.fechaEgreso || moment().toDate();
                }
                estaPrestacionId = prestacion?.id ? prestacion.id : this.mapaCamasService.capa === 'estadistica' ? cama.idInternacion : resumen.idPrestacion;
                const paciente = cama?.paciente || (prestacion?.paciente || resumen?.paciente);
                this.paciente = paciente;
                if (paciente) {
                    return this.motivoAccesoService.getAccessoHUDS(paciente as IPaciente);
                }
                return [];
            }),
            switchMap(({ paciente }) => {
                return this.getHUDS(paciente);
            }),
            map(prestaciones => {
                // descarta la propia prestación de la internación actual
                return prestaciones.filter(p => this.validadaCreadasPorMi(p) && p.id !== estaPrestacionId);
            }),
            catchError((e) => {
                this.accion.emit(null);
                return [];
            }),
            cache()
        );

        this.min$ = this.historialInternacion$.pipe(
            map(movimientos => {
                if (movimientos.length > 0) {
                    const lastIndex = movimientos.length - 1;
                    return moment(movimientos[lastIndex].fecha).startOf('day').toDate();
                }
                return new Date();
            }),
            tap((date) => {
                if (moment(this.desde).isSameOrBefore(moment(date))) {
                    this.desde = date;
                    this.onChangeFecha();
                }
            })
        );

        this.max$ = this.historialInternacion$.pipe(
            map(movimientos => {
                const egreso = movimientos.find(m => m.extras && m.extras.egreso);
                if (egreso) {
                    this.hasta = egreso.fecha;
                    this.onChangeFecha();
                    return egreso.fecha;
                }
                return null;
            })
        );

        this.historialFiltrado$ = combineLatest([
            this.historial$,
            this.refreshFecha$,
            this.tipoPrestacion$,
            this.min$,
            this.id$
        ]).pipe(
            map(([prestaciones, refreshFecha, tipoPrestacion, min, idPrestacion]) => {
                if (idPrestacion) {
                    this.prestacionesEliminadas.push(idPrestacion);
                }
                if (!this.desde) {
                    this.desde = moment().subtract(7, 'd').toDate();
                }
                if (this.desde instanceof Date) {
                    this.desde = this.desde.getTime() < min.getTime() ? moment(min) : this.desde;
                } else if (moment.isMoment(this.desde)) {
                    this.desde = moment(this.desde).toDate().getTime() < min.getTime() ? moment(min) : this.desde;
                }
                this.inProgress = false;
                return prestaciones.filter((prestacion) => {
                    const fecha = moment(prestacion.ejecucion.fecha);
                    if (tipoPrestacion) {
                        return fecha.isSameOrBefore(this.hasta, 'd') && fecha.isSameOrAfter(this.desde, 'd') && tipoPrestacion.conceptId === prestacion.solicitud.tipoPrestacion.conceptId;
                    }
                    return fecha.isSameOrBefore(this.hasta, 'd') && fecha.isSameOrAfter(this.desde, 'd') && !this.prestacionesEliminadas.some(id => id === prestacion.id);
                });
            })
        );

        this.estadoCama$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getEstadoCama(cama)));
        this.accionesEstado$ = this.estadoCama$.pipe(
            notNull(),
            pluck('acciones'),
            map(acciones => acciones.filter(acc => acc.tipo === 'nuevo-registro'))
        );

        this.prestacionesList$ = this.historial$.pipe(
            map(prestaciones => prestaciones = arrayToSet(prestaciones, 'conceptId', (item) => item.solicitud.tipoPrestacion))
        );
    }

    validadaCreadasPorMi(prestacion) {
        const ejecutada = prestacion.estados.some(e => e.tipo === 'ejecucion');
        const estadoPrestacion = prestacion.estados[prestacion.estados.length - 1];
        const esValidada = estadoPrestacion.tipo === 'validada';
        const createdByMe = estadoPrestacion.createdBy.id === this.auth.usuario.id;
        return ejecutada && (esValidada || createdByMe);
    }

    esEjecucion(prestacion) {
        const estadoPrestacion = prestacion.estados[prestacion.estados.length - 1];
        const esEjecucion = estadoPrestacion.tipo === 'ejecucion';
        return esEjecucion;
    }

    verHuds() {
        this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: `/mapa-camas/mapa/${this.mapaCamasService.ambito}` });
        this.router.navigate(['/huds/paciente/' + this.paciente.id]);
    }

    getHUDS(paciente) {
        return this.prestacionService.getByPaciente(paciente.id, true).pipe(
            map((prestaciones) => {
                return prestaciones.sort((a, b) => {
                    return b.solicitud.fecha.getTime() - a.solicitud.fecha.getTime();
                });
            })
        );
    }

    onNuevoRegistrio() {
        this.accion.emit({ accion: 'nuevo-registro' });
    }

    onViewRegistro(prestacion) {
        this.mapaCamasService.mainView.next(prestacion);
    }

    trackById(item) {
        return item.id;
    }

    ejecutar(prestacion: IPrestacion) {
        this.router.navigate(['rup', 'ejecucion', prestacion.id]);
    }


    onItemAccion(prestacion: IPrestacion, accion: RegistroHUDSItemAccion) {
        switch (accion) {
            case 'ver':
                this.onViewRegistro(prestacion);
                break;
            case 'continuar':
                this.ejecutar(prestacion);
                break;
            case 'romper-validacion':
                this.prestacionService.romperValidacion(prestacion).subscribe(() => {
                    this.ejecutar(prestacion);
                });
                break;
            case 'anular-validacion':
                this.prestacionService.invalidarPrestacion(prestacion).subscribe();
                this.id$.next(prestacion.id);
                break;
        }
    }

    onChangeFecha() {
        if (this.formulario.valid) {
            this.inProgress = true;
            this.refreshFecha$.next(true);
        }
    }

    onChangeTipoPrestacion() {
        this.inProgress = true;
        this.tipoPrestacion$.next(this.tipoPrestacion);
    }
}
