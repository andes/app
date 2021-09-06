import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'checkEdit'
})
export class CheckEditPipe implements PipeTransform {
    constructor(
        private auth: Auth
    ) { }

    transform(ficha: any): Observable<boolean> {
        if (this.auth.check('epidemiologia:update')) {
            return this.auth.organizaciones().pipe(
                map(organizacion => organizacion.some(org => org.id === ficha.secciones[0].fields[0].organizacion?.id))
            );
        } else {
            return of(false);
        }
    }
}
