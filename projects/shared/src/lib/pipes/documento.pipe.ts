import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'documento' })
export class DocumentoPipe implements PipeTransform {
    transform(value: any) {
        if (!value) {
            return null;
        }
        return value.numeroIdentificacion || value.documento || 'Sin documento';
    }
}
