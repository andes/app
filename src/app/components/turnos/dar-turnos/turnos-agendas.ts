import { TurnoService } from './../../../services/turnos/turno.service';
import { Observable } from 'rxjs/Rx';
import { PacienteService } from './../../../services/paciente.service';
import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
//Interfaces
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
//Servicios
import { PrestacionService } from './../../../services/turnos/prestacion.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'turnos-agendas',
    templateUrl: 'turnos-agendas.html'
})
export class TurnosAgendaComponent implements OnInit {
    constructor(public plex: Plex, public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService,
        public serviceEspacioFisico: EspacioFisicoService, public serviceTurno: TurnoService) { }

    private _agendas: IAgenda[];
    private _agenda: IAgenda;

    semana: String[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sabado"];
    showBuscarAgendas: boolean = true;
    showAgenda: boolean = false;
    indice: number = -1;
    paciente: any = {
        id: "57f66f2076e97c2d18f1808b",
        nombre: "Ramiro",
        apellido: "Diaz",
        documento: "30403872"
    }

    ngOnInit() {
    }

    @Output('agenda-changed') onChange = new EventEmitter();
    @Input('agendas')
    set agendas(value: Array<IAgenda>) {
        this._agendas = value;
    }
    get agendas(): Array<IAgenda> {
        return this._agendas;
    }

    @Input('agenda')
    set agenda(value: IAgenda) {
        this._agenda = value;
        if (value)
            this.indice = this.agendas.indexOf(this.agenda);
    }
    get agenda(): IAgenda {
        return this._agenda;
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get().subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get().subscribe(event.callback);
    }

    verAgenda(suma: boolean) {
        if (this.agendas) {
            var condiciones = suma ? ((this.indice + 1) < this.agendas.length) : ((this.indice - 1) >= 0);
            if (condiciones) {
                if (suma)
                    this.indice++
                else
                    this.indice--;
                this.agenda = this.agendas[this.indice];
                debugger
            }
        }
        if (this.agenda)
            this.onChange.emit(this.agenda);
    }

    seleccionarTurno(bloque: any, indiceBq: number, indice: number) {
        let inicio = bloque.turnos[indice].horaInicio;
        this.plex.confirm('Asignación del turno de las ' +
            inicio.getHours() + ":" + (inicio.getMinutes() < 10 ? '0' : '') +
            inicio.getMinutes() + " al paciente " + this.paciente.nombre + " " + 
            this.paciente.apellido).then(resultado => {
                //this.plex.alert("El turno se asignó correctamente");
                let datosTurno = {
                    "idAgenda": this.agenda.id,
                    "indiceBloque": indiceBq,
                    "indiceTurno": indice,
                    "estado": "asignado",
                    "paciente": this.paciente
                }

                let operacion: Observable<any>;
                operacion = this.serviceTurno.save(datosTurno);
                operacion.subscribe(resultado => {
                    bloque.turnos[indice].estado = "asignado";
                    this.plex.alert("El turno se asignó correctamente");
                });
            });
    }
}