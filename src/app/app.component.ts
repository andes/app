import { CommonNovedadesService } from './components/novedades/common-novedades.service';
import { finalize } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server, cacheStorage } from '@andes/shared';
import { Auth } from '@andes/auth';
import { PROPERTIES } from './styles/properties';
import { WebSocketService } from './services/websocket.service';
import { HotjarService } from './shared/services/hotJar.service';
import { GoogleTagManagerService } from './shared/services/analytics.service';
import { AdjuntosService } from './modules/rup/services/adjuntos.service';
import { ModulosService } from './services/novedades/modulos.service';
import { ProfesionalService } from './services/profesional.service';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app',
    templateUrl: './app.component.html',
})

export class AppComponent {
    public profesional$: Observable<any>;
    public formacionGrado;
    public profesional;
    public hoy = new Date();
    public foto: any;
    public tieneFoto = false;
    private listadoActual: any[];
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

    public columns = [
        {
            key: 'profesion',
            label: 'Profesión',
        },
        {
            key: 'matricula',
            label: 'Matrícula',
        },
        {
            key: 'vencimiento',
            label: 'Vencimiento',
        },
        {
            key: 'estado',
            label: 'Estado',
        }
    ];

    private menuList = [];
    private modulos$: Observable<any[]>;

    // private loading = true;
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
        private profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,
    ) {
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
            }
            this.profesionalService.getProfesional({ id: this.auth.profesional }).subscribe(
                profesional => {
                    this.formacionGrado = profesional[0].formacionGrado;
                    this.profesional = profesional;
                });
            this.profesionalService.getFoto({ id: this.auth.profesional }).subscribe(resp => {
                if (resp) {
                    this.foto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                    this.tieneFoto = true;
                }
            });
        });

        const token = this.auth.getToken();
        if (token) {
            this.ws.setToken(token);
            this.auth.setToken(token);
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
        const modulos = [];
        const modulosNovedades = [];
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
        this.modulos$ = this.modulosService.search({ activo: true }).pipe(
            cacheStorage('modulos-v1')
        );

        this.modulos$.subscribe(registros => {
            registros.forEach((modulo) => {
                modulo.permisos.forEach((permiso, index) => {
                    if (this.auth.getPermissions(permiso).length > 0) {
                        if (modulos.indexOf(modulo._id) === -1) {

                            modulosNovedades.push(modulo._id);
                            if (modulo.submodulos && modulo.submodulos.length > 0) {
                                modulo.submodulos = modulo.submodulos.filter(x => this.auth.getPermissions(x.permisos[0]).length > 0);
                                modulo.submodulos.forEach((submodulo, key) => {
                                    modulos.push(submodulo._id);
                                    const menuOptionSub = { id: key, label: `${modulo.nombre}: ${submodulo.nombre.replace(/<[^>]*>?/gm, ' ').replace('- ', '')}`, icon: `${submodulo.icono}`, route: submodulo.linkAcceso };
                                    if (this.menuList.findIndex(x => x.label === menuOptionSub.label) === -1) {
                                        this.menuList.push(menuOptionSub);
                                    }
                                });
                            } else {
                                modulos.push(modulo._id);
                                const menuOption = { id: index, label: `${modulo.nombre}: ${modulo.subtitulo}`, icon: `${modulo.icono}`, route: modulo.linkAcceso };
                                this.menuList.push(menuOption);
                            }
                        }
                    }
                });
            });
            if (modulosNovedades.length) {
                this.commonNovedadesService.setNovedadesSinFiltrar(modulosNovedades);
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

    verificarEstado(formacionGrado) {
        if (!formacionGrado.matriculado && this.hoy < formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) {
            return 'suspendida';
        } else {
            if (this.hoy > formacionGrado.matriculacion[formacionGrado.matriculacion.length - 1].fin) {
                return 'vencida';
            } else {
                return 'vigente';
            }
        }
    }
}
