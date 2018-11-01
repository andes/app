import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Observable';
import { Auth } from '@andes/auth';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: 'selectOrganizacion.html',
    styleUrls: ['selectOrganizacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class SelectOrganizacionComponent implements OnInit {
    public organizaciones = null;
    public organizacionElegida;
    constructor(private plex: Plex, private auth: Auth, private router: Router, public appComponent: AppComponent) { }

    ngOnInit() {
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

    seleccionar(unaOrg) {
        this.auth.setOrganizacion(unaOrg).subscribe((data) => {
            this.plex.updateUserInfo({ usuario: this.auth.usuario });
            this.appComponent.checkPermissions();
            this.router.navigate(['inicio']);
        }, (err) => {
            this.plex.info('danger', 'Error al seleccionar organización');
        });
    }

}
