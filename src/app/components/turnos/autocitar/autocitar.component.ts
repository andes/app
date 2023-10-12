import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { IObraSocial } from '../../../interfaces/IObraSocial';
import { TurnoService } from '../../../services/turnos/turno.service';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';

@Component({
    selector: 'autocitar-turno',
    templateUrl: 'autocitar.html',
    styles: [`
        .rounded {
            border: #00a8e0 solid 3px;
            border-radius: 50%;
            text-align: center;
            width: 60px;
            height: 60px;
            font-size: 3rem;
        }
    `]
})

export class AutocitarTurnoAgendasComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;
    @Input() agendasAutocitar: IAgenda[];
    @Input() prestacionAutocitar: IAgenda;
    @Input() paciente: any;

    // Avisa al componente padre que se canceló la acción de este componente
    @Output() cancelarEmitter: EventEmitter<any> = new EventEmitter<any>();

    public showListaAgendas: boolean;
    public agendaSeleccionada: IAgenda;
    public turnoSeleccionado: ITurno;
    public obraSocialPaciente: IObraSocial;
    // Autorizado?
    public autorizado = false;

    // Muestra / oculta lista de turnos
    public agendasExpandidas: any[] = [];

    public bloqueAgenda: IBloque;
    turno: any;

    constructor(public router: Router, public auth: Auth, public plex: Plex, public servicioTurno: TurnoService,
    ) {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
    }

    ngOnInit() {
        if (!this.autorizado) {
            this.router.navigate(['/rup/crear/autocitar']);
        }

        if (this.agendasAutocitar?.length) {
            this.showListaAgendas = true;
        }
    }

    seleccionarAgenda(index) {
        this.agendaSeleccionada = this.agendasAutocitar[index];
        this.agendasExpandidas[index] = !this.agendasExpandidas[index];
        this.turnoSeleccionado = null;
    }

    seleccionarTurno(indiceTurno, indiceBloque) {
        this.bloqueAgenda = this.agendaSeleccionada.bloques[indiceBloque];
        this.turnoSeleccionado = this.agendaSeleccionada.bloques[indiceBloque].turnos[indiceTurno];
        this.obraSocialPaciente = null;

        if (this.paciente && this.paciente.financiador && this.paciente.financiador.length > 0) {
            this.obraSocialPaciente = this.paciente.financiador[0];
        }
    }

    confirmarTurno() {
        this.guardarTurno(this.bloqueAgenda, this.turnoSeleccionado);
    }

    cerrarModal() {
        this.modal.showed = false;
    }

    abrirModal() {
        this.modal.showed = true;
    }

    cerrarAutocitar() {
        this.cancelarEmitter.emit(true);
    }

    private guardarTurno(bloque: IBloque, turno: ITurno) {
        // Paciente Turno
        const pacienteSave = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            alias: this.paciente.alias,
            fechaNacimiento: this.paciente.fechaNacimiento,
            sexo: this.paciente.sexo,
            genero: this.paciente.genero,
            telefono: this.paciente.telefono,
            carpetaEfectores: this.paciente.carpetaEfectores,
            obraSocial: this.obraSocialPaciente
        };
        // Creo el Turno nuevo
        const datosTurnoNuevo = {
            idAgenda: this.agendaSeleccionada.id,
            idBloque: bloque.id,
            idTurno: turno.id,
            paciente: pacienteSave,
            tipoPrestacion: this.prestacionAutocitar,
            tipoTurno: 'profesional',
        };

        this.servicioTurno.save(datosTurnoNuevo).pipe(
            catchError(() => {
                this.cerrarModal();
                return of(null);
            })
        ).subscribe((confirmacion) => {
            if (confirmacion) {
                this.plex.toast('success', 'El turno autocitado se guardo correctamente');
                this.cancelarEmitter.emit(true);
            }
        });
    }

    esTurnoDoble(turno) {
        if (this.agendaSeleccionada) {
            const bloqueTurno = this.agendaSeleccionada.bloques.find(bloque => (bloque.turnos.findIndex(t => (t.id === turno._id)) >= 0));
            let index;
            if (bloqueTurno) {
                index = bloqueTurno.turnos.findIndex(t => {
                    return t.id === turno._id;
                });
                if ((index === -1) || ((index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado !== 'turnoDoble')) || (index === (bloqueTurno.turnos.length - 1))) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }
}
