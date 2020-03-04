import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { RegistroNovedadesService } from '../../services/novedades/registro-novedades.service';
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
    public accessList: any = [];
    public provincia = LABELS.provincia;


    constructor(public auth: Auth, public appComponent: AppComponent, private plex: Plex,
        private registroNovedades: RegistroNovedadesService,
        private router: Router) { }

    ngAfterViewInit() {
        let params: any = {};
        window.setTimeout(() => {
            this.denied = true;
            if (this.auth.getPermissions('turnos:?').length > 0) {
                if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
                    this.turnos = 'gestor';
                    params.search = 'turnos';
                    this.registroNovedades.getAll(params).subscribe(
                        registros => {
                            this.novedadesTurnos = registros.length > 0;
                        },
                        (err) => {
                        }
                    );
                } else {
                    if (this.auth.getPermissions('turnos:darTurnos:?').length > 0) {
                        this.turnos = 'inicioTurnos';
                        params.search = 'turnos';
                        this.registroNovedades.getAll(params).subscribe(
                            registros => {
                                this.novedadesTurnos = registros.length > 0;
                            },
                            (err) => {
                            }
                        );
                    }
                }
                // this.turnos = 'turnos';
                this.denied = false;
            }

            if (this.auth.getPermissions('mpi:?').length > 0) {
                this.mpi = 'mpi';
                this.denied = false;
                params.search = 'mpi';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesMpi = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }

            if (this.auth.getPermissions('analytics:?').length > 0) {
                this.analytics = 'analytics';
                this.denied = false;
                params.search = 'analytics';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesAnalytics = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }

            if (this.auth.getPermissions('rup:?').length > 0) {
                this.rup = 'rup';
                this.denied = false;
                params.search = 'rup';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesRup = registros.length > 0;
                    },
                    (err) => {
                    }
                );
                params.search = 'huds';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesHuds = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }

            if (this.auth.check('internacion:mapaDeCamas')) {
                this.internacion = 'internacion';
                this.denied = false;
                params.search = 'mapaDeCamas';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesInternacion = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }
            if (this.auth.check('internacion:inicio')) {
                this.internacionEpicrisis = 'internacionEpicrisis';
                this.denied = false;
                params.search = 'internacion';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesInternacionEpicrisis = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }

            if (this.auth.getPermissions('solicitudes:?').length > 0) {
                this.solicitudes = 'solicitudes';
                params.search = 'solicitudes';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesSolicitudes = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }

            if (this.auth.check('prestamos:?')) {
                this.prestamosHC = 'prestamosHC';
                this.denied = false;
                params.search = 'prestamos';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesPrestamosHC = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }

            if (this.auth.check('dashboard:citas:ver') || this.auth.check('dashboard:top:ver')) {
                this.dashboard = true;
                params.search = 'dashboard';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesDashboard = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }
            if (this.auth.getPermissions('usuarios:?').length > 0) {
                this.usuarios = 'usuarios';
                this.denied = false;
                params.search = 'usuarios';
                this.registroNovedades.getAll(params).subscribe(
                    registros => {
                        this.novedadesUsuarios = registros.length > 0;
                    },
                    (err) => {
                    }
                );
            }
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
