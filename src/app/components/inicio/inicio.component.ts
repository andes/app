import { CommonNovedadesService } from './../novedades/common-novedades.service';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { Router, ActivatedRoute } from '@angular/router';
import { setDimension } from '../../shared/services/analytics.service';
import { IModulo } from './../../interfaces/novedades/IModulo.interface';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit {
    @HostBinding('class.plex-layout')
    public denied = false;
    public loading = false;
    public accessList: any = [];
    public provincia = LABELS.provincia;
    public modulos: any = [];
    public secciones: any = [];
    public novedades: any[] = [];

    constructor(
        public auth: Auth,
        public appComponent: AppComponent,
        private plex: Plex,
        private commonNovedadesService: CommonNovedadesService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.plex.navVisible(true);
    }

    ngAfterViewInit() {
        if (this.auth.profesional) {
            // Google Analytics
            setDimension('profesional', this.auth.profesional);
        }
        window.setTimeout(() => {
            this.loading = true;
            this.appComponent.getModulos().subscribe(
                registros => {
                    registros.forEach((modulo: IModulo) => {
                        let tienePermiso = false;
                        if (modulo.activo) {
                            modulo.permisos.forEach((permiso) => {
                                if (!tienePermiso) {
                                    if (permiso === 'epidemiologia:?' && this.auth.profesional) {
                                        const submodulosPermitidos = modulo.submodulos.filter(x => x.permisos.some(y => this.auth.getPermissions(y).length > 0));
                                        if (!submodulosPermitidos.length) {
                                            // Eliminamos todos los submódulos de epidemiología excepto el principal
                                            modulo.submodulos.splice(1);
                                            modulo.principal = true;
                                            this.modulos.push(modulo);
                                        } else {
                                            tienePermiso = true;
                                            this.generarModulos(modulo);
                                        }
                                    } else {
                                        // El usuario tiene permiso?
                                        if (this.auth.getPermissions(permiso).length > 0) {
                                            tienePermiso = true;
                                            this.generarModulos(modulo);
                                        }
                                    }
                                }
                            });
                        }
                    });

                    // Hay módulos?
                    if (this.modulos.length) {

                        // Si hay módulos se oculta mensaje "No tenés permisos"
                        this.denied = false;

                        this.secciones = this.modulos.filter(x => (!x.principal && (!x.submodulos || !x.submodulos.length)));

                        // Se ordenan módulos
                        this.modulos.sort((a, b) => Number(a.orden) - Number(b.orden));

                        // Se ordenan submódulos
                        this.modulos.map(x => {
                            if (x.submodulos && x.submodulos.length > 0) {
                                if (x.submodulos.length > 4) {
                                    x.submodulos.main = x.submodulos.slice(0, 4);
                                    x.submodulos.secondary = x.submodulos.slice(4);
                                } else {
                                    x.submodulos.main = x.submodulos;
                                    x.submodulos.secondary = [];
                                }
                                return x.submodulos.sort((a, b) => a.orden - b.orden);
                            }
                        });

                        // Novedades?
                        const modulos = this.modulos.map(p => {
                            return p._id;
                        });
                        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe(novedades => {
                            modulos.forEach((moduloId) => {
                                this.novedades[moduloId] = novedades.filter(n => n.modulo && n.modulo._id === moduloId);
                            });
                        });
                    } else {
                        // Se muestra mensaje "No tenés permisos"
                        this.denied = true;
                    }

                    this.loading = false;

                    // Se quitan módulos sin submódulos
                    this.modulos = this.modulos.filter(x => x.principal);

                }
            );
        });
    }

    // genera los modulos y submodulos que puede ver el usuario en base a sus permisos
    generarModulos(modulo) {
        if (modulo.submodulos && modulo.submodulos.length > 0) {
            // Es Módulo
            modulo.principal = true;
            this.modulos.push(modulo);

            // Se generan Submódulos
            (modulo.submodulos as any) = modulo.submodulos.filter(x => x.permisos.some(y => this.auth.getPermissions(y).length > 0));

            if (!modulo.submodulos.length) {
                modulo.nombreSubmodulo = `Punto Inicio<br><b>${modulo.nombre}</b>`;
            }
        } else {
            // Es Sección
            this.modulos.push(modulo);
        }
    }

    redirect(caja, e: Event) {
        e.stopImmediatePropagation();
        e.preventDefault();
        const url: string = caja.linkAcceso;
        if (url.startsWith('http')) {
            // [TODO] Agregar parametro de configuracion, no siempre hay que exponer el token.
            const token = this.auth.getToken();
            window.open(`${url}?token=${token}`);
        } else {
            this.router.navigate([caja.linkAcceso]);
        }
    }

    irANovedades(modulo, e: Event) {
        e.stopImmediatePropagation();
        e.preventDefault();
        this.router.navigate(['/novedades', modulo], { relativeTo: this.route });
    }
}
