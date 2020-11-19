import { CommonNovedadesService } from './../novedades/common-novedades.service';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { Router, ActivatedRoute } from '@angular/router';
import { setDimension } from '../../shared/services/analytics.service';
import { IModulo } from './../../interfaces/novedades/IModulo.interface';
import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit {
    @HostBinding('class.plex-layout')
    public denied = false;
    public loading = false;
    public provincia = LABELS.provincia;
    public accessList: any = [];
    public modulos: any = [];
    public secciones: any = [];
    public novedades: any[] = [];
    public modulosUsuario: any[] = [];
    public editarModulos = true;


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
                                    // El usuario tiene permiso?
                                    if (this.auth.getPermissions(permiso).length > 0) {
                                        tienePermiso = true;
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
                        let modulos = this.modulos.map(p => {
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

                    this.modulos = this.modulos.filter(x => x.submodulos && x.submodulos.length > 0);
                    this.modulosUsuario = this.getModulosUsuario();

                }, (err) => {
                }
            );
        });
    }

    getModulosUsuario() {
        const modulos = JSON.parse(localStorage.getItem('modulos-usuario'));
        if (modulos && modulos.some(x => x.icono)) {
            return modulos;
        } else {
            return [];
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


    drop(event: CdkDragDrop<any[]>) {
        if (event.container.data.length === 6) {
            return;
        }
        // if (event.previousContainer === event.container) {
        // } else {
        if (event.container.data.findIndex(x => x.icono === event.previousContainer.data[event.previousIndex].icono) === -1) {
            copyArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        } else {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        // }
        localStorage.setItem('modulos-usuario', JSON.stringify(event.container.data));

    }

    dropBack(event: CdkDragDrop<any[]>) {
        if (event.previousContainer.data === event.container.data) {
            return;
        }
        if (event.container.data.findIndex(x => x.icono === event.previousContainer.data[event.previousIndex].icono) > -1) {
            event.previousContainer.data.splice(event.previousIndex, 1);
        }
        localStorage.setItem('modulos-usuario', JSON.stringify(event.container.data));
    }

    removeItem(index) {
        this.modulosUsuario.splice(index, 1);
        localStorage.setItem('modulos-usuario', JSON.stringify(this.modulosUsuario));

    }

    toggleEditarModulos() {
        this.editarModulos = !this.editarModulos;
    }
    get getEditarModulos() {
        return this.editarModulos;
    }
}
