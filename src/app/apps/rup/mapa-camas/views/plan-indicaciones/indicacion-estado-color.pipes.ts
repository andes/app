import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'indicacionColor'
})
export class IndicacionColorPipe implements PipeTransform {
    transform(estado: string): any {
        switch (estado) {
            case 'pausado':
                return '#ff8d22';


            case 'completado':
                return '#8cc63f';


            case 'suspendido':
                return '#dd4b39';

            default:
                return '#00a8e0';
        }
    }
}
