import {
    Plex
} from '@andes/plex';
import {
    Observable
} from 'rxjs/Rx';
import {
    Component,
    AfterViewInit,
    HostBinding
} from '@angular/core';
import {
    Auth
} from '@andes/auth';
import {
    Wizard
} from './../../classes/wizard.class';
import {
    AppComponent
} from './../../app.component';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;
    public turnos = '';
    public mpi = '';
    public rup = '';
    public mapaDeCamas = '';
    public solicitudes = '';
    public denied = false;
    public accessList: any = [];

    constructor(private plex: Plex, public auth: Auth, public appComponent: AppComponent) { }

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

            if (1 === 1) {
                // if (this.auth.getPermissions('mapaDeCamas:?').length > 0) {
                this.mapaDeCamas = 'mapaDeCamas';
                this.denied = false;
            }

            if (this.auth.getPermissions('solicitudes:?').length > 0) {
                this.solicitudes = 'solicitudes';
                this.denied = false;
            }

        });
        // Por ahora desactivamos el wizard!
        // let wizard = new Wizard('turnos');
        // wizard.addStep('Bienvenido al módulo de Agendas & Turnos', 'Este asistente lo ayudará a empezar a trabajar');
        // wizard.addStep('Crear la agenda', 'El primer paso es crear una agenda a través del Gestor de Agendas');
        // wizard.addStep('Publica la agenda', 'Luego la agenda debe publicarse para que esté lista para dar turnos');
        // wizard.addStep('Dar Turnos', 'Ahora pueden otorgarse turnos');
        // wizard.addStep('Acceso de profesionales', 'El personal de Salud puede acceder a los turnos dados desde el consultorio, incluso otorgar nuevos turnos');
        // wizard.addStep('Comenzar a usar', 'La aplicación ya está lista para que comiences a utilizarla');
        // wizard.render();
    }
}
