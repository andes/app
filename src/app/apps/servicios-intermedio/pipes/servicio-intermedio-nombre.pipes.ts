import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { ServicioIntermedioService } from 'src/app/modules/rup/services/servicio-intermedio.service';

@Pipe({
    name: 'servicioName'
})
export class ServicioIntermedioNombrePipe implements PipeTransform {
    constructor(
        private servicioService: ServicioIntermedioService
    ) {

    }
    transform(id: string): any {
        return this.servicioService.getAll().pipe(
            map(servicios => {
                const ss = servicios.find(s => s.id === id);
                return ss?.nombre;
            })
        );
    }
}
