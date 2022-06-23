import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Form, FormsService } from '../services/form.service';

@Injectable()
export class FormsResolver implements Resolve<Form> {
    constructor(private formsService: FormsService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<Form> {
        return this.formsService.get(route.params.id);
    }
}
