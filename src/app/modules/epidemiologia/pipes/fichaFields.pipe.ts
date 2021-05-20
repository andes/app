import { calcularEdad } from '@andes/shared';
import { Pipe, PipeTransform } from '@angular/core';
import { ColoresPrioridades } from 'src/app/utils/enumerados';

@Pipe({
    name: 'fichaFields'
})
export class FichaFieldsPipe implements PipeTransform {
    transform(ficha: any): any {
        let prioridad;
        let colorPrioridad;
        const score = ficha.score?.value;

        if (score >= 9) {
            prioridad = 'alta';
        } else if (score >= 5) {
            prioridad = 'media';
        } else {
            prioridad = 'baja';
        }
        colorPrioridad = ColoresPrioridades.find(x => x.name === prioridad);

        const operaciones = ficha.secciones.find(s => s.name === 'Operaciones');
        let ultimaInterccion = operaciones?.fields.find(f => f.seguimiento)?.seguimiento.ultimoEstado?.value;
        ultimaInterccion = ultimaInterccion ? moment().diff(moment(ultimaInterccion), 'days') : 0;
        const alarma = score === 10 ? `Último llamado hace ${ultimaInterccion} días.` : false;
        const fichaFields = {
            telefonocaso: ficha.secciones.find(s => s.name === 'Mpi')?.fields.find(f => f.telefonocaso)?.telefonocaso,
            codigoSisa: operaciones?.fields.find(f => f.codigoSisa)?.codigoSisa,
            fechaConfirmacion: new Date(),
            contactosEstrechos: ficha.secciones.find(s => s.name === 'Contactos Estrechos')?.fields,
            llamados: operaciones?.fields.find(f => f.seguimiento)?.seguimiento.llamados.sort((a, b) => moment(b.fecha).diff(a.fecha)),
            alarma,
            colorPrioridad,
            estado: operaciones?.fields.find(f => f.seguimiento)?.seguimiento.ultimoEstado
        };
        return fichaFields;
    }
}
