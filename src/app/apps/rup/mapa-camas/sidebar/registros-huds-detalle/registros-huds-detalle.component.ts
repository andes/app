import { Auth } from '@andes/auth';
import { arrayToSet, cache, notNull } from '@andes/shared';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { HUDSService } from 'src/app/modules/rup/services/huds.service';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { ModalMotivoAccesoHudsService } from '../../../../../modules/rup/components/huds/modal-motivo-acceso-huds.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { IMAQEstado } from '../../interfaces/IMaquinaEstados';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { RegistroHUDSItemAccion } from './registros-huds-item/registros-huds-item.component';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-registros-huds-detalle',
    templateUrl: './registros-huds-detalle.component.html'
})
export class RegistrosHudsDetalleComponent implements OnInit {
    @ViewChild('formulario', { static: true }) formulario: NgForm;
    public permisoHuds$ = new BehaviorSubject<boolean>(false);
    public refreshFecha$ = new BehaviorSubject(null);
    public tipoPrestacion$ = new BehaviorSubject(null);
    public id$ = new BehaviorSubject(null);

    public historial$: Observable<any>;
    public historialFiltrado$: Observable<any>;
    public estadoCama$: Observable<IMAQEstado>;
    public accionesEstado$: Observable<any>;
    public prestacionesList$: Observable<any>;
    public cama$: Observable<ISnapshot> = this.mapaCamasService.selectedCama;
    public token$: Observable<any>;

    public desde: Date;
    public hasta: Date;
    public min: Date;
    public max: Date;
    public tipoPrestacion;
    public inProgress = true;
    public prestacionesEliminadas = [];
    public idOrganizacion = this.auth.organizacion.id;
    public paciente;
    public esProfesional = this.auth.profesional;
    public puedeVerHuds = false;
    public permitir: boolean;
    private admisionHospitalariaConceptId = '32485007';

    @Output() accion = new EventEmitter();


    constructor(
        private mapaCamasService: MapaCamasService,
        private prestacionService: PrestacionesService,
        private auth: Auth,
        private router: Router,
        private motivoAccesoService: ModalMotivoAccesoHudsService,
        private huds: HUDSService
    ) { }

    ngOnInit() {
        this.puedeVerHuds = this.auth.check('huds:visualizacionHuds');
        let estaPrestacionId; // id de prestacion correspondiente a la internacion actual
        this.desde = moment().subtract(3, 'days').toDate();
        this.hasta = moment().toDate();
        this.permitir = true;
        this.token$ = combineLatest([
            this.cama$,
            this.mapaCamasService.selectedPrestacion,
            this.mapaCamasService.resumenInternacion$,
            this.mapaCamasService.historialInternacion$,
        ]).pipe(
            switchMap(([cama, prestacion, resumen]) => {
                this.permisoHuds$.next(false);
                this.paciente = cama.paciente || prestacion.paciente || resumen.paciente;
                return this.motivoAccesoService.getAccessoHUDS(this.paciente as IPaciente);
            })
        );

        this.token$.subscribe({
            next: token => {
                this.permisoHuds$.next(true);
            },
            error: (error) => {
                this.permitir = false;
                this.permisoHuds$.next(false);
                this.accion.emit({ accion: 'volver' });

            }
        });

        this.historial$ = combineLatest([
            this.cama$,
            this.mapaCamasService.historialInternacion$,
            this.mapaCamasService.selectedPrestacion,
            this.mapaCamasService.resumenInternacion$,
            this.refreshFecha$,
        ]).pipe(
            switchMap(([cama, movimientos, prestacion, resumen, refresh]) => {
                let min;
                let max;
                if (prestacion?.id) { // listado
                    min = prestacion.ejecucion.fecha;
                    max = prestacion.ejecucion.registros[1]?.valor.InformeEgreso.fechaEgreso || new Date();
                } else if (resumen?.id) { // listado
                    min = resumen.fechaIngreso;
                    max = resumen.fechaEgreso || new Date();
                } else { // mapa de camas
                    min = movimientos.find(m => m.extras && m.extras.ingreso).fecha;
                    max = movimientos.find(m => m.extras && m.extras.egreso)?.fecha || new Date();
                }
                this.min = moment(min).startOf('day').toDate();
                this.max = moment(max).endOf('day').toDate();
                if (this.mapaCamasService.capa === 'estadistica') {
                    estaPrestacionId = cama.idInternacion || prestacion.id;
                } else {
                    estaPrestacionId = cama.idInternacion || resumen.id;
                }
                return this.getHUDS(this.paciente);
            }),
            map(prestaciones => {
                // descarta la propia prestación de la internación actual
                return prestaciones.filter(p => p.cda_id ? true : this.validadaCreadasPorMi(p) && p.id !== estaPrestacionId);
            }),
            catchError((e) => {
                this.accion.emit(null);
                return [];
            }),
            cache()
        );

        this.historialFiltrado$ = combineLatest([
            this.historial$,
            this.tipoPrestacion$,
            this.id$
        ]).pipe(
            map(([prestaciones, tipoPrestacion, idPrestacion]) => {
                if (idPrestacion) {
                    this.prestacionesEliminadas.push(idPrestacion);
                }
                this.inProgress = false;
                return prestaciones.filter((registro) => {
                    const fecha = moment(registro.ejecucion?.fecha || registro.fecha);
                    const conceptId = registro.solicitud?.tipoPrestacion.conceptId || registro.prestacion.snomed.conceptId;
                    const tipoPrestacionValida = !tipoPrestacion || tipoPrestacion.conceptId === conceptId;
                    const noEsInternacion = conceptId !== this.admisionHospitalariaConceptId;
                    const fechaValida = fecha.isSameOrBefore(this.hasta, 'd') && fecha.isSameOrAfter(this.desde, 'd');
                    const organizacion = registro.solicitud?.organizacion || registro.prestacion.organizacion;

                    if (this.mapaCamasService.capa === 'estadistica') {
                        const organizacionValida = organizacion?.id === this.idOrganizacion;
                        return fechaValida && noEsInternacion && tipoPrestacionValida && organizacionValida && !this.prestacionesEliminadas.some(id => id === registro.id);
                    } else {
                        return fechaValida && noEsInternacion && tipoPrestacionValida && !this.prestacionesEliminadas.some(id => id === registro.id);
                    }
                }).sort((pres1, pres2) => {
                    // Ordenamos las prestaciones junto con los CDAs de forma descendente.
                    const fechaPrestacion1 = moment(pres1.ejecucion?.fecha || pres1.fecha);
                    const fechaPrestacion2 = moment(pres2.ejecucion?.fecha || pres2.fecha);
                    return fechaPrestacion2.diff(fechaPrestacion1);
                });
            }),
            cache()
        );

        this.estadoCama$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getEstadoCama(cama)));
        this.accionesEstado$ = this.estadoCama$.pipe(
            notNull(),
            map(estado => estado.acciones.filter(acc => acc.tipo === 'nuevo-registro'))
        );

        this.prestacionesList$ = this.historial$.pipe(
            map(prestaciones => prestaciones = arrayToSet(prestaciones, 'conceptId', (item) => item.solicitud ? item.solicitud.tipoPrestacion : item.prestacion.snomed))
        );
    }

    validadaCreadasPorMi(prestacion) {
        if (prestacion.estados) {
            const ejecutada = prestacion.estados.some(e => e.tipo === 'ejecucion');
            const estadoPrestacion = prestacion.estados[prestacion.estados.length - 1];
            const esValidada = estadoPrestacion.tipo === 'validada';
            const createdByMe = estadoPrestacion.createdBy.id === this.auth.usuario.id;
            return ejecutada && (esValidada || createdByMe);
        } else {
            return true;
        }
    }

    esEjecucion(prestacion) {
        if (prestacion.estados) {
            const estadoPrestacion = prestacion.estados[prestacion.estados.length - 1];
            const esEjecucion = estadoPrestacion.tipo === 'ejecucion';
            return esEjecucion;
        }
    }

    verHuds() {
        this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: `/mapa-camas/mapa/${this.mapaCamasService.ambito}` });
        this.router.navigate(['/huds/paciente/' + this.paciente.id]);
    }

    getHUDS(paciente): Observable<any> {
        if (this.permitir) {
            return this.prestacionService.getByPaciente(paciente.id, true, this.desde, this.hasta).pipe(
                map((prestaciones) => {
                    return prestaciones.sort((a, b) => {
                        return b.solicitud.fecha.getTime() - a.solicitud.fecha.getTime();
                    });
                }),
                concatMap((prestaciones) => {
                    const token = this.huds.getHudsToken();
                    return this.prestacionService.getCDAByPaciente(paciente.id, token).pipe(map((results) => {
                        return [...results, ...prestaciones];
                    }));
                })
            );
        }
        return of([]);
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
