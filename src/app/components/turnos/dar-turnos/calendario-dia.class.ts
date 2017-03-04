type Estado = 'vacio' | 'disponible' | 'ocupado'

export class CalendarioDia {
    public seleccionado: boolean;
    public estado: Estado;
    public cantidadAgendas: number;
    public turnosDisponibles: number;
    constructor(public fecha: Date, public agenda: any) {
        if (!agenda) {
            this.estado = 'vacio';
            this.turnosDisponibles = 0;
        } else {
            let disponible: boolean = this.agenda.turnosDisponibles > 0;
            this.turnosDisponibles = this.agenda.turnosDisponibles;
            if (disponible) {
                this.estado = 'disponible';
            } else {
                this.estado = 'ocupado';
            }
        }
    }
}
