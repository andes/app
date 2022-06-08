import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';

@Pipe({
    name: 'botonesAgenda'
})
export class BotonesAgendaPipe implements PipeTransform {
    constructor(private auth: Auth) { }
    transform(agenda: IAgenda): any {
        const botones = {
            editar: false,
            suspender: false,
            reasignar: false,
            clonar: false,
            sobreturno: false,
            revision: false,
            cargaMasiva: false
        };

        const puedeEditar = this.auth.check('turnos:agenda:puedeEditar');
        const puedeClonar = this.auth.check('turnos:agenda:puedeClonar');
        const puedeRevisar = this.auth.check('turnos:agenda:puedeRevision');
        const puedeSuspender = this.auth.check('turnos:agenda:puedeSuspender');
        const puedeDarSobreturno = this.auth.check('turnos:agenda:puedeDarSobreturno');
        const puedeReasignar = this.auth.check('turnos:agenda:puedeReasignar');
        const puedeCargar = this.auth.check('turnos:agenda:asignacionMasiva');

        if (agenda) {
            // Se puede editar sólo una agenda que esté en estado planificacion o disponible
            botones.editar = puedeEditar && (agenda.estado === 'pendienteAsistencia' || agenda.estado === 'planificacion' || agenda.estado === 'disponible' || agenda.estado === 'publicada');

            // Se pueden clonar todas las agendas, ya que sólo se usa como un blueprint
            botones.clonar = puedeClonar;

            // Revisión de agenda
            botones.revision = puedeRevisar && this.puedoRevisar(agenda);

            // Se pueden suspender agendas que estén en estado disponible o publicada...
            botones.suspender = puedeSuspender && this.puedoSuspender(agenda) && !this.tienePrestacionIniciada(agenda);

            // Agregar un sobreturno
            botones.sobreturno = puedeDarSobreturno && this.puedoAgregar(agenda);

            // Reasignar turnos
            botones.reasignar = puedeReasignar && this.hayTurnosSuspendidos(agenda);

            // Hablita carga de pacientes masivos
            botones.cargaMasiva = puedeCargar && this.puedeCargaMasiva(agenda);

            return botones;
        }
    }

    puedoRevisar(agenda) {
        let auditable = true;
        for (let i = 0; i < agenda.bloques.length; i++) {
            auditable = auditable && agenda.bloques[i].turnos.some((t: any) => t.auditable === false);
        }
        auditable = !auditable;
        return (auditable && (agenda.estado === 'pendienteAsistencia' || agenda.estado === 'pendienteAuditoria' || agenda.estado === 'publicada' || agenda.estado === 'auditada') && moment(agenda.horaFin).isBefore(moment(new Date())));
    }

    puedoSuspender(agenda) {
        return (!this.hayTurnosCodificados(agenda)) && (agenda.estado === 'disponible' || agenda.estado === 'publicada');
    }

    // Comprueba que haya algún turno con paciente, en estado suspendido
    hayTurnosCodificados(agenda) {
        const turnoAsistencia = agenda.bloques.some((bloque: any) => bloque.turnos?.some((turno: any) => turno.asistencia));
        const codificaciones = agenda.bloques.some((bloque: any) => bloque.turnos?.some((turno: any) => turno.diagnostico?.codificaciones?.length > 0));

        return (!agenda.dinamica) ? (turnoAsistencia || codificaciones) : turnoAsistencia;
    }

    tienePrestacionIniciada(agenda) {
        return agenda.bloques.some(bloque => bloque.turnos?.some(turno => turno.asistencia === 'asistio'));
    }

    puedoAgregar(agenda) {
        return (agenda.nominalizada && !agenda.dinamica && (agenda.estado === 'disponible' || agenda.estado === 'publicada'));
    }

    // Comprueba que haya algún turno con paciente, en estado suspendido
    hayTurnosSuspendidos(agenda) {
        return !agenda.dinamica && agenda.bloques.some(bloque => bloque.turnos?.some(turno => turno.estado === 'suspendido' && turno.paciente?.id));
    }

    puedeCargaMasiva(agenda) {
        return (agenda.estado === 'disponible' || agenda.estado === 'publicada') && agenda.tipoPrestaciones.some(p => p.queries?.length);
    }

}
