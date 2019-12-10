import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../../../app.component';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { pluck, take } from 'rxjs/operators';

@Component({
    templateUrl: 'select-organizacion.html',
    styleUrls: ['select-organizacion.scss']
})
export class SelectOrganizacionComponent implements OnInit {
    public organizaciones = null;
    public organizacionElegida;
    public redirectURL = null;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private router: Router,
        public appComponent: AppComponent,
        public organizacionService: OrganizacionService,
        private activeRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.activeRoute.queryParams.pipe(
            pluck('redirect'),
            take(1)
        ).subscribe((url) => {
            this.redirectURL = url;
        });

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
        this.auth.setOrganizacion(organizacion).subscribe((data) => {
            if (!this.redirectURL) {
                this.organizacionService.configuracion(this.auth.organizacion.id).subscribe(() => { });
                this.plex.updateUserInfo({ usuario: this.auth.usuario });
                this.appComponent.checkPermissions();
                this.router.navigate(['inicio']);
            } else {
                const token = data.token;
                window.location.assign(`${this.redirectURL}?token=${token}`);
            }
        }, (err) => {
            this.plex.info('danger', 'Error al seleccionar organización');
        });
    }

}
