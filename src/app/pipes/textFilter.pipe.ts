import {
    Pipe,
    PipeTransform
} from '@angular/core';
@Pipe({
    name: 'textFilter'
})
export class TextFilterPipe implements PipeTransform {
    transform(items: any[], value: string): any {
        if (!items || !value || value.length === 0) {
            return items;
        }
        // value = value.trim();
        debugger;
        // PARCHE HASTA CONTAR CON INTERFAZ DE PERMISOS
        items.forEach((item: any) => item.usuario = item.usuario.toString());
        return items.filter((item: any) =>

            ((item.usuario) ? (item.usuario.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.documento) ? (item.documento.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.nombre) ? (item.nombre.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.apellido) ? (item.apellido.trim().toUpperCase().search(value.toUpperCase()) > -1) : '')
        )
    }
}
