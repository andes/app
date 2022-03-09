import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isEmpty' })
export class IsEmptyPipe implements PipeTransform {

    transform(valor: string): boolean {
        let isEmpty = true;
        if (valor || valor !== '') {
            isEmpty = false;
        }
        return isEmpty;
    }
}
