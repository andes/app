import { CommonNovedadesService } from './../novedades/common-novedades.service';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { Router, ActivatedRoute } from '@angular/router';
import { setDimension } from '../../shared/services/analytics.service';

@Component({
    templateUrl: 'inicio.html',
    styleUrls: ['inicio.scss']
})
export class InicioComponent implements AfterViewInit, OnInit {
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

    ngOnInit() {
        // this.plex.navVisible(false);
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
                    registros.forEach((modulo) => {
                        let tienePermiso = false;
                        modulo.permisos.forEach((permiso) => {
                            if (this.auth.getPermissions(permiso).length > 0) {
                                if (!tienePermiso) {
                                    this.modulos.push(modulo);
                                    tienePermiso = true;
                                }
                            }
                        });
                    });
                    this.modulos.sort((a, b) => a.orden - b.orden);
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

                    this.secciones = this.modulos.filter(x => !x.submodulos);
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
