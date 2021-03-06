import { Component, OnInit } from '@angular/core';
import { FormsService, Form } from '../../services/form.service';
import { Observable } from 'rxjs';
import { cache } from '@andes/shared';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
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
    constructor(private formsService: FormsService, private auth: Auth, private router: Router) { }
    ngOnInit() {
        if (!this.auth.getPermissions('formBuilder:?').length) {
            this.router.navigate(['inicio']);
        }
        this.canCreate = this.auth.check('formBuilder:create');
        this.canUpdate = this.auth.check('formBuilder:update');

        this.forms$ = this.formsService.search().pipe(cache());
    }
}
