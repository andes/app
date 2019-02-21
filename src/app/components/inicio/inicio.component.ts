import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';

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
    public denied = false;
    public accessList: any = [];

    constructor(public auth: Auth, public appComponent: AppComponent) { }

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

            if (this.auth.getPermissions('rup:?').length > 0) {
                this.rup = 'rup';
                this.denied = false;
            }

            if (this.auth.getPermissions('internacion:?').length > 0) {
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

            if (this.auth.getPermissions('prestamos:?').length > 0) {
                this.prestamosHC = 'prestamosHC';
                this.denied = false;
            }
        });
    }
}
