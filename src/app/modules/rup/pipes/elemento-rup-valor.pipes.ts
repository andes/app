import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'RUPSoloValor'
})

export class RUPSoloValorPipe implements PipeTransform {
    transform(registro: any): any {
        if (registro?.valor) {
            return getValor(registro.valor);
        } else {
            return 'Sin datos';
        }
    }
}

export function getValor(valor: any) {
    if (valor.id) {
        return (valor.id !== 'Otro') ? valor.label : valor.descripcion;
    } else if (valor.evolucion) {
        if (typeof valor.evolucion === 'string') {
            return valor.evolucion;
        }
        if (typeof valor.evolucion === 'object' && !Array.isArray(valor.evolucion) && typeof valor.evolucion.evolucion === 'string') {
            return valor.evolucion.evolucion;
        }
    }
    return valor;
}
