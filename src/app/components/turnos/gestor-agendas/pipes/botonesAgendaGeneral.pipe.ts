import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { forEach } from 'vis-util';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';

@Pipe({
    name: 'botonesAgendaGeneral'
})
export class BotonesAgendaGeneralPipe implements PipeTransform {
    constructor(private auth: Auth) { }
    transform(agendas: IAgenda[]): any {
        const botones = {
            publicar: false,
            borrar: false,
            disponible: false,
            reanudar: false,
            imprimir: false,
            imprimirCarpetas: false,
            nota: false,
            pausar: false
        };

        const puedeImprimir = this.auth.check('turnos:agenda:puedeImprimir');
        const puedeNota = this.auth.check('turnos:agenda:puedeNota');
        const puedePausar = this.auth.check('turnos:agenda:puedePausar');
        const puedeHabilitar = this.auth.check('turnos:agenda:puedeHabilitar');
        const puedeBorrar = this.auth.check('turnos:agenda:puedeBorrar');
        const puedeReanudar = this.auth.check('turnos:agenda:puedeReanudar');

        // Imprimir istado de carpetas en pdf
        botones.imprimirCarpetas = (puedeImprimir && this.puedoImprimirCarpetas(agendas));

        // Agregar una nota relacionada a la Agenda
        botones.nota = puedeNota;

        // Imprimir listado de turnos en pdf
        botones.imprimir = puedeImprimir;

        // Se pueden cambiar a estado pausada todas las agendas que no estén en estado planificacion
        botones.pausar = puedePausar && this.puedoPausar(agendas);

        // Se pueden publicar todas las agendas que estén en estado planificacion, o si estado disponible y no tiene *sólo* turnos reservados
        botones.publicar = puedeHabilitar && this.puedoPublicar(agendas) && this.haySoloTurnosReservados(agendas);

        // Se pueden pasar a disponible cualquier agenda en estado planificacion
        botones.disponible = puedeHabilitar && this.puedoDisponer(agendas);

        // Se pueden borrar cualquier agenda en estado de planificacion
        botones.borrar = puedeBorrar && this.puedoBorrar(agendas);

        // Se pueden reanudar las agendas en estado pausada
        botones.reanudar = puedeReanudar && this.puedoReanudar(agendas);

        return botones;

    }

    puedoImprimirCarpetas(agendas) {
        const estadosValidos = ['pendienteAsistencia', 'pendienteAuditoria', 'auditada', 'pausada', 'suspendida'];
        return !agendas.some((agenda: any) => estadosValidos.includes(agenda.estado));
    }

    puedoPausar(agendas) {
        const estadosInvalidos = ['planificacion', 'pausada', 'suspendida', 'auditada', 'pendienteAuditoria'];
        return !agendas.some((agenda: any) => estadosInvalidos.includes(agenda.estado));
    }

    puedoPublicar(agendas) {
        const estadosValidos = ['planificacion', 'disponible'];
        return agendas.every((agenda: any) => estadosValidos.includes(agenda.estado));
    }

    // Verifica que las agendas seleccionadas tengan al menos un turno de acceso directo poder para publicar la agenda
    haySoloTurnosReservados(agendas) {
        return agendas.every(agenda => agenda.dinamica || agenda.bloques.some(bloque => bloque.accesoDirectoProgramado > 0 || bloque.accesoDirectoDelDia > 0));
    }

    puedoDisponer(agendas) {
        // enPlanificacion resulta true sssi todas las agendas seleccionadas estan en planificación
        const enPlanificacion = !agendas.some((agenda: any) => (agenda.estado !== 'planificacion'));
        const turnosEspeciales = agendas.some(agenda => {
            return agenda.bloques.some(b => b.reservadoGestion > 0 || b.reservadoProfesional > 0);
        });
        const nominalizada = !agendas.some((agenda: any) => (agenda.nominalizada === true));

        return (enPlanificacion && turnosEspeciales) || (enPlanificacion && nominalizada);
    }

    puedoBorrar(agendas) {
        return agendas.every((agenda: any) => (agenda.estado === 'planificacion'));
    }

    puedoReanudar(agendas) {
        return agendas.every((agenda: any) => (agenda.estado === 'pausada'));
    }
}
