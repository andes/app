
import { finalize } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import { PROPERTIES } from './styles/properties';
import { WebSocketService } from './services/websocket.service';
import { HotjarService } from './shared/services/hotJar.service';

// import { RxSocket } from 'rx-socket.io-client';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
})

export class AppComponent {
    private initStatusCheck() {
        if (environment.APIStatusCheck) {
            setTimeout(() => {
                this.server.get('/core/status', { params: null, showError: false, showLoader: false }).pipe(
                    finalize(() => this.initStatusCheck()))
                    .subscribe(
                        (data) => this.plex.updateAppStatus(data),
                        (err) => this.plex.updateAppStatus({ API: 'Error' })
                    );
            }, 100000);
        } else {
            this.plex.updateAppStatus({ API: 'OK' });
        }
    }

    private menuList = [];

    public loading = true;

    public checkPermissions(): any {
        let accessList = [];
        this.menuList = [];

        if (this.auth.loggedIn()) {
            this.auth.organizaciones().subscribe(data => {
                if (data.length > 1) {
                    this.menuList = [{ label: 'Seleccionar Organización', icon: 'home', route: '/auth/select-organizacion' }, ...this.menuList];
                    this.plex.updateMenu(this.menuList);
                }
            });
        }
        // Cargo el array de permisos
        if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
            accessList.push({ label: 'CITAS: Gestor de Agendas y Turnos', icon: 'calendar', route: '/citas/gestor_agendas' });
        }
        if (this.auth.getPermissions('turnos:puntoInicio:?').length > 0) {
            accessList.push({ label: 'CITAS: Punto de Inicio', icon: 'calendar', route: '/citas/punto-inicio' });
        }

        if (this.auth.getPermissions('espaciosFisicos:?').length > 0) {
            accessList.push({ label: 'CITAS: Espacios Físicos', icon: 'cogs', route: 'tm/mapa_espacio_fisico' });
        }

        if (this.auth.getPermissions('mpi:?').length > 0) {
            accessList.push({ label: 'MPI: Indice Maestro de Pacientes', icon: 'account-multiple-outline', route: '/apps/mpi/busqueda' });
        }
        if (this.auth.getPermissions('auditoriaPacientes:?').length > 0) {
            accessList.push({ label: 'Auditoría MPI', icon: 'account-search', route: 'apps/mpi/auditoria' });
        }

        if (this.auth.getPermissions('rup:?').length > 0) {
            accessList.push({ label: 'RUP: Registro Universal de Prestaciones', icon: 'contacts', route: '/rup' });
        }

        let dato = this.auth.getPermissions('huds:?').length;
        if (this.auth.getPermissions('huds:?').length || this.auth.getPermissions('rup:?').length) {
            accessList.push({ label: 'HUDS: Visualizar por paciente', icon: 'file-tree', route: '/rup/huds' });
        }

        if (this.auth.getPermissions('reportes:?').length > 0) {
            accessList.push({ label: 'Reportes', icon: 'file-chart', route: '/reportes' });
        }

        if (this.auth.getPermissions('solicitudes:?').length > 0) {
            accessList.push({ label: 'Solicitudes', icon: 'mdi mdi-open-in-app', route: '/solicitudes' });
        }
        if (this.auth.getPermissions('usuarios:?').length > 0) {
            accessList.push({ label: 'Gestión de usuarios', icon: 'mdi mdi-account-key', route: '/gestor-usuarios/usuarios' });
        }
        if (this.auth.getPermissions('turnosPrestaciones:buscar').length > 0) {
            accessList.push({ label: 'Buscador de Turnos y Prestaciones', icon: 'table-search', route: '/buscador' });
        }

        if (this.auth.getPermissions('internacion:?').length > 0) {
            accessList.push({ label: 'Mapa de Camas', icon: 'mdi mdi-bed-empty', route: '/internacion/mapa-camas' });
        }
        if (this.auth.getPermissions('tm:organizacion:?').length > 0) {
            accessList.push({ label: 'Organizaciones', icon: 'cogs', route: '/tm/organizacion' });
        }
        if (this.auth.getPermissions('campania:?').length > 0) {
            accessList.push({ label: 'Campañas de Salud', icon: 'mdi mdi-radio-tower', route: '/campaniasSalud' });
        }
        // faltan permisos
        if (this.auth.getPermissions('formularioTerapeutico:?').length > 0) {
            accessList.push({ label: 'Formulario Terapéutico', icon: 'mdi mdi-needle', route: '/formularioTerapeutico' });
        }

        this.menuList.push({ label: 'Página Principal', icon: 'home', route: '/inicio' });
        this.menuList.push({ label: 'Padrones', icon: 'magnify', route: '/puco' });
        accessList.forEach((permiso) => {
            this.menuList.push(permiso);
        });
        this.menuList.push({ divider: true });
        this.menuList.push({ label: 'Cerrar Sesión', icon: 'logout', route: '/auth/logout' });

        // Actualizamos la lista de menú
        this.plex.updateMenu(this.menuList);
        return accessList;
    }

    constructor(
        public plex: Plex,
        public server: Server,
        public auth: Auth,
        public ws: WebSocketService,
        private hotjar: HotjarService
    ) {
        // Configura server. Debería hacerse desde un provider (http://stackoverflow.com/questions/39033835/angularjs2-preload-server-configuration-before-the-application-starts)
        server.setBaseURL(environment.API);

        // Inicializa la vista
        this.plex.updateTitle('ANDES | Apps de Salud');

        // Inicializa el chequeo de conectividad
        this.initStatusCheck();

        Object.keys(PROPERTIES).forEach(key => {
            document.documentElement.style.setProperty(`--${key}`, PROPERTIES[key]);
        });

        const token = this.auth.getToken();
        if (token) {
            // this.hotjar.initialize();
            this.ws.setToken(token);
            this.auth.session().subscribe(() => {
                // Inicializa el menú
                this.checkPermissions();
                this.loading = false;
            });
        } else {
            this.loading = true;
        }
    }

    public showRibbon() {
        return environment.environmentName === 'demo' || environment.environmentName === 'testing';
    }

    public ribbonLabel() {
        return environment.environmentName.toUpperCase();
    }

    public ribbonType() {
        switch (environment.environmentName) {
            case 'produccion':
                return 'info';
            case 'demo':
                return 'success';
            case 'testing':
                return 'warning';
            case 'development':
                return 'info';
        }
    }

}
