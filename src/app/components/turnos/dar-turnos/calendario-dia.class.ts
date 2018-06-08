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
    public dinamica = false;

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
            let disponible: boolean = (this.agenda.turnosDisponibles > 0);
            this.estadoAgenda = this.agenda.estado;
            if (disponible) {
                let countBloques = [];

                // Si la agenda es de hoy, los turnos programados deberán sumarse  al contador "delDia"
                if (this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate()) {
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        countBloques.push({
                            delDia: bloque.restantesDelDia + bloque.restantesProgramados,
                            programado: 0,
                            gestion: bloque.restantesGestion,
                            profesional: bloque.restantesProfesional
                        });
                        this.delDiaDisponibles += countBloques[indexBloque].delDia;
                    });
                    // Si es hoy, no hay turnos del día y hay turnos de gestión, el estado de la Agenda es "no disponible"
                    this.turnosDisponibles = this.turnosDisponibles + this.delDiaDisponibles;
                    this.estado = (this.delDiaDisponibles > 0 && this.gestionDisponibles === 0) ? 'disponible' : 'ocupado';
                    // En caso contrario, se calculan los contadores por separado
                } else {
                    let autocitado = solicitudPrestacion && solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion && solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true;
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        countBloques.push({
                            // Asignamos a contadores dinamicos la cantidad inicial de c/u
                            delDia: bloque.restantesDelDia,
                            programado: bloque.restantesProgramados,
                            gestion: bloque.restantesGestion,
                            profesional: bloque.restantesProfesional
                        });

                        this.delDiaDisponibles += bloque.restantesDelDia;
                        this.programadosDisponibles += bloque.restantesProgramados;
                        this.gestionDisponibles += bloque.restantesGestion;
                        this.profesionalDisponibles += bloque.restantesProfesional;
                        if (this.agenda.estado === 'disponible' || this.agenda.estado === 'publicada') {
                            if (solicitudPrestacion) {
                                if (this.gestionDisponibles > 0 && !autocitado) {
                                    this.estado = 'disponible';
                                    disponible = true;
                                } else if (this.profesionalDisponibles > 0 && autocitado) {
                                    this.estado = 'disponible';
                                    disponible = true;
                                } else {
                                    this.estado = 'vacio';
                                    disponible = false;
                                    this.turnosDisponibles = 0;
                                }
                            } else {
                                if (this.programadosDisponibles > 0) {
                                    this.estado = 'disponible';
                                } else {
                                    this.estado = 'vacio';
                                }
                            }
                        }

                    });

                    if (disponible) {
                        if (solicitudPrestacion) {
                            if (autocitado) {
                                this.turnosDisponibles += this.profesionalDisponibles;
                            } else {
                                this.turnosDisponibles += this.gestionDisponibles;
                            }
                        } else {
                            this.turnosDisponibles += this.programadosDisponibles;
                        }
                    }
                }

            } else {
                if (this.agenda.dinamica) {
                    this.estado = 'disponible';
                    this.dinamica = true;

                } else {
                    this.estado = 'ocupado';
                }
            }
        }

    }
}
