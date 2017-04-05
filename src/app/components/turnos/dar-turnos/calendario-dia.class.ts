import * as moment from 'moment';

type Estado = 'vacio' | 'disponible' | 'ocupado';

export class CalendarioDia {
    public seleccionado: boolean;
    public estado: Estado;
    public cantidadAgendas: number;
    public turnosDisponibles: number;
    constructor(public fecha: Date, public agenda: any) {
        // if (!agenda) {
        //     this.estado = 'vacio';
        //     this.turnosDisponibles = 0;
        // } else {
        //     let disponible: boolean = this.agenda.turnosDisponibles > 0;
        //     this.turnosDisponibles = this.agenda.turnosDisponibles;
        //     if (disponible) {
        //         this.estado = 'disponible';
        //     } else {
        //         this.estado = 'ocupado';
        //     }
        // }

        if (!agenda) {
            this.estado = 'vacio';
            this.turnosDisponibles = 0;
        } else {
            debugger
            let disponible: boolean = this.agenda.turnosDisponibles > 0;
            this.turnosDisponibles = this.agenda.turnosDisponibles;
            if (disponible) {
                let tiposTurnosSelect: String;
                let turnosDisponibles = 0;
                let programadosDisponibles = 0;
                let gestionDisponibles = 0;
                let countBloques = [];
                // let tiposTurnosSelect = [];
                if (this.agenda.estado === 'Disponible') {
                    tiposTurnosSelect = 'gestion';
                }
                if (this.agenda.estado === 'Publicada') {
                    tiposTurnosSelect = 'programado';
                }
                // Si la agenda es de hoy, los turnos deberán sumarse  al contador "delDia"
                if (this.agenda.horaInicio >= moment(new Date()).startOf('day').toDate()
                    && this.agenda.horaInicio <= moment(new Date()).endOf('day').toDate()) {
                    tiposTurnosSelect = 'delDia';
                    // recorro los bloques y cuento  los turnos como 'del dia', luego descuento los ya asignados
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        debugger;
                        countBloques.push({
                            delDia: bloque.cantidadTurnos,
                            programado: 0,
                            gestion: 0,
                        });
                        bloque.turnos.forEach((turno) => {
                            if (turno.estado === 'asignado') {
                                countBloques[indexBloque].delDia--;
                            }
                        });
                        turnosDisponibles = + countBloques[indexBloque].delDia;
                    });
                    (turnosDisponibles > 0) ? this.estado = 'disponible' : this.estado = 'ocupado';

                } else {
                    // En caso contrario, se calculan  los contadores por separado

                    // loopear turnos para sacar el tipo de turno!
                    this.agenda.bloques.forEach((bloque, indexBloque) => {
                        debugger;
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
                            programadosDisponibles = + countBloques[indexBloque].programado;
                            gestionDisponibles = + countBloques[indexBloque].gestion;
                        });
                        if (this.agenda.estado === 'Disponible') {
                            (gestionDisponibles > 0) ? this.estado = 'disponible' : this.estado = 'ocupado';
                        }
                        if (this.agenda.estado === 'Publicada') {
                            (programadosDisponibles > 0) ? this.estado = 'disponible' : this.estado = 'ocupado';
                        }
                    });
                }
            } else {
                this.estado = 'ocupado';
            }
        }
    }
}
