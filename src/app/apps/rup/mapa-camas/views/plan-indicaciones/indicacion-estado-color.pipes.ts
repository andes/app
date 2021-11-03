import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'indicacionColor'
})
export class IndicacionColorPipe implements PipeTransform {
    transform(estado: string): any {
        switch (estado) {
            case 'draft':
                return '#ff8d22';
            case 'on-hold':
                return '#ff8d22';
            case 'completed':
                return '#8cc63f';
            case 'stopped':
            case 'cancelled':
                return '#dd4b39';
            default:
                return '#00a8e0';
        }
    }
}
