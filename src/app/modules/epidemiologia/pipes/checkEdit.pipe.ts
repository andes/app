import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermisosService } from 'src/app/apps/gestor-usuarios/services/permisos.service';

@Pipe({
    name: 'checkEdit'
})
export class CheckEditPipe implements PipeTransform {
    constructor(
        private auth: Auth,
        private permisosService: PermisosService
    ) { }

    transform(ficha: any): Observable<boolean> {
        if (this.auth.check('epidemiologia:update')) {
            return this.permisosService.organizaciones().pipe(
                map(permisos => permisos.some(org => org.id === ficha.secciones[0].fields[0].organizacion?.id))
            );
        } else {
            return of(false);
        }
    }
}
