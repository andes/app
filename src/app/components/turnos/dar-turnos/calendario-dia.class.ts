type Estado = "vacio" | "disponible" | "ocupado"

export class CalendarioDia {
    public seleccionado: boolean;
    public estado: Estado;

    constructor(public fecha: Date, public agenda: any) {
        if (!agenda)
            this.estado = "vacio";
        else {
            // TODO: controlar si hay turnos disponibles
            this.estado = "disponible";
        }
    }
}