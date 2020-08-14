import { Component, OnInit } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';

@Component({
    selector: 'organizacion-create-email',
    templateUrl: 'organizacion-create-email.html'
})
export class OrganizacionCreateEmailComponent implements OnInit {


    public idOrganizacion;
    public organizacion;
    public configuraciones: { emails: { nombre: string, email: string }[] } = {
        emails: [

            { nombre: '', email: '' }
        ]
    };

    constructor(
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        public plex: Plex

    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            this.organizacionService.getById(this.idOrganizacion).subscribe(org => {
                this.organizacion = org;

                if (!this.organizacion.configuraciones) {
                    this.organizacion['configuraciones'] = this.configuraciones;
                } else {
                    this.configuraciones = this.organizacion.configuraciones;
                }

            });
        });
    }

    addEmail() {

        this.organizacion.configuraciones.emails.push({ nombre: '', email: '' });

    }

    save() {

        this.organizacionService.save(this.organizacion).subscribe(result => {
            if (result) {
                this.plex.info('success', 'Los datos se actualizaron correctamente');
            } else {
                this.plex.info('warning', 'ERROR: Ocurrió un problema al actualizar los datos');
            }
        });

    }

    remove(i) {
        this.organizacion.configuraciones.emails.splice(i, 1);
    }

}
