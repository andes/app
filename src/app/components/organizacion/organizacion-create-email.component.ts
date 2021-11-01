import { Component, OnInit } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';

@Component({
    selector: 'organizacion-create-email',
    templateUrl: 'organizacion-create-email.html'
})
export class OrganizacionCreateEmailComponent implements OnInit {
    public idOrganizacion;
    public edit = -1;
    public configuraciones;

    constructor(
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        public plex: Plex,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            this.organizacionService.getById(this.idOrganizacion).subscribe(org => {
                this.configuraciones = org.configuraciones || {};
            });
        });
    }

    addEmail() {
        if (this.edit < 0) {
            this.configuraciones.emails.push({ nombre: '', email: '' });
            this.edit = this.configuraciones.emails.length - 1;
        }
    }

    save() {
        const flag = this.configuraciones.emails.some(e => e.nombre === null || e.email === null);
        if (flag) {
            this.plex.info('warning', 'Debe completar todos los campos');
        } else {
            const params = {
                id: this.idOrganizacion,
                configuraciones: this.configuraciones
            };
            this.organizacionService.save(params).subscribe(result => {
                if (result) {
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.volver();
                } else {
                    this.plex.info('warning', 'ERROR: Ocurrió un problema al actualizar los datos');
                }
            });
        }
    }

    volver() {
        this.router.navigate(['/tm/organizacion/']);
    }

    onEdit(i, active) {
        this.edit = active ? i : -1;
    }

    remove(i) {
        this.configuraciones.emails.splice(i, 1);
    }
}
