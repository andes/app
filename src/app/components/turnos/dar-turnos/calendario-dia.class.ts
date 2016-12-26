type Estado = "vacio" | "disponible" | "ocupado"

export class CalendarioDia {
    public seleccionado: boolean;
    public estado: Estado;

    constructor(public fecha: Date, public agenda: any) {
        if (!agenda)
            this.estado = "vacio";
        else {
            // TODO: controlar si hay turnos disponibles
            let disponible: boolean = false;
            this.agenda.bloques.every(function (bloque, index) {
                bloque.turnos.every(function (turno, index) {
                    // Do something.
                    if (turno.estado == "disponible"){
                        disponible = true;
                        return false;
                    }
                    else return true;
                });
                if (disponible)
                    return false;
                else return true;
            });
            if (disponible)
                this.estado = "disponible";
            else    
                this.estado = "ocupado";
        }
    }
}