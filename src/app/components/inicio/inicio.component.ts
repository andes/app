import { CommonNovedadesService } from './../novedades/common-novedades.service';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { Router, ActivatedRoute } from '@angular/router';
import { setDimension } from '../../shared/services/analytics.service';

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
    public provinciaClass = LABELS.provinciaClass;
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
    ) { }

    ngAfterViewInit() {
        if (this.auth.profesional) {
            // Google Analytics
            setDimension('profesional', this.auth.profesional);
        }
        window.setTimeout(() => {
            this.loading = true;
            this.appComponent.getModulos().subscribe(
                registros => {
                    this.secciones = registros.filter(x => (!x.submodulos || !x.submodulos.length));

                    registros.forEach((modulo) => {
                        let tienePermiso = false;
                        if (modulo.activo) {
                            modulo.permisos.forEach((permiso) => {
                                if (!tienePermiso) {
                                    if (this.auth.getPermissions(permiso).length > 0) {
                                        this.modulos.push(modulo);
                                        tienePermiso = true;
                                        if (modulo.submodulos && modulo.submodulos.length > 0) {
                                            modulo.submodulos = modulo.submodulos.filter(x => this.auth.getPermissions(x.permisos[0]).length > 0);
                                        }
                                    }
                                }
                            });
                        }
                    });

                    this.modulos.sort((a, b) => a.orden - b.orden);
                    this.modulos.map(x => x.submodulos.sort((a, b) => a.orden - b.orden));


                    if (this.modulos.length) {
                        this.denied = false;
                        let modulos = this.modulos.map(p => {
                            return p._id;
                        });
                        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe(novedades => {
                            modulos.forEach((moduloId) => {
                                this.novedades[moduloId] = novedades.filter(n => n.modulo && n.modulo._id === moduloId);
                            });
                        });
                    } else {
                        this.denied = true;
                    }
                    this.loading = false;

                    this.modulos = this.modulos.filter(x => x.submodulos && x.submodulos.length > 0);

                }, (err) => {
                }
            );
        });
    }

    redirect(caja) {
        if (caja.nombre === 'ANALYTICS') {
            const token = this.auth.getToken();
            window.location.assign(`https://analytics.andes.gob.ar/auth/login?token=${token}`);
        } else {
            this.router.navigate([caja.linkAcceso]);
        }
    }

    anlytics() {
        const token = this.auth.getToken();
        window.location.assign(`https://analytics.andes.gob.ar/auth/login?token=${token}`);
    }

    irANovedades(modulo) {
        this.router.navigate(['/novedades', modulo], { relativeTo: this.route });
    }
}
