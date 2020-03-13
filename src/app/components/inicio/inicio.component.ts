import { ModulosService } from './../../services/novedades/modulo.service';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { NovedadesService } from '../../services/novedades/novedades.service';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;
    public turnos = '';
    public novedadesTurnos = false;
    public mpi = '';
    public novedadesMpi = false;
    public rup = '';
    public novedadesRup = false;
    public novedadesHuds = false;
    public internacion = '';
    public novedadesInternacion = false;
    public internacionEpicrisis = '';
    public novedadesInternacionEpicrisis = false;
    public solicitudes = '';
    public novedadesSolicitudes = false;
    public prestamosHC = '';
    public novedadesPrestamosHC = false;
    public dashboard = false;
    public novedadesDashboard = false;
    public analytics = '';
    public novedadesAnalytics = false;
    public usuarios = '';
    public novedadesUsuarios = false;
    public denied = false;
    public loading = false;
    public accessList: any = [];
    public provincia = LABELS.provincia;
    public cajasModulos: any = [];


    constructor(public auth: Auth, public appComponent: AppComponent, private plex: Plex,
        private registroNovedades: NovedadesService,
        private ModulosService: ModulosService,
        private router: Router) { }

    ngAfterViewInit() {
        let params: any = {};
        let paramsModulos: any = {};
        window.setTimeout(() => {
            this.loading = true;
            let permisos = this.auth.getPermissions('?');
            if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
                permisos.push("turnos:planificarAgenda");
            }
            if (this.auth.getPermissions('turnos:darTurnos:?').length > 0) {
                permisos.push("turnos:darTurnos");
            }
            if (this.auth.getPermissions('internacion:mapaDeCamas:?').length > 0) {
                permisos.push("internacion:mapaDeCamas");
            }
            if (this.auth.getPermissions('internacion:inicio:?').length > 0) {
                permisos.push("internacion:inicio");
            }
            paramsModulos.permisos = permisos;
            this.ModulosService.get(paramsModulos).subscribe(
                registros => {
                    this.cajasModulos = registros;
                    if (registros.length) {
                        this.denied = false;
                    } else {
                        this.denied = true;
                    }
                    this.loading = false;
                },
                (err) => {
                }
            );;

        });
    }

    anlytics() {
        const token = this.auth.getToken();
        window.location.assign(`https://analytics.andes.gob.ar/auth/login?token=${token}`);
    }

    irANovedades(modulo) {
        this.router.navigate(['novedades'], { state: { modulo: modulo } });
    }
}
