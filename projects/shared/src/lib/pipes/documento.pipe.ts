import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'documento' })
export class DocumentoPipe implements PipeTransform {
    transform(value: any) {
        if (!value) {
            return '';
        }
        return value.documento ? this.format(value.documento) : value.numeroIdentificacion ? value.numeroIdentificacion : 'Sin documento';
    }

    private format(doc) {
        const last = doc.length;
        doc = doc.split('');
        doc.splice(last - 3, 0, '.');
        doc.splice(last - 6, 0, '.');
        return doc.join('');
    }
}
