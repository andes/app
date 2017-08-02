import * as moment from 'moment';
import { EstadoCalendarioDia } from './enums';

export class CalendarioDia {
    public estadoAgenda: any;
    public seleccionado: boolean;
    public estado: EstadoCalendarioDia;
    public weekend: boolean; // https://www.youtube.com/watch?v=VxuNP0RwwdA
    public cantidadAgendas: number;
    public hoy: Date;
    public turnosDisponibles: number;

    public programadosDisponibles = 0;
    public gestionDisponibles = 0;
    public delDiaDisponibles = 0;
    public profesionalDisponibles = 0;

    constructor(public fecha: Date, public agenda: any, solicitudPrestacion: any) {
        this.hoy = new Date();
        this.turnosDisponibles = 0;
        if (!agenda) {
            this.estado = 'vacio';
        } else {
            let disponible: boolean = this.agenda.turnosDisponibles > 0;
            this.estadoAgenda = this.agenda.estado;

            if (disponible) {
                let countBloques = [];

                // Si la agenda es de hoy, los turnos deberán sumarse  al contador "delDia"
                if (this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate()) {

                    // recorro los bloques y cuento  los turnos como 'del dia', luego descuento los ya asignados
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        countBloques.push({
                            delDia: bloque.cantidadTurnos,
                            programado: 0,
                            gestion: bloque.reservadoGestion,
                            profesional: bloque.reservadoProfesional
                        });

                        bloque.turnos.forEach((turno) => {
                            // Si el turno está asignado o está disponible pero ya paso la hora
                            if (turno.estado === 'asignado' || (turno.estado === 'disponible' && turno.horaInicio < this.hoy)) {

                                switch (turno.tipoTurno) {
                                    case ('delDia'):
                                        countBloques[indexBloque].delDia--;
                                        break;
                                    case ('programado'):
                                        countBloques[indexBloque].delDia--;
                                        break;
                                    case ('profesional'):
                                        if (this.agenda.estado === 'disponible') {
                                            countBloques[indexBloque].profesional--;
                                        }
                                        break;
                                    case ('gestion'):
                                        if (this.agenda.estado === 'disponible') {
                                            countBloques[indexBloque].gestion--;
                                        }
                                        break;
                                    default:
                                        this.delDiaDisponibles--;
                                        break;
                                }

                            }
                        });
                        this.delDiaDisponibles += countBloques[indexBloque].delDia;
                        this.gestionDisponibles += countBloques[indexBloque].gestion;
                    });
                    // Si es hoy, no hay turnos del día y hay turnos de gestión, el estado de la Agenda es "no disponible"
                    this.turnosDisponibles = this.turnosDisponibles + this.delDiaDisponibles + this.gestionDisponibles;
                    this.estado = (this.delDiaDisponibles > 0 && this.gestionDisponibles === 0) ? 'disponible' : 'ocupado';

                } else {
                    // En caso contrario, se calculan los contadores por separado

                    // loopear turnos para sacar el tipo de turno!
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        countBloques.push({
                            // Asignamos a contadores dinamicos la cantidad inicial de c/u
                            programado: bloque.accesoDirectoProgramado,
                            gestion: bloque.reservadoGestion,
                            profesional: bloque.reservadoProfesional
                        });

                        bloque.turnos.forEach((turno) => {
                            if (turno.estado === 'asignado') {
                                switch (turno.tipoTurno) {
                                    case ('programado'):
                                        countBloques[indexBloque].programado--;
                                        break;
                                    case ('gestion'):
                                        if (this.agenda.estado === 'disponible') {
                                            countBloques[indexBloque].gestion--;
                                        }
                                        break;
                                    case ('profesional'):
                                        if (this.agenda.estado === 'disponible') {
                                            countBloques[indexBloque].profesional--;
                                        }
                                        break;
                                }
                            }
                        });

                        this.programadosDisponibles += countBloques[indexBloque].programado;
                        this.gestionDisponibles += countBloques[indexBloque].gestion;
                        this.profesionalDisponibles += countBloques[indexBloque].profesional;

                        if (this.agenda.estado === 'disponible') {
                            if (solicitudPrestacion) {
                                if (this.gestionDisponibles > 0 && solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === false) {
                                    this.estado = 'disponible';
                                } else if (this.profesionalDisponibles > 0 && solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true) {
                                    this.estado = 'disponible';
                                } else {
                                    this.estado = 'vacio';
                                    disponible = false;
                                    this.turnosDisponibles = 0;
                                }
                            } else {
                                // Turnos de gestión, pero sin solicitud
                                if (this.gestionDisponibles > 0) {
                                    this.estado = 'disponible';
                                } else {
                                    this.estado = 'vacio';
                                }
                            }
                        }

                        if (this.agenda.estado === 'publicada' && !solicitudPrestacion) {
                            this.estado = (this.programadosDisponibles > 0) ? 'disponible' : 'ocupado';
                        }

                    });

                    if (disponible) {
                        this.turnosDisponibles = this.turnosDisponibles + this.programadosDisponibles + this.gestionDisponibles + this.profesionalDisponibles;
                    }
                }
            } else {
                this.estado = 'ocupado';
            }
        }
    }

}
