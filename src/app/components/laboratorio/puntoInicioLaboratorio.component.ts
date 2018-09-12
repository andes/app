import { PrestacionesService } from './../../modules/rup/services/prestaciones.service';
import { Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as enumerados from './../../utils/enumerados';
import { OrganizacionService } from '../../services/organizacion.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { TurnoService } from '../../services/turnos/turno.service';

@Component({
    selector: 'gestor-protocolos',
    templateUrl: 'puntoInicioLaboratorio.html',
    styleUrls: ['./laboratorio.scss']
})

export class PuntoInicioLaboratorioComponent

    implements OnInit {
    public prestaciones = [];
    public prestacionesEntrada: any;
    prestacionSeleccionada: any;

    public seleccionPaciente = false;
    public showListarProtocolos = true;
    public showProtocoloDetalle = false;
    public showCargarSolicitud = false;
    public esPacienteSinTurno = false;

    public protocolos: any = [];
    public protocolo: any = {
        paciente: {
            id: '',
            nombre: '',
            apellido: '',
            documento: '',
            sexo: '',
            fechaNacimiento: new Date()
        },
        solicitud: {
            esSolicitud: true,
            tipoPrestacion: null,
            organizacion: {},
            profesional: null,
            ambitoOrigen: 'ambulatorio',
            fecha: new Date(),
            registros: []
        },
        ejecucion: {
            fecha: new Date(),
            registros: []
        }
    };

    public fechaDesde: any = new Date();
    public fechaHasta: any = new Date();
    public origenEnum: any;
    public prioridadesFiltroEnum;
    public laboratorioInternoEnum: any;
    public dniPaciente: any;
    public pacientes;
    public pacienteActivo;
    public cargaLaboratorioEnum;
    public mostrarListaMpi = false;
    public indexProtocolo;
    public accion;
    public turnosRecepcion;
    public modo = {
        id: 'control',
        nombre: 'Control'
    };
    public formaCarga = {
        listProtocolo: false,
        hTrabajo: false,
        pAnalisis: false
    };
    public origen = {
        id: 'todos',
        nombre: 'todos'
    };
    public area = {
        id: null,
        nombre: null
    };
    public prioridad = {
        id: 'todos',
        nombre: 'todos'
    };
    public busqueda = {
        solicitudDesde: new Date(),
        solicitudHasta: new Date(),
        pacienteDocumento: null,
        nombrePaciente: null,
        apellidoPaciente: null,
        origen: 'todos',
        numProtocoloDesde: null,
        numProtocoloHasta: null,
        servicios: null,
        prioridad: null,
        area: null,
        laboratorioInterno: null,
        tipoPrestacionSolicititud: '15220000',
        organizacion: this.auth.organizacion._id,
    };
    public parametros = {
        solicitudDesde: null,
        solicitudHasta: null,
        tipoPrestacionSolicititud: '15220000',
        organizacion: this.auth.organizacion._id,
        pacienteDocumento: null,
        nombrePaciente: null,
        apellidoPaciente: null,
        numProtocoloDesde: null,
        numProtocoloHasta: null
    };

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        public servicioPrestaciones: PrestacionesService,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private turnoService: TurnoService
    ) { }

    ngOnInit() {
        this.prioridadesFiltroEnum = enumerados.getPrioridadesFiltroLab();
        this.origenEnum = enumerados.getOrigenLab();
        this.laboratorioInternoEnum = enumerados.getLaboratorioInterno();
        this.cargaLaboratorioEnum = enumerados.getCargaLaboratorio();
        this.getlocalStorage();
        this.refreshSelection();

    }

    // funciones
    refreshSelection(value?, tipo?) {
        if (this.origen.id === 'todos') {
            this.busqueda.origen = null;
        } else {
            this.busqueda.origen = this.origen.id;
        }
        if (this.area.id === 'todos') {
            this.busqueda.area = null;
        } else {
            this.busqueda.area = this.area.id;
        }
        if (this.prioridad.id === 'todos') {
            this.busqueda.prioridad = null;
        } else {
            this.busqueda.prioridad = this.prioridad.id;
        }
        this.getProtocolos(this.busqueda);
    };




    getNumeroProtocolo(registros) {
        let registro: any = registros.find((reg) => {
            return reg.nombre === 'numeroProtocolo';
        });
        return registro ? registro.valor.numeroCompleto : null;
    }

    getProtocolos(params: any) {
        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                console.log(err);
            }
        });
    }

    estaSeleccionado(protocolo) {
        return false;
    }

    verProtocolo(protocolo, multiple, e, index) {
        // Si se presionó el boton suspender, no se muestran otros protocolos hasta que se confirme o cancele la acción.
        if (protocolo) {
            // this.serviceAgenda.getById(agenda.id).subscribe(ag => {
            this.protocolo = protocolo;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = index;

            this.seleccionPaciente = false;
            this.showCargarSolicitud = true;
            // }
        }
    }
    volverLista() {
        this.showListarProtocolos = true;
        this.showProtocoloDetalle = false;
        this.showCargarSolicitud = false;
    }

    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            let servicioEnum = organizacion.unidadesOrganizativas;
            $event.callback(servicioEnum);
        });

    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }


    loadPrioridad(event) {
        event.callback(enumerados.getPrioridadesLab());
        return enumerados.getPrioridadesLab();
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
            if (this.pacientes) {
                this.mostrarListaMpi = true;
            } else {
                this.mostrarListaMpi = false;
            }
        }
    }


    seleccionarPaciente(paciente: any) {
        // this.plex.info('success', `Seleccionó el paciente ${paciente.apellido}, ${paciente.nombre}`);
        this.pacienteActivo = paciente;
        if (this.pacienteActivo) {
            this.busqueda.pacienteDocumento = paciente.documento;

        } else {
            this.busqueda.pacienteDocumento = null;
        }
        if (this.modo.nombre === 'Recepcion') {
            this.turnosLaboratorio();
        } else {
            this.refreshSelection(null, 'dniPaciente');
        }

    }

    hoverPaciente(paciente: any) {
        this.pacienteActivo = paciente;
    }

    changeCarga(tipo) {
        if (tipo === 'pAnalisis') {
            console.log('por analisis');
            this.formaCarga.listProtocolo = false;
            this.formaCarga.hTrabajo = false;
        } else if (tipo === 'hTrabajo') {
            console.log('por hTrabajo');
            this.formaCarga.pAnalisis = false;
            this.formaCarga.listProtocolo = false;
        } else if (tipo === 'listProtocolo') {
            console.log('por listProtocolo');
            this.formaCarga.pAnalisis = false;
            this.formaCarga.hTrabajo = false;
        };
        console.log(this.formaCarga);
    }

    changeServicio() {
        this.busqueda.servicios = null;
        this.accion = this.modo.nombre;

        switch (this.modo.nombre) {
            case 'Carga':
                this.accion = 'Cargar';
                this.refreshSelection();
                break;
            case 'Control':
                this.accion = 'Control';
                this.refreshSelection();
                break;
            case 'Validacion':
                this.accion = 'Validar';
                this.refreshSelection();
                break;
            case 'Recepcion':
                this.accion = 'Recepcionar';

                this.turnosLaboratorio();
                break;
        }

    }

    turnosLaboratorio() {
        let busqueda = {
            fechaDesde: this.busqueda.solicitudDesde,
            fechaHasta: this.busqueda.solicitudHasta,
            pacienteDni: null,
            protocoloIniciado: false
        };
        if (this.pacienteActivo) {
            busqueda.pacienteDni = this.pacienteActivo.documento;
        }
        // this.turnoService.getTurnosLabo(busqueda).subscribe(c => { this.turnosRecepcion = c; });
        this.servicioPrestaciones.getPrestacionesLaboratorio(busqueda).subscribe(turnos => { 
            this.turnosRecepcion = turnos;
        });
    }

    formularioSolicitud() {
        this.seleccionPaciente = false;
        this.showListarProtocolos = false;
        this.showProtocoloDetalle = true;
        this.showCargarSolicitud = true;
    }

    pacienteSinTurno() {
        this.seleccionPaciente = true;
        this.showProtocoloDetalle = false;
        this.showListarProtocolos = false;
        this.showCargarSolicitud = true;
    }


    recordarFiltros() {
        let filtrosPorDefecto = {
            busqueda: this.busqueda,
            profesional: this.auth.profesional._id
        };
        localStorage.setItem('filtros', JSON.stringify(filtrosPorDefecto));
        this.plex.toast('success', 'Se recordará su selección de filtro en sus próximas sesiones.', 'Información', 3000);
    }


    getlocalStorage() {
        let ls = JSON.parse(localStorage.getItem('filtros'));
        if (ls.profesional === this.auth.profesional._id) {
            this.busqueda = ls.busqueda;
            this.origen.id = ls.busqueda.origen;
            this.area.id = ls.busqueda.area;
            this.prioridad.id = ls.busqueda.prioridad;
            this.busqueda.solicitudDesde = new Date(ls.busqueda.solicitudDesde);
        }

        if (this.modo.nombre === 'Recepcion') {
            this.turnosLaboratorio();
        }
    }

    getPrioridad(x) {
        return null;
    }

    // recordarFiltros() {
    //     let filtrosPorDefecto = {
    //         busqueda: this.busqueda,
    //         profesional: this.auth.profesional._id
    //     };
    //     let filtros = JSON.parse(localStorage.getItem('filtros'));
    //     console.log(filtros);
    //     if (!filtros) {
    //         filtros = [filtrosPorDefecto];
    //     } else {
    //         let existe = filtros.findIndex(x => x.profesional === filtrosPorDefecto.profesional);
    //         console.log(existe);
    //         if (existe === -1) {
    //             filtros.push(filtrosPorDefecto);
    //         }

    //     }


    //     localStorage.setItem('filtros', JSON.stringify(filtros));
    // }
}



