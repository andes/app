import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../../../app.component';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { HotjarService } from '../../../../shared/services/hotJar.service';
import { UsuarioService } from '../../../../services/usuarios/usuario.service';
import { DisclaimerService } from '../../../../services/disclaimer.service';

@Component({
    templateUrl: 'select-organizacion.html',
    styleUrls: ['select-organizacion.scss']
})
export class SelectOrganizacionComponent implements OnInit {
    public organizaciones = null;
    public organizacionElegida;
    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public appComponent: AppComponent,
        public organizacionService: OrganizacionService,
        private hotjar: HotjarService,
        public us: UsuarioService,
        public ds: DisclaimerService
    ) { }

    ngOnInit() {
        this.plex.updateTitle('Seleccione una organización');
        this.auth.organizaciones().subscribe(data => {
            if (data) {
                this.organizaciones = data;
                if (this.organizaciones.length === 1) {
                    this.seleccionar(this.organizaciones[0]);
                }
            } else {
                this.plex.info('danger', 'El usuario no tiene ningún permiso asignado');
            }
        });
    }

    seleccionar(organizacion) {
        this.auth.setOrganizacion(organizacion).subscribe(() => {
            this.auth.session(true).subscribe(() => {
                this.organizacionService.configuracion(this.auth.organizacion.id).subscribe(() => { });
                this.plex.updateUserInfo({ usuario: this.auth.usuario });
                this.appComponent.checkPermissions();
                // this.hotjar.initialize();
                this.ds.get({ activo: true }).subscribe(disclaimers => {
                    if (disclaimers && disclaimers.length > 0) {
                        let disclaimer = disclaimers[0];
                        this.us.getDisclaimers(this.auth.usuario).subscribe((userDisclaimers) => {
                            if (userDisclaimers.some(item => item.id === disclaimer.id)) {
                                this.router.navigate(['inicio']);
                            } else {
                                this.router.navigate(['/auth/disclaimer']);
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

}
