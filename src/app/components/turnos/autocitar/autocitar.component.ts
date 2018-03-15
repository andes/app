import { Component, Input, EventEmitter, Output, OnInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { TurnoService } from '../../../services/turnos/turno.service';
import * as moment from 'moment';

@Component({
    selector: 'autocitar-turno',
    templateUrl: 'autocitar.html'
})

export class AutocitarTurnoAgendasComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    @Input() agendasAutocitar: IAgenda[];
    @Input() prestacionAutocitar: IAgenda;
    @Input() paciente: any;

    // Avisa al componente padre que se canceló la acción de este componente
    @Output() cancelarEmitter: EventEmitter<any> = new EventEmitter<any>();

    public showListaAgendas: boolean;
    public agendaSeleccionada: IAgenda;
    public turnoSeleccionado: ITurno;

    // Autorizado?
    public autorizado = false;

    // Muestra / oculta lista de turnos
    public agendasExpandidas: any[] = [];

    constructor(public router: Router, public auth: Auth, public plex: Plex, public servicioTurno: TurnoService) {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
    }

    ngOnInit() {
        if (!this.autorizado) {
            this.router.navigate(['/rup/crear/autocitar']);
        }

        if (this.agendasAutocitar && this.agendasAutocitar.length > 0) {
            // Filtro Agendas según cambios de acuerdo al día
            this.agendasAutocitar = this.agendasAutocitar.filter(ag => this.comprobarFecha(ag));
            this.showListaAgendas = true;
        }
    }

    comprobarFecha(agenda: IAgenda): Boolean {

        // Genero una fecha 48 horas en el futuro...
        let fechaLimite = moment(new Date()).add(2, 'days');

        if (agenda.horaInicio >= fechaLimite.startOf('day').toDate() && agenda.horaInicio <= fechaLimite.endOf('day').toDate()) {
            return true;
        }

        return false;
    }

    toggleExpandir(index) {
        this.agendasExpandidas[index] = !this.agendasExpandidas[index];
    }

    seleccionarCandidata(indiceTurno, indiceBloque, indiceAgenda) {

        let bloque = this.agendasAutocitar[indiceAgenda].bloques[indiceBloque];
        let turno = this.agendasAutocitar[indiceAgenda].bloques[indiceBloque].turnos[indiceTurno];

        // Agenda con el turno que necesitamos
        this.agendaSeleccionada = this.agendasAutocitar[indiceAgenda];

        // Paciente Turno
        let pacienteSave = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            fechaNacimiento: this.paciente.fechaNacimiento,
            sexo: this.paciente.sexo,
            telefono: this.paciente.telefono,
            carpetaEfectores: this.paciente.carpetaEfectores
        };


        // Creo el Turno nuevo
        let datosTurnoNuevo = {
            idAgenda: this.agendaSeleccionada.id,
            idBloque: bloque.id,
            idTurno: turno.id,
            paciente: pacienteSave,
            tipoPrestacion: this.prestacionAutocitar,
            tipoTurno: 'profesional',
        };


        // ¿Ragnar Turno?
        this.plex.confirm(
            `Confirmar turno el ${moment(turno.horaInicio).format('DD/MM/YYYY [a las] HH:mm [hs]')}`,
            `¿Confirmar Autocitación?`)
            .then((confirmado) => {
                if (!confirmado) {
                    return false;
                }
                // Guardo el Turno nuevo en la Agenda seleccionada como destino (PATCH)
                // y guardo los datos del turno "viejo/suspendido" en la nueva para poder referenciarlo
                this.servicioTurno.save(datosTurnoNuevo).subscribe(resultado => {
                    this.plex.toast('success', 'Turno asigando correctamente', 'Autocitación', 3000);
                    this.cancelarEmitter.emit(true);
                });
            });

    }

    getHora(fecha) {
        return moment(fecha).format('HH:mm');
    }

    getFecha(fecha) {
        return moment(fecha).format('DD/MM/YYYY');
    }

    esTurnoDoble(turno) {
        if (this.agendaSeleccionada) {
            let bloqueTurno = this.agendaSeleccionada.bloques.find(bloque => (bloque.turnos.findIndex(t => (t.id === turno._id)) >= 0));
            let index;
            if (bloqueTurno) {
                index = bloqueTurno.turnos.findIndex(t => { return t.id === turno._id; });
                if ((index === -1) || ((index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado !== 'turnoDoble')) || (index === (bloqueTurno.turnos.length - 1))) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    /**
     * Volver
     */
    cancelarAutocitar() {
        this.cancelarEmitter.emit(true);
    }
}
