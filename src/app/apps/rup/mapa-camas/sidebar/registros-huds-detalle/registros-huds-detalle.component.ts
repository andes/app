import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, map, switchMap, take, tap } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { HUDSService } from '../../../../../modules/rup/services/huds.service';
import { Auth } from '@andes/auth';
import { cache, Observe } from '@andes/shared';
import { Router } from '@angular/router';

@Component({
    selector: 'app-registros-huds-detalle',
    templateUrl: './registros-huds-detalle.component.html',
})

export class RegistrosHudsDetalleComponent implements OnInit {
    public historial = new Subject();

    public historial$: Observable<any>;
    public historialFiltrado$: Observable<any>;

    @Observe() public desde: Date;
    @Observe() public hasta: Date;

    public desde$: Observable<Date>;
    public hasta$: Observable<Date>;

    public cama$ = this.mapaCamasService.selectedCama;

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
            this.hasta$
        ).pipe(
            map(([prestaciones, desde, hasta]) => {
                return prestaciones.filter((prestacion) => {
                    const fecha = moment(prestacion.ejecucion.fecha);
                    return fecha.isSameOrBefore(hasta, 'd') && fecha.isSameOrAfter(desde, 'd');
                });
            })
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

    ejecutar(prestacion) {
        this.router.navigate(['rup', 'ejecucion', prestacion.id]);
    }
}
