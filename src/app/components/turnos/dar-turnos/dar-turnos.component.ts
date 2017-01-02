type Estado = "seleccionada" | "noSeleccionada" | "confirmacion" | "noTurnos"

import { Plex } from 'andes-plex/src/lib/core/service';
import { TurnoService } from './../../../services/turnos/turno.service';
import { Observable } from 'rxjs/Rx';
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import * as moment from 'moment';

// Servicios
import { PrestacionService } from '../../../services/turnos/prestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';

@Component({
    templateUrl: 'dar-turnos.html',
})
export class DarTurnosComponent implements AfterViewInit {
    public agenda: IAgenda;
    public agendas: IAgenda[];
    public opciones = {
        fecha: new Date(),
        prestacion: null,
        profesional: null,
    }
    public estadoT: Estado;
    private turno: ITurno[];
    private bloque: IBloque;
    private bloques: IBloque[];
    private indiceTurno: number;
    private indiceBloque: number;
    private telefono: String = "2994427394";
    indice: number = -1;
    semana: String[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sabado"];
    paciente: any = {
        id: "57f66f2076e97c2d18f1808b",
        nombre: "Ramiro",
        apellido: "Diaz",
        documento: "30403872"
    }

    constructor(public servicioPrestacion: PrestacionService, public serviceProfesional: ProfesionalService, public serviceAgenda: AgendaService,
        public serviceTurno: TurnoService, public plex: Plex) { }

    ngAfterViewInit() {
        this.actualizar("sinFiltro");
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get().subscribe(event.callback);
    }

    actualizar(etiqueta) {
        let params: any = {};
        this.estadoT = "noSeleccionada";
        this.agenda = null;
        if (etiqueta != "sinFiltro") {
            params = {
                "idPrestacion": this.opciones.prestacion ? this.opciones.prestacion.id : '',
                "idProfesional": this.opciones.profesional ? this.opciones.profesional.id : ''
            }
        }
        else {
            this.opciones.prestacion = null;
            this.opciones.profesional = null;
        }
        this.serviceAgenda.get(params).subscribe(agendas => { this.agendas = agendas; this.indice = -1; });
    }

    seleccionarAgenda(agenda) {
        this.agenda = agenda;
        this.bloques = this.agenda.bloques;
        let prestacion: String = this.opciones.prestacion?this.opciones.prestacion.id:"";
        this.bloques = this.agenda.bloques.filter(
            function (value) {
                let prestacionesBlq = value.prestaciones.map(function (obj) {
                    return obj.id;
                });
                if (prestacion)
                    return (prestacionesBlq.indexOf(prestacion)>=0);
                else
                    return true;
            }
        );
        let hayLibre: boolean = false;
        if (this.agenda) {
            this.indice = this.agendas.indexOf(this.agenda);
            //for (let bloque of this.agenda.bloques) {
            for (let bloque of this.bloques) {
                for (let turno of bloque.turnos) {
                    if (turno.estado == "disponible") {
                        hayLibre = true;
                        break;
                    }
                }
                if (hayLibre)
                    break;
            }
            if (hayLibre)
                this.estadoT = "seleccionada";
            else
                this.estadoT = "noTurnos";
        }
    }

    seleccionarTurno(bloque: any, indice: number) {
        this.bloque = bloque;
        this.indiceBloque = this.agenda.bloques.indexOf(this.bloque);
        this.indiceTurno = indice;
        this.turno = bloque.turnos[indice];
        let inicio = bloque.turnos[indice].horaInicio;
        this.estadoT = "confirmacion";
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
            }
        }
        this.seleccionarAgenda(this.agenda);
    }

    cambiarMes(signo) {
        if (signo == "+")
            this.opciones.fecha = moment(this.opciones.fecha).add(1, 'M').toDate();
        else
            this.opciones.fecha = moment(this.opciones.fecha).subtract(1, 'M').toDate();
        this.actualizar('');
    }

    onSave() {
        let datosTurno = {
            "idAgenda": this.agenda.id,
            "indiceBloque": this.indiceBloque,
            "indiceTurno": this.indiceTurno,
            "estado": "asignado",
            "paciente": this.paciente
        }
        this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = "asignado";
        let operacion: Observable<any>;
        operacion = this.serviceTurno.save(datosTurno);
        operacion.subscribe(resultado => {
            debugger
            this.estadoT = "noSeleccionada";
            this.agenda = null;
            this.actualizar("sinFiltro");
            this.plex.alert("El turno se asignó correctamente");
        });
    }
} 