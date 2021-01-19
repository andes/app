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

    constructor(private formsService: FormsService) { }

    ngOnInit() {
        this.forms$ = this.formsService.search().pipe(cache());
    }
}
