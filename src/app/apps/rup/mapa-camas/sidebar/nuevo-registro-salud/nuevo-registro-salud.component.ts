import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, pluck, map, tap, take } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { HUDSService } from '../../../../../modules/rup/services/huds.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Router } from '@angular/router';
import { ISnomedConcept } from '../../../../../modules/rup/interfaces/snomed-concept.interface';

@Component({
    selector: 'app-nuevo-registro-salud',
    templateUrl: './nuevo-registro-salud.component.html'
})
export class NuevoRegistroSaludComponent implements OnInit {
    public accionesEstado$: Observable<any>;
    public paciente$: Observable<any>;

    // Dejo la fecha en blanco para que el Profesional escriba una fecha cuente a conciencia.
    public fecha: Date = new Date();
    public hora: Date;
    public registro: any;


    constructor(
        private mapaCamasService: MapaCamasService,
        private auth: Auth,
        private hudsService: HUDSService,
        private prestacionService: PrestacionesService,
        private router: Router
    ) { }

    ngOnInit() {
        this.accionesEstado$ = this.mapaCamasService.prestacionesPermitidas(this.mapaCamasService.selectedCama);
        this.paciente$ = this.mapaCamasService.selectedCama.pipe(
            pluck('paciente')
        );
    }

    onIniciar($event) {
        if ($event.formValid) {
            const dateTime = moment(moment(this.fecha).format('MM/DD/YYYY') + ' ' + moment(this.hora).format('HH:mm')).toDate();
            const concepto = this.registro.parametros.concepto;
            this.paciente$.pipe(
                take(1),
                switchMap(paciente => {
                    return this.crearPrestacion(paciente, concepto, dateTime);
                }),
                switchMap(prestacion => {
                    return this.generarToken(prestacion.paciente, concepto, prestacion).pipe(
                        map(() => prestacion)
                    );
                })
            ).subscribe((prestacion) => {
                this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: '/internacion/mapa-camas' });
                this.router.navigate(['rup/ejecucion', prestacion.id]);
            });
        }

    }

    crearPrestacion(paciente, concepto, fecha: Date) {
        const nuevaPrestacion = this.prestacionService.inicializarPrestacion(
            paciente, concepto, 'ejecucion', 'internacion', fecha
        );
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
    // this.router.navigate(['rup/ejecucion', prestacion.id]);

