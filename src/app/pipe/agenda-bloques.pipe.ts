import { IBloque } from './../interfaces/turnos/IBloque';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortBloques' })
export class SortBloquesPipe implements PipeTransform{
  transform(array: Array<IBloque>, args: IBloque): Array<IBloque> {
    array.sort((fecha1, fecha2): number => {
        let indiceAux: Number;
        if (fecha1.horaInicio && fecha2.horaInicio) {
            // if (fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime() > 0) {
            //     indiceAux = fecha1.indice;
            //     fecha1.indice = fecha2.indice;
            //     fecha2.indice = indiceAux;
            // }
            return fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime();
        } else {
            return 0;
        }
    });
    return array;
  }
}
