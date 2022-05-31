import { Component, OnInit, ViewChild } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { switchMap, map, tap, take } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { HUDSService } from '../../../../../modules/rup/services/huds.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Router } from '@angular/router';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { NgForm } from '@angular/forms';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'app-nuevo-registro-salud',
    templateUrl: './nuevo-registro-salud.component.html'
})
export class NuevoRegistroSaludComponent implements OnInit {
    @ViewChild('formulario', { static: false }) ngForm: NgForm;

    public accionesEstado$: Observable<any>;
    public paciente$: Observable<any>;
    public dia;
    public hora;
    public registro: any;
    public internacion = {
        fechaIngreso: null,
        fechaEgreso: null
    };

    get fechaMin() {
        return moment(this.internacion.fechaIngreso).startOf('day');
    }
    get fechaMax() {
        return moment(this.internacion.fechaEgreso).endOf('day');
    }
    get horaMin() {
        if (this.dia && moment(this.dia).startOf('day').diff(this.fechaMin) === 0) {
            return this.internacion.fechaIngreso;
        }
        return null;
    }
    get horaMax() {
        if (this.dia && moment(this.dia).endOf('day').diff(this.fechaMax) === 0) {
            if (this.internacion.fechaEgreso) {
                return this.internacion.fechaEgreso;
            }
            return moment();
        }
        return null;
    }

    constructor(
        private mapaCamasService: MapaCamasService,
        private auth: Auth,
        private hudsService: HUDSService,
        private prestacionService: PrestacionesService,
        private router: Router
    ) { }

    ngOnInit() {
        this.accionesEstado$ = this.mapaCamasService.prestacionesPermitidas(this.mapaCamasService.selectedCama);
        this.paciente$ = this.mapaCamasService.selectedCama;
        this.dia = this.mapaCamasService.fecha;
        this.hora = this.mapaCamasService.fecha;
        this.mapaCamasService.historialInternacion$.pipe(
            map(estados => {
                this.internacion.fechaIngreso = moment(estados[0]?.fechaIngreso);
                const egreso = estados.find(e => e.extras?.egreso)?.fecha;
                this.internacion.fechaEgreso = egreso ? moment(egreso) : undefined;
            })
        ).subscribe();
    }

    onIniciar($event) {
        if ($event.formValid) {
            const hora = moment(this.hora);
            const dateTime = moment(this.dia).hours(hora.hours()).minutes(hora.minutes()).toDate();
            const concepto = this.registro.parametros.concepto;
            this.paciente$.pipe(
                take(1),
                switchMap(cama => {
                    return this.crearPrestacion(cama, concepto, dateTime);
                }),
                switchMap((prestacion: IPrestacion) => {
                    return this.generarToken(prestacion.paciente, concepto, prestacion).pipe(
                        map(() => prestacion)
                    );
                })
            ).subscribe((prestacion) => {
                this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: `/mapa-camas/${this.mapaCamasService.ambito}` });
                this.router.navigate(['rup/ejecucion', prestacion.id]);
            });
        }
    }

    changeTime() {
        if (this.hora) {
            /**
             * Cada vez que 'dia' sea modificado, seteamos 'hora' con esta nueva fecha (dia, mes y año)
             * de manera de poder realizar los controles necesarios.
             */
            const hora = moment(this.hora);
            this.hora = moment(this.dia || undefined).hours(hora.hours()).minutes(hora.minutes());
        }
    }

    crearPrestacion(cama: ISnapshot, concepto, fecha: Date) {
        const nuevaPrestacion = this.prestacionService.inicializarPrestacion(
            cama.paciente, concepto, 'ejecucion', this.mapaCamasService.ambito, fecha
        );
        nuevaPrestacion.trackId = cama.idInternacion;
        nuevaPrestacion.unidadOrganizativa = cama.unidadOrganizativa;
        return this.prestacionService.post(nuevaPrestacion);
    }

    generarToken(paciente, concepto, prestacion) {
        return this.hudsService.generateHudsToken(
            this.auth.usuario,
            this.auth.organizacion,
            paciente,
            concepto.term,
            this.auth.profesional,
            null,
            prestacion.id
        ).pipe(
            tap(hudsToken => window.sessionStorage.setItem('huds-token', hudsToken.token))
        );
    }
}

