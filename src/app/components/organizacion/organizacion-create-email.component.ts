import { Component, OnInit, ViewChild } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { NgForm } from '@angular/forms';
import { take, tap, switchMap } from 'rxjs/operators';

@Component({
    selector: 'organizacion-create-email',
    templateUrl: 'organizacion-create-email.html'
})
export class OrganizacionCreateEmailComponent implements OnInit {
    @ViewChild('formulario', { static: true }) form: NgForm;

    public idOrganizacion;
    public edit = -1;
    public configuraciones;
    public formHasChanges = false;

    constructor(
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        public plex: Plex,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.pipe(
            switchMap(params => {
                this.idOrganizacion = params['id'];
                return this.organizacionService.getById(this.idOrganizacion);
            }),
            tap((org: any) => this.configuraciones = org.configuraciones || { emails: [] })
        ).subscribe();
    }

    formChanges() {
        this.formHasChanges = true;
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
        this.edit = -1;
        this.formChanges();
    }
}
