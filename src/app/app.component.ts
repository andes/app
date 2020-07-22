import { CommonNovedadesService } from './components/novedades/common-novedades.service';
import { finalize } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server, cache } from '@andes/shared';
import { Auth } from '@andes/auth';
import { PROPERTIES } from './styles/properties';
import { WebSocketService } from './services/websocket.service';
import { HotjarService } from './shared/services/hotJar.service';
import { GoogleTagManagerService } from './shared/services/analytics.service';
import { AdjuntosService } from './modules/rup/services/adjuntos.service';
import { ModulosService } from './services/novedades/modulos.service';
import { Observable } from 'rxjs';

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
    private modulos$: Observable<any[]>;

    public loading = true;
    public tieneNovedades = false;

    constructor(
        public plex: Plex,
        public server: Server,
        public auth: Auth,
        public ws: WebSocketService,
        public hotjar: HotjarService,
        public analyticsService: GoogleTagManagerService,
        private commonNovedadesService: CommonNovedadesService,
        public adjuntos: AdjuntosService,
        private modulosService: ModulosService,
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

        this.auth.session().subscribe((sesion) => {
            if (sesion.permisos) {
                this.checkPermissions();
                this.loading = false;
            }
        });

        const token = this.auth.getToken();
        if (token) {
            this.ws.setToken(token);
            this.auth.setToken(token);
        } else {
            this.loading = true;
        }
    }

    public loggedIn() {
        return this.auth.getToken() !== undefined;
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


    public checkPermissions() {
        let modulos = [];
        this.menuList = [];
        this.menuList.push({ label: 'Página Principal', icon: 'home', route: '/inicio' });
        this.menuList.push({ label: 'Padrones', icon: 'magnify', route: '/puco' });
        if (this.auth.loggedIn()) {
            this.auth.organizaciones().subscribe(data => {
                if (data.length > 1) {
                    this.menuList = [{ label: 'Seleccionar Organización', icon: 'home', route: '/auth/select-organizacion' }, ...this.menuList];
                    this.plex.updateMenu(this.menuList);
                }
            });
        }
        this.modulos$ = this.modulosService.search({ activo: true }).pipe(cache());
        this.modulos$.subscribe(registros => {
            registros.forEach((modulo) => {
                modulo.permisos.forEach((permiso) => {
                    if (this.auth.getPermissions(permiso).length > 0) {
                        if (modulos.indexOf(modulo._id) === -1) {
                            modulos.push(modulo._id);
                            const menuOption = { label: `${modulo.nombre}: ${modulo.subtitulo}`, icon: `mdi ${modulo.icono}`, route: modulo.linkAcceso };
                            this.menuList.push(menuOption);
                        }
                    }
                });
            });
            if (modulos.length) {
                this.commonNovedadesService.setNovedadesSinFiltrar(modulos);
                this.commonNovedadesService.getNovedadesSinFiltrar().subscribe((novedades) => {
                    this.tieneNovedades = novedades.length > 0;
                });
            }
            this.menuList.push({ divider: true });
            this.menuList.push({ label: 'Cerrar Sesión', icon: 'logout', route: '/auth/logout' });
            this.plex.updateMenu(this.menuList);
        });
    }

    public getModulos() {
        return this.modulos$;
    }
}
