import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../services/profesional.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { GestorAgendasService } from './../../services/turnos/gestor-agendas.service';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import * as moment from 'moment';

@Component({
    selector: 'gestor-agendas',
    templateUrl: 'gestor-agendas.html',
    providers: [GestorAgendasService]
})

export class GestorAgendasComponent implements OnInit {

    public autorizado = false;

    public agendas: any = [];
    public agenda: any = {};
    public agendaSel: AgendaSeleccionada;

    agendasSeleccionadas: IAgenda[] = [];

    public showGestorAgendas: Boolean = true;
    public showTurnos: Boolean = false;
    public showVistaAgendas: Boolean = false;
    public showClonar: Boolean = false;
    public showDarTurnos: Boolean = false;
    public showEditarAgenda: Boolean = false;
    public showEditarAgendaPanel: Boolean = false;
    public fechaDesde: any;
    public fechaHasta: any;

    public modelo: any = {};

    public hoy = false;

    searchForm: FormGroup;

    ag: IAgenda;
    vistaAgenda: IAgenda;
    reasignar: IAgenda;
    editaAgenda: IAgenda;

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: TipoPrestacionService,
        public serviceProfesional: ProfesionalService, public serviceEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService, private router: Router, private gestorAgendasService: GestorAgendasService,
        public auth: Auth) { }

    ngOnInit() {

        this.autorizado = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;

        // Por defecto cargar/mostrar agendas de hoy
        this.hoy = true;
        this.loadAgendas();

        // Reactive Form
        this.searchForm = this.formBuilder.group({
            // Debe respetarse el tipo de dato Date, o el componente datepicker no funciona
            fechaDesde: [new Date()],
            fechaHasta: [new Date()],
            prestaciones: [''],
            profesionales: [''],
            espacioFisico: [''],
            estado: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {

            let fechaDesde = moment(value.fechaDesde).startOf('day');
            let fechaHasta = moment(value.fechaHasta).endOf('day');

            let params = {
                fechaDesde: fechaDesde.format(),
                fechaHasta: fechaHasta.format(),
            };

            // Filtro de Tipos de Prestaciones (si está vacío, trae todas)
            if ( value.prestaciones ) {
                params['idTipoPrestacion'] = value.prestaciones.id;
            }
            if ( value.profesionales ) {
                params['idProfesional'] = value.profesionales.id;
            }
            if ( value.espacioFisico ) {
                params['espacioFisico'] = value.espacioFisico.id;
            }
            if ( value.estado ) {
                params['estado'] = value.estado.id;
            }

            this.serviceAgenda.get( params ).subscribe(
                agendas => {
                    this.hoy = false;
                    this.agendas = agendas;
                    this.fechaDesde = fechaDesde;
                    this.fechaHasta = fechaHasta;
                },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        });

    }

    clonar(modelo) {
        this.modelo = modelo;
        this.showGestorAgendas = false;
        this.showClonar = true;
    }

    cancelaClonar() {
        this.showGestorAgendas = true;
        this.showClonar = false;
    }

    // Cancelar la edición de una Agenda completa
    cancelaEditar() {
        this.showGestorAgendas = true;
        this.showEditarAgenda = false;
    }

    reasignaTurno(reasTurno) {
        this.reasignar = reasTurno;
        this.showGestorAgendas = false;
        this.showDarTurnos = true;
    }

    showVistaTurnos(showTurnos: Boolean) {
        this.showTurnos = showTurnos;
        this.showEditarAgendaPanel = false;
    }

    editarAgenda(agenda) {
        this.editaAgenda = agenda;

        if ( this.editaAgenda.estado === 'Planificacion' ){
            this.showGestorAgendas = false;
            this.showEditarAgenda = true;
            this.showEditarAgendaPanel = false;
        } else {
            this.showGestorAgendas = true;
            this.showEditarAgenda = false;
            this.showEditarAgendaPanel = true;
            this.showTurnos = false;
        }
    }

    loadAgendas() {

        let fecha = moment().format();

        if ( this.hoy ) {
            this.fechaDesde = moment(fecha).startOf('day');
            this.fechaHasta = moment(fecha).endOf('day');
        }

        this.serviceAgenda.get({
            fechaDesde:         this.fechaDesde,
            fechaHasta:         this.fechaHasta,
            idTipoPrestacion:   '',
            idProfesional:      '',
            idEspacioFisico:    ''
        }).subscribe(
            agendas => {
                this.agendas = agendas;
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({ turneable: 1 }).subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.serviceProfesional.get({}).subscribe(event.callback);
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get({}).subscribe(event.callback);
    }

    loadEstados(event) {
        this.serviceAgenda.get({}).subscribe( agendas => {
            let estadosAgendas = agendas[0].estadosAgendas.map( estado => {
                return { id: estado, nombre: estado }; // armo objeto compatible con plex-select
            });
            event.callback(estadosAgendas);
        });
    }

    verAgenda(agenda, e) {
        let index;

        if (this.estaSeleccionada(agenda)) {
            agenda.agendaSeleccionadaColor = 'success';
            index = this.agendasSeleccionadas.indexOf(agenda);
            this.agendasSeleccionadas.splice(index, 1);
            this.agendasSeleccionadas = [...this.agendasSeleccionadas];

        } else {
            this.agendasSeleccionadas = [...this.agendasSeleccionadas, agenda];
        }

        this.setColorEstadoAgenda(agenda);
        this.ag = agenda;
        this.vistaAgenda = agenda;
        this.agenda = agenda;

        this.showVistaAgendas = true;
        this.showTurnos = true;
    }

    estaSeleccionada(agenda: any) {
        return this.agendasSeleccionadas.indexOf(agenda) >= 0;
    }

    setColorEstadoAgenda(agenda) {
        if (agenda.estado === 'Suspendida') {
            agenda.agendaSeleccionadaColor = 'danger';
        } else {
            agenda.agendaSeleccionadaColor = 'success';
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    gestorAgendas() {
        this.showGestorAgendas = false;
    }

    actualizarEstadoEmit() {
        this.loadAgendas();
        this.showTurnos = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
    }

}

class AgendaSeleccionada {
    public agendaSeleccionada: boolean;
    public agendasSeleccionadas: any = [];
    public agendaSeleccionadaColor: String;
}
