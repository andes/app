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
import { LaboratorioService } from 'projects/portal/src/app/services/laboratorio.service';
import { PacienteCacheService } from 'src/app/core/mpi/services/pacienteCache.service';

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
    public historialFiltrado$: Observable<any> = of([]);;
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
    private admisionHospitalariaConceptId = '32485007';

    @Output() accion = new EventEmitter();
    private laboratoriosSubject$ = new BehaviorSubject<any[]>([]);
    public laboratorios$ = this.laboratoriosSubject$.asObservable();
    public prestacionesUnidas$: Observable<any[]>;

    constructor(
        public mapaCamasService: MapaCamasService,
        private prestacionService: PrestacionesService,
        private auth: Auth,
        private router: Router,
        private motivoAccesoService: ModalMotivoAccesoHudsService,
        private huds: HUDSService,
        private laboratorioService: LaboratorioService,
        private pacienteCacheService: PacienteCacheService
    ) { }

    ngOnInit() {
        this.puedeVerHuds = this.auth.check('huds:visualizacionHuds');
        let estaPrestacionId; // id de prestacion correspondiente a la internacion actual
        this.desde = moment().subtract(3, 'days').toDate();
        this.hasta = moment().toDate();

        this.token$ = combineLatest([
            this.cama$,
            this.mapaCamasService.selectedPrestacion,
            this.mapaCamasService.resumenInternacion$,
        ]).pipe(
            map(([cama, prestacion, resumen]) => {
                if (cama?.paciente && cama.paciente === this.paciente
                    || prestacion?.paciente && prestacion.paciente === this.paciente ||
                    resumen?.paciente && resumen.paciente === this.paciente) {
                    return null;
                }
                this.inProgress = true;
                return [cama, prestacion, resumen];
            }),
            notNull(),
            switchMap(([cama, prestacion, resumen]) => {
                this.paciente = cama.paciente || prestacion.paciente || resumen.paciente;
                return this.motivoAccesoService.getAccessoHUDS(this.paciente as IPaciente);
            }),
        );

        this.token$.subscribe({
            next: token => {
                if (token) {
                    this.permisoHuds$.next(true);
                }
            },
            error: (error) => {
                this.permisoHuds$.next(false);
                this.accion.emit({ accion: 'volver' });
            }
        });

        this.historial$ = combineLatest([
            this.cama$,
            this.mapaCamasService.selectedPrestacion,
            this.mapaCamasService.resumenInternacion$,
            this.mapaCamasService.historialInternacion$,
            this.permisoHuds$,
            this.refreshFecha$
        ]).pipe(
            switchMap(([cama, prestacion, resumen, movimientos, permisoHuds, refresh]) => {
                if (!permisoHuds) {
                    return of(null);
                }
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

                if (this.hasta > this.max) { // paciente ya egresado
                    this.hasta = this.max;
                    this.desde = moment(this.hasta).subtract(3, 'days').toDate();
                }
                if (this.desde < this.min) {
                    this.desde = this.min;
                }
                if (this.mapaCamasService.capa === 'estadistica') {
                    estaPrestacionId = cama.idInternacion || prestacion.id;
                } else {
                    estaPrestacionId = cama.idInternacion || resumen.id;
                }
                return this.getHUDS(this.paciente);
            }),
            notNull(),
            map(prestaciones => {
                this.inProgress = false;
                // descarta la propia prestación de la internación actual
                return prestaciones.filter(p => p.cda_id ? true : this.validadaCreadasPorMi(p) && p.id !== estaPrestacionId);
            }),
            catchError((e) => {
                this.inProgress = false;
                this.permisoHuds$.next(false);
                this.accion.emit({ accion: 'volver' });
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

        this.laboratorioService.getProtocolos(this.paciente.id)
            .subscribe(laboratorios => {
                this.laboratoriosSubject$.next(laboratorios[0]?.Data || []);
            });

        this.prestacionesUnidas$ = combineLatest([this.historialFiltrado$, this.laboratorios$]).pipe(
            map(([historial, laboratorios]) => {
                return [...historial, ...laboratorios];
            })
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
        return this.prestacionService.getByPaciente(paciente.id, true, this.desde, this.hasta).pipe(
            map((prestaciones) => {
                return prestaciones.sort((a, b) => {
                    return b.solicitud.fecha.getTime() - a.solicitud.fecha.getTime();
                });
            }),
            concatMap((prestaciones) => {
                // TODO! Cuando se extienda el uso del token de esta manera en el resto de la app, Refactorear este codigo ya que esta replicado varias veces!!
                const newElement = {
                    usuario: this.auth.usuario.id,
                    paciente: paciente.id,
                    organizacion: this.auth.organizacion.id
                };
                let hudsTokenArray: any = this.huds.getHudsToken() || '[]';
                let index = -1;

                if (hudsTokenArray[0] === '[') {
                    hudsTokenArray = JSON.parse(hudsTokenArray);
                    index = hudsTokenArray.findIndex((element: typeof newElement) => element.usuario === newElement.usuario && element.paciente === newElement.paciente && element.organizacion === newElement.organizacion);
                }
                if (index === -1) {
                    return of([]);
                }
                return this.prestacionService.getCDAByPaciente(paciente.id, hudsTokenArray[index].token).pipe(map((results) => {
                    return [...results, ...prestaciones];
                }));
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
            case 'verProtocolo':
                this.onViewRegistro(prestacion);
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
