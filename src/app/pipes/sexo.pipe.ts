import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

<<<<<<< HEAD
@Pipe({ name: 'sexo', pure: false })
// pure: false - Info: https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
export class SexoPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let result: string;
        let sexo = value && (value.sexo.nombre || value.sexo);
        let genero = value && (value.genero.nombre || value.genero);

        if (!genero) {
            result = sexo;
        } else {
            if (genero === sexo) {
                result = sexo;
            } else {
                result = genero + ' (autopercibido)';
=======
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
>>>>>>> turnos
            }
        }
        if (result) {
            return result.charAt(0).toUpperCase() + result.substr(1).toLowerCase();
        } else {
            return null;
        }
    }
}
