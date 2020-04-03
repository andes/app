import { CommonNovedadesService } from './../novedades/common-novedades.service';
import { ModulosService } from '../../services/novedades/modulos.service';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../app.component';
import { LABELS } from '../../styles/properties';
import { Router } from '@angular/router';

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
    public cajasModulos: any = [];
    public novedades: any[] = [];

    constructor(public auth: Auth, public appComponent: AppComponent, private plex: Plex,
        private commonNovedadesService: CommonNovedadesService,
        private modulosService: ModulosService,
        private router: Router) { }

    ngAfterViewInit() {
        let paramsModulos: any = {};
        window.setTimeout(() => {
            this.loading = true;
            let permisos = this.auth.getPermissions('?');
            if (this.auth.getPermissions('turnos:planificarAgenda:?').length > 0) {
                permisos.push('turnos:planificarAgenda');
            }
            if (this.auth.getPermissions('turnos:darTurnos:?').length > 0) {
                permisos.push('turnos:darTurnos');
            }
            if (this.auth.getPermissions('internacion:mapaDeCamas:?').length > 0) {
                permisos.push('internacion:mapaDeCamas');
            }
            if (this.auth.getPermissions('internacion:inicio:?').length > 0) {
                permisos.push('internacion:inicio');
            }
            paramsModulos.permisos = permisos;
            this.modulosService.search(paramsModulos).subscribe(
                registros => {
                    this.cajasModulos = registros;
                    if (registros.length) {
                        this.denied = false;
                        let modulos = registros.map(p => {
                            return p._id;
                        });
                        this.commonNovedadesService.setNovedadesSinFiltrar(modulos);
                        this.commonNovedadesService.getNovedadesSinFiltrar().subscribe(novedades => {
                            modulos.forEach((modulo) => {
                                this.novedades[modulo] = novedades.filter(n => n.modulo._id === modulo);
                            });
                        });
                    } else {
                        this.denied = true;
                    }
                    this.loading = false;
                },
                (err) => {
                }
            );
        });
    }

    anlytics() {
        const token = this.auth.getToken();
        window.location.assign(`https://analytics.andes.gob.ar/auth/login?token=${token}`);
    }

    irANovedades(modulo) {
        this.commonNovedadesService.setNovedades(modulo);
        this.router.navigate(['novedades']);
    }
}
