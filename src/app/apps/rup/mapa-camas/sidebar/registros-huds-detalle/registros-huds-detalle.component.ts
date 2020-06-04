import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, switchMap, take, tap, pluck } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { HUDSService } from '../../../../../modules/rup/services/huds.service';
import { Auth } from '@andes/auth';
import { cache, Observe, notNull } from '@andes/shared';
import { Router } from '@angular/router';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { RegistroHUDSItemAccion } from './registros-huds-item/registros-huds-item.component';
import { IMAQEstado } from '../../interfaces/IMaquinaEstados';

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

    @Observe() public desde: Date;
    @Observe() public hasta: Date;
    @Observe() public tipoPrestacion;

    public desde$: Observable<Date>;
    public hasta$: Observable<Date>;
    public tipoPrestacion$: Observable<any>;

    public cama$ = this.mapaCamasService.selectedCama;
    public estadoCama$: Observable<IMAQEstado>;
    public accionesEstado$: Observable<any>;
    public prestacionesList$: Observable<any>;

    @Output() accion = new EventEmitter();

    public esProfesional = this.auth.profesional;

    constructor(
        private mapaCamasService: MapaCamasService,
        private prestacionService: PrestacionesService,
        private auth: Auth,
        private hudsService: HUDSService,
        private router: Router
    ) { }

    ngOnInit() {
        this.desde = moment().subtract(7, 'd');
        this.hasta = moment();

        this.historial$ = this.cama$.pipe(
            switchMap(cama => {
                return this.hudsToken(cama.paciente).pipe(map(() => cama.paciente));
            }),
            switchMap(paciente => {
                return this.getHUDS(paciente);
            }),
            map(prestaciones => {
                return prestaciones.filter(p => p.solicitud.ambitoOrigen === 'internacion');
            }),
            map(prestaciones => {
                return prestaciones.filter(p => this.validadaCreadasPorMi(p));
            }),
            cache()
        );

        this.historialFiltrado$ = combineLatest(
            this.historial$,
            this.desde$,
            this.hasta$,
            this.tipoPrestacion$
        ).pipe(
            map(([prestaciones, desde, hasta, tipoPrestacion]) => {
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
        const estadoPrestacion = prestacion.estados[prestacion.estados.length - 1];
        const esValidada = estadoPrestacion.tipo === 'validada';
        const createdByMe = estadoPrestacion.createdBy.id === this.auth.usuario.id;
        return esValidada || createdByMe;
    }

    esEjecucion(prestacion) {
        const estadoPrestacion = prestacion.estados[prestacion.estados.length - 1];
        const esEjecucion = estadoPrestacion.tipo === 'ejecucion';
        return esEjecucion;
    }

    verHuds() {
        this.cama$.pipe(take(1)).subscribe((cama) => {
            this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: '/internacion/mapa-camas' });
            this.router.navigate(['/rup/huds/paciente/' + cama.paciente.id]);
        });
    }

    getHUDS(paciente) {
        return this.prestacionService.getByPaciente(paciente.id, true);
    }

    hudsToken(paciente) {
        const motivo = 'Internacion';
        return this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, motivo, this.auth.profesional, null, null).pipe(
            tap((hudsToken) => {
                window.sessionStorage.setItem('huds-token', hudsToken.token);
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
}
