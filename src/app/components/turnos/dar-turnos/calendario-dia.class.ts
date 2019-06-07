import * as moment from 'moment';
import { EstadoCalendarioDia } from './enums';

export class CalendarioDia {
    public estadoAgenda: any;
    public seleccionado: boolean;
    public estado: EstadoCalendarioDia;
    public weekend: boolean; // https://www.youtube.com/watch?v=VxuNP0RwwdA
    public agendasDisponibles = [];
    public hoy: Date;
    public turnosDisponibles: number;
    public dinamica = false;
    public agenda = null;
    public programadosDisponibles = 0;
    public gestionDisponibles = 0;
    public delDiaDisponibles = 0;
    public profesionalDisponibles = 0;

    constructor(public fecha: Date, agendas: any[], solicitudPrestacion: any, filtroPrestacion?: any, filtroProfesional?: any) {
        this.agenda = agendas[0];
        this.hoy = new Date();
        if (!this.agenda) {
            this.estado = 'vacio';
        } else {
            let bloquesPrestacion = [];
            this.turnosDisponibles = 0;

            agendas.forEach(unaAgenda => {
                bloquesPrestacion = unaAgenda.bloques; // para filtrado de agendas/bloques segun prestacion y/o profesional

                if (filtroProfesional && !unaAgenda.profesionales.some(prof => prof.id === filtroProfesional.id)) {
                    // si se está filtrando por un profesional que no está en la agenda ...
                    bloquesPrestacion = [];
                }
                if (filtroPrestacion) {
                    bloquesPrestacion = bloquesPrestacion.filter(b => b.tipoPrestaciones.find(tipo => tipo.id === filtroPrestacion.id));
                }
                let hayTurnosDisponibles = (bloquesPrestacion.some(b => b.turnos.some(t => t.estado === 'disponible')));
                this.estadoAgenda = unaAgenda.estado;
                if (hayTurnosDisponibles) {
                    let countBloques = [];

                    // Si la agenda es de hoy, los turnos programados deberán sumarse  al contador "delDia"
                    if (unaAgenda.horaInicio >= moment().startOf('day').toDate() && unaAgenda.horaInicio <= moment().endOf('day').toDate()) {
                        // Por cada bloque asignamos contadores dinamicos con la cantidad inicial de c/tipo de turno (Para sidebar)
                        unaAgenda.bloques.forEach((bloque, indexBloque) => {
                            countBloques.push({
                                delDia: bloque.restantesDelDia + bloque.restantesProgramados,
                                programado: 0,
                                gestion: bloque.restantesGestion,
                                profesional: bloque.restantesProfesional
                            });
                            this.delDiaDisponibles += countBloques[indexBloque].delDia;
                        });

                        // Seteamos el contador de turnos disponibles para el calendario
                        bloquesPrestacion.forEach(unBloque => {
                            this.turnosDisponibles += unBloque.restantesProgramados + unBloque.restantesDelDia;
                        });
                        this.estado = (this.delDiaDisponibles > 0 && this.gestionDisponibles === 0) ? 'disponible' : 'ocupado';

                    } else {
                        // En caso contrario, se calculan los contadores por separado
                        let autocitado = solicitudPrestacion && solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion && solicitudPrestacion.solicitud.registros[0].valor.solicitudPrestacion.autocitado === true;

                        unaAgenda.bloques.forEach((bloque, indexBloque) => {
                            // Por cada bloque asignamos contadores dinamicos con la cantidad inicial de c/tipo de turno (Para sidebar)
                            countBloques.push({
                                delDia: bloque.restantesDelDia,
                                programado: bloque.restantesProgramados,
                                gestion: bloque.restantesGestion,
                                profesional: bloque.restantesProfesional
                            });

                            this.delDiaDisponibles += bloque.restantesDelDia;
                            this.programadosDisponibles += bloque.restantesProgramados;
                            this.gestionDisponibles += bloque.restantesGestion;
                            this.profesionalDisponibles += bloque.restantesProfesional;
                        });

                        // Seteamos el contador de turnos disponibles para el calendario
                        if (hayTurnosDisponibles) {
                            bloquesPrestacion.forEach(unBloque => {
                                if (solicitudPrestacion) {
                                    if (autocitado) {
                                        this.turnosDisponibles += unBloque.restantesProfesional;
                                    } else {
                                        this.turnosDisponibles += unBloque.restantesGestion;
                                    }
                                } else {
                                    this.turnosDisponibles += unBloque.restantesProgramados;
                                }
                            });
                        }
                        // Para enmarcar los días correspondientes en el calendario
                        if (unaAgenda.estado === 'disponible' || unaAgenda.estado === 'publicada') {
                            if (solicitudPrestacion) {
                                if (this.gestionDisponibles > 0 && !autocitado) {
                                    this.estado = 'disponible';
                                    hayTurnosDisponibles = true;
                                } else if (this.profesionalDisponibles > 0 && autocitado) {
                                    this.estado = 'disponible';
                                    hayTurnosDisponibles = true;
                                } else {
                                    this.estado = 'vacio';
                                    hayTurnosDisponibles = false;
                                    this.turnosDisponibles = 0;
                                }
                            } else {
                                if (this.turnosDisponibles > 0) {
                                    this.estado = 'disponible';
                                } else {
                                    this.estado = 'vacio';
                                }
                            }
                        }
                    }
                    if (this.turnosDisponibles > 0) {
                        this.agendasDisponibles.push(unaAgenda);
                    }
                } else {
                    // Para enmarcar los días correspondientes en el calendario
                    if (unaAgenda.dinamica) {
                        this.estado = 'disponible';
                        this.dinamica = true;
                        this.agendasDisponibles.push(unaAgenda);
                        if (unaAgenda.cupo && unaAgenda.cupo > 0) {
                            this.turnosDisponibles += unaAgenda.cupo;
                        }

                    } else {
                        this.estado = 'ocupado';
                    }
                }
            });

        }
    }
}
