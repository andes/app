import { Pipe, PipeTransform } from '@angular/core';
import { Huds } from '../modelos/huds';
import { Prestacion } from '../modelos/prestacion';


@Pipe({
    name: 'hudsFilter'
})
export class PrestacionPipe implements PipeTransform {

    transform(hud: Huds[], searchTerm: string): any[] {
        if (!hud || !searchTerm) {
            return hud;
        }

        return hud.filter(hud => hud.tituloPrincipal.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);

    }
}