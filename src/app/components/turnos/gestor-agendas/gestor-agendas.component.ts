import { Component, OnInit, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import * as moment from 'moment';

@Component({
    selector: 'gestor-agendas',
    templateUrl: 'gestor-agendas.html'
})

export class GestorAgendasComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    agendasSeleccionadas: IAgenda[] = [];

    public showGestorAgendas: Boolean = true;
    public showTurnos: Boolean = false;
    public showVistaAgendas: Boolean = false;
    public showClonar: Boolean = false;
    public showDarTurnos: Boolean = false;
    public showEditarAgenda: Boolean = false;
    public showEditarAgendaPanel: Boolean = false;
    public showListado: Boolean = false;
    public showInsertarAgenda: Boolean = false;
    public showAgregarNotaAgenda: Boolean = false;
    public fechaDesde: any;
    public fechaHasta: any;
    public agendas: any = [];
    public agenda: any = {};
    public modelo: any = {};
    public hoy = false;
    public autorizado = false;
    public mostrarMasOpciones = false;

    searchForm: FormGroup;

    ag: IAgenda;
    vistaAgenda: IAgenda;
    reasignar: IAgenda;
    editaAgenda: IAgenda;

    items: any[];

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: TipoPrestacionService,
        public serviceProfesional: ProfesionalService, public serviceEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService, private router: Router,
        public auth: Auth) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;

        // No está autorizado para ver esta pantalla?
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {

            this.items = [
                { label: 'Inicio', route: '/inicio' },
                { label: 'MPI', route: '/' },
                { label: 'Agendas', route: '/gestor_agendas' }
            ];

            // Por defecto cargar/mostrar agendas de hoy
            this.hoy = true;
            this.loadAgendas();

            // Reactive De-Form
            this.searchForm = this.formBuilder.group({
                // Debe respetarse el tipo de dato Date, o el componente datepicker no funciona
                fechaDesde: [new Date()],
                fechaHasta: [new Date()],
                prestaciones: [''],
                profesionales: [''],
                espacioFisico: [''],
                estado: ['']
            });

            // Un buen día los formularios reactivos volarán...
            this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {

                let fechaDesde = moment(value.fechaDesde).startOf('day');
                let fechaHasta = moment(value.fechaHasta).endOf('day');
                let params = {};

                if (fechaDesde.isValid() && fechaHasta.isValid()) {
                    params = {
                        fechaDesde: fechaDesde.format(),
                        fechaHasta: fechaHasta.format(),
                        organizacion: this.auth.organizacion._id
                    };
                } else {
                    // Demos tiempo para que seleccionen una fecha válida, claro papá
                    return;
                }

                // Filtro de Tipos de Prestaciones (si está vacío, trae todas)
                if (value.prestaciones) {
                    params['idTipoPrestacion'] = value.prestaciones.id;
                }
                if (value.profesionales) {
                    params['idProfesional'] = value.profesionales.id;
                }
                if (value.espacioFisico) {
                    params['espacioFisico'] = value.espacioFisico.id;
                }
                if (value.estado) {
                    params['estado'] = value.estado.id;
                }

                this.serviceAgenda.get(params).subscribe(
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

    }

    agregarNotaAgenda() {
        this.showClonar = false;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showTurnos = false;
        this.showListado = false;
        this.showAgregarNotaAgenda = true;
    }

    cancelaAgregarNotaAgenda() {
        this.showTurnos = true;
        this.showAgregarNotaAgenda = false;
    }
    saveAgregarNotaAgenda() {
        this.loadAgendas();
        this.showTurnos = true;
        this.showAgregarNotaAgenda = false;
    }

    clonar() {
        this.showGestorAgendas = false;
        this.showClonar = true;
    }

    // Volver al gestor luego de hacer algo
    volverAlGestor() {
        this.showGestorAgendas = true;
        this.showEditarAgenda = false;
        this.showInsertarAgenda = false;
        this.showAgregarNotaAgenda = false;
        this.showClonar = false;
        this.loadAgendas();
    }

    reasignaTurno(reasTurno) {
        this.reasignar = reasTurno;
        this.showGestorAgendas = false;
        this.showDarTurnos = true;
    }

    showVistaTurnos(showTurnos: Boolean) {
        this.showTurnos = showTurnos;
        this.showEditarAgendaPanel = false;
        this.showAgregarNotaAgenda = false;
    }

    insertarAgenda() {
        this.showInsertarAgenda = true;
        this.showGestorAgendas = false;
    }

    editarAgenda(agenda) {
        this.editaAgenda = agenda;

        if (this.editaAgenda.estado === 'planificacion') {
            this.showGestorAgendas = false;
            this.showEditarAgenda = true;
            this.showEditarAgendaPanel = false;
        } else {
            this.showGestorAgendas = true;
            this.showEditarAgenda = false;
            this.showEditarAgendaPanel = true;
            this.showTurnos = false;
        }
        this.showAgregarNotaAgenda = false;
        this.showListado = false;
    }

    listarTurnos(agenda) {
        this.showGestorAgendas = true;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showTurnos = false;
        this.showListado = true;
    }

    loadAgendas() {

        let fecha = moment().format();

        if (this.hoy) {
            this.fechaDesde = moment(fecha).startOf('day');
            this.fechaHasta = moment(fecha).endOf('day');
        }

        this.serviceAgenda.get({
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion._id,
            idTipoPrestacion: '',
            idProfesional: '',
            idEspacioFisico: ''
        }).subscribe(
            agendas => {
                this.agendas = agendas;
                this.agendasSeleccionadas = [];
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
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadEspaciosFisicos(event) {
        this.serviceEspacioFisico.get({ organizacion: this.auth.organizacion._id }).subscribe(event.callback);
    }

    loadEstados(event) {
        this.serviceAgenda.get({}).subscribe(agendas => {
            if (agendas.length > 0) {
                let estadosAgendas = agendas[0].estadosAgendas.map(estado => {
                    return { id: estado, nombre: estado }; // return objeto compatible con plex-select
                });
                event.callback(estadosAgendas);
            } else {
                event.callback([]);
            }
        });
    }

    verAgenda(agenda, multiple, e) {

        this.showVistaAgendas = false;
        this.showTurnos = false;
        this.showListado = false;

        this.serviceAgenda.getById(agenda.id).subscribe(ag => {
            // Actualizo la agenda local
            agenda = ag;
            // Actualizo la agenda global (modelo)
            this.agenda = ag;

            if (!multiple) {
                this.agendasSeleccionadas = [];
                this.agendasSeleccionadas = [...this.agendasSeleccionadas, ag];
            } else {
                let index;
                if (this.estaSeleccionada(agenda)) {
                    agenda.agendaSeleccionadaColor = 'success';
                    index = this.agendasSeleccionadas.indexOf(agenda);
                    this.agendasSeleccionadas.splice(index, 1);
                    this.agendasSeleccionadas = [...this.agendasSeleccionadas];
                } else {
                    this.agendasSeleccionadas = [...this.agendasSeleccionadas, ag];
                }
            }

            this.setColorEstadoAgenda(agenda);

            // Reseteo el panel de la derecha
            this.showEditarAgendaPanel = false;
            this.showAgregarNotaAgenda = false;
            this.showVistaAgendas = true;
            this.showTurnos = true;
        });

    }

    estaSeleccionada(agenda: any) {
        return this.agendasSeleccionadas.find(x => x.id === agenda._id);
    }

    setColorEstadoAgenda(agenda) {
        if (agenda.estado === 'suspendida') {
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
        this.showAgregarNotaAgenda = false;
    }

}

