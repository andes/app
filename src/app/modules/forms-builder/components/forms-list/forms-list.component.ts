import { Component, OnInit } from '@angular/core';
import { FormsService, Form } from '../../services/form.service';
import { Observable } from 'rxjs';
import { cache } from '@andes/shared';
@Component({
    selector: 'forms-list',
    templateUrl: './forms-list.component.html'
})
export class FormsListComponent implements OnInit {
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
    constructor(private formsService: FormsService) { }
    ngOnInit() {
        this.forms$ = this.formsService.search().pipe(cache());
    }
}
