import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../../../app.component';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { UsuarioService } from '../../../../services/usuarios/usuario.service';
import { DisclaimerService } from '../../../../services/disclaimer.service';
import { filter, take } from 'rxjs/operators';

@Component({
    templateUrl: 'select-organizacion.html',
    styleUrls: ['select-organizacion.scss']
})
export class SelectOrganizacionComponent implements OnInit {
    public organizaciones = null;
    public tieneOrg = true;
    public organizacionElegida;
    public showModalDisclaimer = false;
    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public appComponent: AppComponent,
        public organizacionService: OrganizacionService,
        public us: UsuarioService,
        public ds: DisclaimerService
    ) {
        this.plex.navVisible(false);
    }

    // llamo a organizaciones con 'true' para que me traiga las organizaciones filtradas (MISC-267)
    ngOnInit() {
        this.plex.updateTitle('Seleccione una organización');
        this.auth.organizaciones(true).subscribe(data => {
            if (data.length) {
                this.organizaciones = data;
                if (this.organizaciones.length === 1) {
                    this.seleccionar(this.organizaciones[0]);
                }
            } else {
                this.tieneOrg = false;
            }
        });
    }


    seleccionar(organizacion) {
        this.auth.setOrganizacion(organizacion).subscribe(() => {
            this.auth.session(!!this.auth.usuario).pipe(
                filter(session => typeof session.usuario === 'object'),
                take(1)
            ).subscribe(() => {
                this.ds.getActivos().subscribe(disclaimers => {
                    if (disclaimers && disclaimers.length > 0) {
                        const disclaimer = disclaimers[0];
                        this.us.getDisclaimers(this.auth.usuario).subscribe((userDisclaimers) => {
                            if (userDisclaimers.some(item => item.id === disclaimer.id)) {
                                this.router.navigate(['inicio']);
                            } else {
                                this.showModalDisclaimer = true;
                            }
                        });
                    } else {
                        this.router.navigate(['inicio']);
                    }
                });
            });

        }, (err) => {
            this.plex.info('danger', 'Error al seleccionar organización');
        });
    }

    respuestaDisclaimer(respuesta) {
        if (respuesta) {

        } else {
            this.showModalDisclaimer = false;
        }
    }

}
