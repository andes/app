import { Component, OnInit, ViewChild } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap, take } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { HUDSService } from '../../../../../modules/rup/services/huds.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Router } from '@angular/router';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { NgForm } from '@angular/forms';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { cache } from '@andes/shared';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';

@Component({
    selector: 'app-nuevo-registro-salud',
    templateUrl: './nuevo-registro-salud.component.html'
})
export class NuevoRegistroSaludComponent implements OnInit {
    @ViewChild('formulario', { static: false }) ngForm: NgForm;

    public accionesEstado$: Observable<any>;
    public cama$: Observable<any>;
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
            if (moment(this.internacion.fechaIngreso).format('ss') === '00') {
                return moment(this.internacion.fechaIngreso).toDate();
            } else {
                return moment(this.internacion.fechaIngreso).subtract(1, 'minutes').toDate();
            }
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
        private router: Router,
        public motivosHudsService: MotivosHudsService

    ) { }

    ngOnInit() {
        this.cama$ = this.mapaCamasService.camaSelectedSegunView$.pipe(
            map(cama => cama)
        );
        this.accionesEstado$ = this.cama$.pipe(
            switchMap(cama => this.mapaCamasService.prestacionesPermitidas(of(cama))),
            cache()
        );
        this.dia = this.mapaCamasService.fecha;
        this.hora = moment(this.mapaCamasService.fecha).toDate();
        this.mapaCamasService.historialInternacion$.pipe(
            map(estados => {
                this.internacion.fechaIngreso = moment(estados[0]?.fechaIngreso || this.mapaCamasService.fecha);
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
            this.cama$.pipe(
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
                const nombreButton = this.router.url.includes('listado-internacion') ? 'Listado de internacion' : 'Mapa de camas';
                this.prestacionService.notificaRuta({ nombre: nombreButton, ruta: this.router.url });
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
        const token = this.motivosHudsService.getMotivo('rup-inicio-prestacion').pipe(
            switchMap(motivoH => {
                const paramsToken = {
                    usuario: this.auth.usuario,
                    organizacion: this.auth.organizacion,
                    paciente: paciente,
                    motivo: motivoH[0].key,
                    profesional: this.auth.profesional,
                    idTurno: null,
                    idPrestacion: prestacion.id
                };
                return this.hudsService.generateHudsToken(paramsToken);
            }));
        return token.pipe(
            tap(hudsToken => window.sessionStorage.setItem('huds-token', hudsToken.token))
        );
    }
}

