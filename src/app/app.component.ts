import { environment } from './../environments/environment';
import { Component, OnInit, ModuleWithProviders } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';

// import { RxSocket } from 'rx-socket.io-client';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
})

export class AppComponent {
    private initStatusCheck() {
        // if (environment.APIStatusCheck) {
        //     setTimeout(() => {
        //         this.server.get('/core/status', { params: null, showError: false, showLoader: false })
        //             .finally(() => this.initStatusCheck())
        //             .subscribe(
        //                 (data) => this.plex.updateAppStatus(data),
        //                 (err) => this.plex.updateAppStatus({ API: 'Error' })
        //             );
        //     }, 2000);
        // } else {
        //     this.plex.updateAppStatus({ API: 'OK' });
        // }
    }

    private menuList = [];
    public checkPermissions(): any {
        let accessList = [];
        this.menuList = [];

        if (this.auth.loggedIn()) {
            this.auth.organizaciones().subscribe(data => {
                if (data.length > 1) {
                    this.menuList = [{ label: 'Seleccionar organización', icon: 'home', route: '/selectOrganizacion' }, ...this.menuList];
                    this.plex.updateMenu(this.menuList);
                }
            });
        }
        // Cargo el array de permisos
        if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
            accessList.push({ label: 'CITAS: Gestor de Agendas y Turnos', icon: 'calendar', route: '/citas/gestor_agendas' });
        }
        if (this.auth.getPermissions('turnos:puntoInicio:?').length > 0) {
            accessList.push({ label: 'CITAS: Punto de Inicio', icon: 'calendar', route: '/puntoInicioTurnos' });
        }
        if (this.auth.getPermissions('mpi:?').length > 0) {
            accessList.push({ label: 'MPI: Indice Maestro de Pacientes', icon: 'account-multiple-outline', route: '/mpi' });
        }

        if (this.auth.getPermissions('rup:?').length > 0) {
            accessList.push({ label: 'RUP: Registro Universal de Prestaciones', icon: 'contacts', route: '/rup' });
        }

        if (this.auth.getPermissions('reportes:?').length > 0) {
            accessList.push({ label: 'Reportes', icon: 'file-chart', route: '/reportes' });
        }

        if (this.auth.getPermissions('solicitudes:?').length > 0) {
            accessList.push({ label: 'Solicitudes', icon: 'mdi mdi-open-in-app', route: '/solicitudes' });
        }

        this.menuList.push({ label: 'Página principal', icon: 'home', route: '/inicio' });

        accessList.forEach((permiso) => {
            this.menuList.push(permiso);
        });
        this.menuList.push({ divider: true });
        this.menuList.push({ label: 'Cerrar Sesión', icon: 'logout', route: '/login' });

        // Actualizamos la lista de menú
        this.plex.updateMenu(this.menuList);
        return accessList;
    }

    constructor(public plex: Plex, public server: Server, public auth: Auth) {
        // Configura server. Debería hacerse desde un provider (http://stackoverflow.com/questions/39033835/angularjs2-preload-server-configuration-before-the-application-starts)
        server.setBaseURL(environment.API);

        // Inicializa el menu
        this.checkPermissions();

        // Inicializa la vista
        this.plex.updateTitle('ANDES | Apps Neuquinas de Salud');

        // Inicializa el chequeo de conectividad
        this.initStatusCheck();
    }
}
