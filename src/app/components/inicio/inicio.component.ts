import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;
    public turnos = '';
    public mpi = '';
    public rup = '';
    public internacion = '';
    public internacionEpicrisis = '';
    public solicitudes = '';
    public prestamosHC = '';
    public dashboard = false;
    public analytics = '';
    public usuarios = '';
    public denied = false;
    public accessList: any = [];
    public provincia = LABELS.provincia;


    constructor(public auth: Auth, public appComponent: AppComponent, private plex: Plex) { }

    ngAfterViewInit() {
        window.setTimeout(() => {
            this.denied = true;
            if (this.auth.getPermissions('turnos:?').length > 0) {
                if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
                    this.turnos = 'gestor';
                } else {
                    if (this.auth.getPermissions('turnos:darTurnos:?').length > 0) {
                        this.turnos = 'inicioTurnos';
                    }
                }
                // this.turnos = 'turnos';
                this.denied = false;
            }

            if (this.auth.getPermissions('mpi:?').length > 0) {
                this.mpi = 'mpi';
                this.denied = false;
            }

            if (this.auth.getPermissions('analytics:?').length > 0) {
                this.analytics = 'analytics';
                this.denied = false;
            }

            if (this.auth.getPermissions('rup:?').length > 0) {
                this.rup = 'rup';
                this.denied = false;
            }

            if (this.auth.check('internacion:mapaDeCamas')) {
                this.internacion = 'internacion';
                this.denied = false;
            }
            if (this.auth.check('internacion:inicio')) {
                this.internacionEpicrisis = 'internacionEpicrisis';
                this.denied = false;
            }

            if (this.auth.getPermissions('solicitudes:?').length > 0) {
                this.solicitudes = 'solicitudes';
            }

            if (this.auth.check('prestamos:?')) {
                this.prestamosHC = 'prestamosHC';
                this.denied = false;
            }

            if (this.auth.check('dashboard:citas:ver') || this.auth.check('dashboard:top:ver')) {
                this.dashboard = true;
            }
            if (this.auth.getPermissions('usuarios:?').length > 0) {
                this.usuarios = 'usuarios';
                this.denied = false;
            }
        });
    }

    anlytics() {
        const token = this.auth.getToken();
        window.location.assign(`https://analytics.andes.gob.ar/auth/login?token=${token}`);
    }
}
