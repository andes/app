import { Pipe, PipeTransform } from '@angular/core';
import { Prestacion } from '../modelos/prestacion';


@Pipe({
    name: 'prestacionesFilter'
})
export class PrestacionPipe implements PipeTransform {

    transform(prestacion: Prestacion[], searchTerm: string): any[] {
        if (!prestacion || !searchTerm) {
            return prestacion;
        }

        return prestacion.filter(prestacion => prestacion.nombre.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
    }
}