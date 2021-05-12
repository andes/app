import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap, take, tap, pluck, catchError } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Auth } from '@andes/auth';
import { cache, notNull } from '@andes/shared';
import { Router } from '@angular/router';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { RegistroHUDSItemAccion } from './registros-huds-item/registros-huds-item.component';
import { IMAQEstado } from '../../interfaces/IMaquinaEstados';
import { ModalMotivoAccesoHudsService } from '../../../../../modules/rup/components/huds/modal-motivo-acceso-huds.service';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';

function arrayToSet(array, key, itemFn) {
    const listado = [];
    array.forEach(elem => {
        const item = itemFn(elem);
        if (Array.isArray(item)) {
            item.forEach(inside => {
                const index = listado.findIndex(i => i[key] === inside[key]);
                if (index < 0) {
                    listado.push(inside);
                }
            });
        } else {
            const index = listado.findIndex(i => i[key] === item[key]);
            if (index < 0) {
                listado.push(item);
            }
        }
    });
    return listado;
}

@Component({
    selector: 'app-registros-huds-detalle',
    templateUrl: './registros-huds-detalle.component.html'
})
export class RegistrosHudsDetalleComponent implements OnInit {
    public historial = new Subject();

    public historial$: Observable<any>;
    public historialFiltrado$: Observable<any>;

    public desde: Date;
    public hasta: Date;
    public tipoPrestacion;


    public desde$ = new BehaviorSubject(new Date());
    public hasta$ = new BehaviorSubject(new Date());
    public tipoPrestacion$ = new BehaviorSubject(null);

    public cama$ = this.mapaCamasService.selectedCama;
    public estadoCama$: Observable<IMAQEstado>;
    public accionesEstado$: Observable<any>;
    public prestacionesList$: Observable<any>;
    public min$: Observable<Date>;
    public max$: Observable<Date>;

    @Output() accion = new EventEmitter();

    public esProfesional = this.auth.profesional;
    public puedeVerHuds = false;
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

        this.desde$ = new BehaviorSubject(this.desde);
        this.hasta$ = new BehaviorSubject(this.hasta);

        this.puedeVerHuds = this.auth.check('huds:visualizacionHuds');

        this.historial$ = combineLatest(
            this.cama$,
            this.mapaCamasService.selectedPrestacion
        ).pipe(
            switchMap(([cama, prestacion]) => {
                const paciente = cama?.paciente || prestacion?.paciente;
                return this.motivoAccesoService.getAccessoHUDS(paciente as IPaciente);
            }),
            switchMap(({ paciente }) => {
                return this.getHUDS(paciente);
            }),
            map(prestaciones => {
                return prestaciones.filter(p => this.validadaCreadasPorMi(p));
            }),
            catchError((e) => {
                this.accion.emit(null);
                return [];
            }),
            cache()
        );

        this.min$ = this.mapaCamasService.historialInternacion$.pipe(
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
                    this.onChangeDesde();
                }
            })
        );


        this.max$ = this.mapaCamasService.historialInternacion$.pipe(
            map(movimientos => {
                const egreso = movimientos.find(m => m.extras && m.extras.egreso);
                if (egreso) {
                    this.hasta = egreso.fecha;
                    this.onChangeHasta();
                    return egreso.fecha;
                }
                return null;
            })
        );

        this.historialFiltrado$ = combineLatest(
            this.historial$,
            this.desde$,
            this.hasta$,
            this.tipoPrestacion$,
            this.min$,
        ).pipe(
            map(([prestaciones, desde, hasta, tipoPrestacion, min]) => {
                if (!desde) {
                    desde = moment().subtract(7, 'd').toDate();
                }
                desde = desde.getTime() < min.getTime() ? min : desde;
                desde = moment(desde);
                return prestaciones.filter((prestacion) => {
                    const fecha = moment(prestacion.ejecucion.fecha);
                    if (tipoPrestacion) {
                        return fecha.isSameOrBefore(hasta, 'd') && fecha.isSameOrAfter(desde, 'd') && tipoPrestacion.conceptId === prestacion.solicitud.tipoPrestacion.conceptId;
                    }
                    return fecha.isSameOrBefore(hasta, 'd') && fecha.isSameOrAfter(desde, 'd');
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
            map((prestaciones) => arrayToSet(prestaciones, 'conceptId', (item) => item.solicitud.tipoPrestacion))
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
        this.cama$.pipe(take(1)).subscribe((cama) => {
            this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: `/mapa-camas/mapa/${this.mapaCamasService.ambito}` });
            this.router.navigate(['/huds/paciente/' + cama.paciente.id]);
        });
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
        }
    }

    onChangeDesde() {
        this.desde$.next(this.desde);
    }

    onChangeHasta() {
        this.hasta$.next(this.hasta);
    }

    onChangeTipoPrestacion() {
        this.tipoPrestacion$.next(this.tipoPrestacion);
    }
}
