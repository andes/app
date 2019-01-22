import {
    Pipe,
    PipeTransform
} from '@angular/core';
@Pipe({
    name: 'textFilter'
})
export class TextFilterPipe implements PipeTransform {
    public idOrg;
    transform(items: any[], value: string): any {
        if (!items || !value || value.length === 0) {
            this.idOrg = '';
            return items;
        }
        // value = value.trim();
        // PARCHE HASTA CONTAR CON INTERFAZ DE PERMISOS
        console.log(value);
        items.forEach((item: any) => item.usuario = item.usuario ? item.usuario.toString() : '');
        let res1: any = items.filter((item: any) =>

            ((item.usuario) ? (item.usuario.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.documento) ? (item.documento.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.nombre) ? (item.nombre.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.apellido) ? (item.apellido.trim().toUpperCase().search(value.toUpperCase()) > -1) : '') ||
            ((item.organizaciones) ? (item.organizaciones.findIndex(x => {
                if (x.id === value.toString()) {
                    this.idOrg = value.toString();
                }
                return x.id === value.toString();
            }) > -1) :  '')
        );

        return res1;
            // let g = res1.filter((item1: any) => { return item1.organizaciones.findIndex(item => item._id === value.toString()) > 0; });
            // return g;
        // if (this.idOrg) {
        //     let g = res1.filter((item1: any) => { return item1.organizaciones.findIndex(item => item._id === this.idOrg) > 0; });
        //     return g;
        // } else {

        // }
    }
}
