import {
    Pipe,
    PipeTransform
} from '@angular/core';
@Pipe({
    name: 'filterPermisos'
})
export class FilterPermisos implements PipeTransform {
    transform(items: any[], value: any): any {
        if (!items || !value || value.nombre.length === 0) {
            return items;
        }
        return items.filter(permiso => {
            let item: string = permiso.split(':', 2)[0];
            return (item === value.nombre);
        });
    }
}
