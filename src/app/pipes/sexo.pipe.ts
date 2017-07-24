import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'sexo' })
export class SexoPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let result: string;
        if (!value.genero) {
            result = value.sexo;
        } else {
            if (value.genero === value.sexo) {
                result = value.sexo;
            } else {
                result = value.genero + ' (autopercibido)';
            }
        }
        if (result) {
            return result.charAt(0).toUpperCase() + result.substr(1).toLowerCase();
        } else {
            return null;
        }
    }
}
