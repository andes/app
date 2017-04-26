import * as moment from 'moment';

type Estado = 'vacio' | 'disponible' | 'ocupado';

export class CalendarioDia {
    public seleccionado: boolean;
    public estado: Estado;
    public cantidadAgendas: number;
    public turnosDisponibles: number;

    public programadosDisponibles = 0;
    public gestionDisponibles = 0;
    public delDiaDisponibles = 0;

    constructor(public fecha: Date, public agenda: any) {

        if (!agenda) {
            this.estado = 'vacio';
            this.turnosDisponibles = 0;
        } else {
            let disponible: boolean = this.agenda.turnosDisponibles > 0;
            this.turnosDisponibles = this.agenda.turnosDisponibles;

            if (disponible) {
                let countBloques = [];

                // Si la agenda es de hoy, los turnos deberán sumarse  al contador "delDia"
                if (this.agenda.horaInicio >= moment(new Date()).startOf('day').toDate() && this.agenda.horaInicio <= moment(new Date()).endOf('day').toDate()) {

                    // recorro los bloques y cuento  los turnos como 'del dia', luego descuento los ya asignados
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        countBloques.push({
                            delDia: bloque.cantidadTurnos,
                            programado: 0,
                            gestion: bloque.reservadoGestion,
                        });

                        bloque.turnos.forEach((turno) => {
                            if (turno.estado === 'asignado') {

                                switch (turno.tipoTurno) {
                                    case ('delDia'):
                                        countBloques[indexBloque].delDia--;
                                    break;
                                    case ('programado'):
                                        countBloques[indexBloque].delDia--;
                                    break;
                                    case ('profesional'):
                                        countBloques[indexBloque].profesional--;
                                    break;
                                    case ('gestion'):
                                        countBloques[indexBloque].reservadoGestion--;
                                    break;
                                }

                            }
                        });

                        this.delDiaDisponibles  += countBloques[indexBloque].delDia;
                        this.gestionDisponibles += countBloques[indexBloque].gestion;
                    });
                    // Si es hoy, no hay turnos del día y hay turnos de gestión, el estado de la Agenda es "no disponible"
                    this.estado = (this.delDiaDisponibles > 0 && this.gestionDisponibles === 0) ? 'disponible' : 'ocupado';

                } else {
                // En caso contrario, se calculan los contadores por separado

                    // loopear turnos para sacar el tipo de turno!
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        countBloques.push({
                            // Asignamos a contadores dinamicos la cantidad inicial de c/u
                            programado: bloque.accesoDirectoProgramado,
                            gestion: bloque.reservadoGestion
                        });
                        bloque.turnos.forEach((turno) => {
                            if (turno.estado === 'asignado') {
                                switch (turno.tipoTurno) {
                                    case ('programado'):
                                        countBloques[indexBloque].programado--;
                                        break;
                                    case ('gestion'):
                                        countBloques[indexBloque].gestion--;
                                        break;
                                }
                            }
                            this.programadosDisponibles = + countBloques[indexBloque].programado;
                            this.gestionDisponibles = + countBloques[indexBloque].gestion;
                        });
                        if (this.agenda.estado === 'Disponible') {
                            this.estado = (this.gestionDisponibles > 0) ? 'disponible' : 'ocupado';
                        }
                        if (this.agenda.estado === 'Publicada') {
                            this.estado = (this.programadosDisponibles > 0) ? 'disponible' : 'ocupado';
                        }
                    });
                }
            } else {
                this.estado = 'ocupado';
            }
        }
    }

    getProgramadosDisponibles() {
        return this.programadosDisponibles;
    }

    getGestionDisponibles() {
        return this.gestionDisponibles;
    }

}
