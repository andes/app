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

    constructor(public fecha: Date, public agenda: any, solicitudPrestacion: any, filtroPrestacion?: any) {
        this.hoy = new Date();
        this.turnosDisponibles = 0;
        if (!agenda) {
            this.estado = 'vacio';
        } else {
            let hayTurnosDisponibles: boolean = (this.agenda.turnosDisponibles > 0);
            this.estadoAgenda = this.agenda.estado;
            if (hayTurnosDisponibles) {
                let countBloques = [];
                let bloquesPrestacion = agenda.bloques; // filtra los bloques de interés según prestacion

                if (filtroPrestacion) {
                    bloquesPrestacion = agenda.bloques.filter(b => b.tipoPrestaciones.find(tipo => tipo.id === filtroPrestacion.id));
                }
                // Si la agenda es de hoy, los turnos programados deberán sumarse  al contador "delDia"
                if (this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate()) {
                    // Por cada bloque asignamos contadores dinamicos con la cantidad inicial de c/tipo de turno (Para sidebar)
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
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

                    this.agenda.bloques.forEach((bloque, indexBloque) => {
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

                        // Para enmarcar los días correspondientes en el calendario
                        if (this.agenda.estado === 'disponible' || this.agenda.estado === 'publicada') {
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
                                if (this.programadosDisponibles > 0) {
                                    this.estado = 'disponible';
                                } else {
                                    this.estado = 'vacio';
                                }
                            }
                        }
                    }); // forEach

                    // Seteamos el contador de turnos disponibles para el calendario
                    if (hayTurnosDisponibles) {
                        this.turnosDisponibles = 0;
                        bloquesPrestacion.forEach(unBloque => {
                            if (solicitudPrestacion) {
                                if (autocitado) {
                                    this.turnosDisponibles = unBloque.restantesProfesional;
                                } else {
                                    this.turnosDisponibles = unBloque.restantesGestion;
                                }
                            } else {
                                this.turnosDisponibles += unBloque.restantesProgramados;
                            }
                        });
                    }
                }

            } else {
                // Para enmarcar los días correspondientes en el calendario
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
