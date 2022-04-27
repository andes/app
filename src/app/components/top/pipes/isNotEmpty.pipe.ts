import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isNotEmpty' })
export class IsNotEmptyPipe implements PipeTransform {

    transform(valor: string): boolean {
        let isNotEmpty = false;
        if (valor || valor !== '') {
            isNotEmpty = true;
        }
        return isNotEmpty;
    }
}
