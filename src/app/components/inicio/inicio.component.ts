import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Wizard } from './../../classes/wizard.class';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;
    public turnos = '';
    public mpi = '';
    public rup = '';
    public denied = false;
    public accessList: any = [];

    constructor(private plex: Plex, public auth: Auth) { }

    ngAfterViewInit() {
 
        let accessList = [];
        let menuList = [];

        // Cargo el array de permisos
        if (this.auth.getPermissions('turnos:?').length > 0) {
            this.turnos = 'turnos';
            accessList.push({label: 'CITAS: Agendas & Turnos', icon: 'calendar', route: '/citas/gestor_agendas'});
        }
        if (this.auth.getPermissions('mpi:?').length > 0) {
            this.mpi = 'mpi';
            accessList.push({label: 'MPI: Indice Maestro de Pacientes', icon: 'account-multiple-outline', route: '/mpi'});
        }

        if (this.auth.getPermissions('rup:?').length > 0) {
            this.rup = 'rup';
            accessList.push({label: 'RUP: Registro Universal de Prestaciones', icon: 'contacts', route: '/rup'});
        }

        if (accessList.length <= 0) {
            this.denied = true;
        }
        menuList.push({ label: 'Página principal', icon: 'home', route: '/inicio' });
        accessList.forEach((permiso) => {
            menuList.push(permiso);
        });
        menuList.push({ divider: true });
        menuList.push({ label: 'Cerrar Sesión', icon: 'logout', route: '/login' });

        // Actualizamos la lista de menú
        this.plex.updateMenu(menuList);


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
