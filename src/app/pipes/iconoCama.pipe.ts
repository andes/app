import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'iconoCama'})
export class IconoCamaPipe implements PipeTransform {
    transform(persona: any, args: string[]): any {

        const edad = moment().diff(persona.fechaNacimiento, 'years');

        if (edad >= 0 && edad < 15) {
            if (edad >= 0 && edad <= 3) {
                return 'mdi mdi-baby';
            } else if (edad > 3 && edad < 15) {
                return 'mdi mdi-human-child';
            }
        } else {
            if (persona.sexo && (persona.sexo === 'Masculino' || persona.sexo === 'masculino')) {
                return 'mdi mdi-human-male';
            } else if (persona.sexo && (persona.sexo === 'Femenino' || persona.sexo === 'femenino')) {
                return 'mdi mdi-human-female';
            } else if (persona.sexo && (persona.sexo === 'Indeterminado' || persona.sexo === 'indeterminado')) {
                return 'mdi mdi-circle-outline';
            }
        }

        return 'mdi mdi-human-male';
    }
}

