import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'detalleIndicacion' })

export class DetalleIndicacionPipe implements PipeTransform {
    transform(value: any): any {
        const valor = value.valor;
        let detalle = '';
        detalle += valor.via?.term || '';
        detalle += valor.presentacion?.term ? ((detalle.length ? ', ' : '') + valor.presentacion.term) : '';
        detalle += (valor.frecuencias && valor.frecuencias[0]?.frecuencia?.nombre) ?
            ((detalle.length ? ', ' : '') + valor.frecuencias[0].frecuencia.nombre) : '';
        return detalle;
    }
}
