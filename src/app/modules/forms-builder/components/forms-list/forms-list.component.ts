import { Component, OnInit } from '@angular/core';
import { FormsService, Form } from '../../services/form.service';
import { Observable } from 'rxjs';
import { cache } from '@andes/shared';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormResourcesService } from '../../services/resources.service';
import { Plex } from '@andes/plex';
@Component({
    selector: 'forms-list',
    templateUrl: './forms-list.component.html'
})
export class FormsListComponent implements OnInit {
    canCreate: Boolean;
    canUpdate: Boolean;

    forms$: Observable<Form[]>;

    public columns = [
        {
            key: 'col-1',
            label: 'Nombre',
            sorteable: false,
            opcional: false
        },
        {
            key: 'col-2',
            label: 'Clave/Tipo',
            sorteable: false,
            opcional: true
        },
        {
            key: 'col-3',
            label: 'Estado',
            sorteable: false,
            opcional: true
        },
        {
            key: 'col-4',
            label: 'Acciones',
            sorteable: false,
            opcional: true
        }
    ];
    public nuevaSeccion=null;
    public addSection=false;
    public secciones=[];
    constructor(
        private formsService: FormsService,
        private auth: Auth,
        private router: Router,
        private formResourceService: FormResourcesService,
        private plex: Plex
    ) { }
    ngOnInit() {
        if (!this.auth.getPermissions('formBuilder:?').length) {
            this.router.navigate(['inicio']);
        }
        this.canCreate = this.auth.check('formBuilder:create');
        this.canUpdate = this.auth.check('formBuilder:update');

        this.forms$ = this.formsService.search().pipe(cache());
    }

    enableAddSection() {
        this.addSection = true;
        this.formResourceService.search({}).subscribe(resultado => {
            resultado.forEach(res => {
                if (res.type === 'section') {
                    this.secciones.push(res);
                }
            });
        });
    }

    addSec() {
        const existe = this.secciones.some(sec => sec.name.toLowerCase() === this.nuevaSeccion.toLowerCase());
        if (!existe) {
            const key = this.nuevaSeccion.slice(0, 16).replace(/ /g, '').toLowerCase();
            const nuevaSeccion = {
                activo:true,
                type: 'section',
                name: this.nuevaSeccion,
                id: key
            };
            this.formResourceService.create(nuevaSeccion).subscribe(
                ()=>{
                    this.plex.toast('success', 'Sección creada correctamente');
                    this.nuevaSeccion = null;
                },
                ()=>this.plex.toast('danger', 'Error al crear la sección')
            );
            this.addSection = false;
        } else {
            this.plex.toast('danger', 'Ya existe una sección con ese nombre');
        }
    }

    close() {
        this.addSection = false;
    }
}
