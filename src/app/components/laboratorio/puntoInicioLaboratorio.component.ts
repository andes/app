import { PrestacionesService } from './../../modules/rup/services/prestaciones.service';
import { Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as enumerados from './../../utils/enumerados';
import { OrganizacionService } from '../../services/organizacion.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { TurnoService } from '../../services/turnos/turno.service';
import { Constantes } from './consts';
import { ObjectID } from 'bson';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
    selector: 'gestor-protocolos',
    templateUrl: 'puntoInicioLaboratorio.html',
    styleUrls: ['./laboratorio.scss']
})

export class PuntoInicioLaboratorioComponent

    implements OnInit {

    public seleccionPaciente = false;
    public showListarProtocolos = true;
    public showProtocoloDetalle = false;
    public showCargarSolicitud = false;

    public protocolos: any = [];
    public protocolo: any = {};

    public origenEnum: any;
    public prioridadesFiltroEnum;
    public estadosFiltroEnum;
    public estadosValFiltroEnum;

    public laboratorioInternoEnum: any;
    public pacientes;
    public pacienteActivo;
    public cargaLaboratorioEnum;
    public modoCargaLaboratorioEnum;
    public mostrarListaMpi = false;
    public indexProtocolo;
    // public accion;
    public turnosRecepcion;
    public modo = {
        id: 'carga',
        nombre: 'Carga'
    };
    public formaCarga = {
        id: 'Lista de protocolos',
        nombre: 'Lista de protocolos'
    };
    public origen = null;
    public area = null;
    public prioridad = null;
    public servicio = null;
    public estado;
    public organizacion;
    public numProtocoloDesde;
    public numProtocoloHasta;
    public busqueda = {
        solicitudDesde: new Date(),
        solicitudHasta: new Date(),
        pacienteDocumento: null,
        nombrePaciente: null,
        apellidoPaciente: null,
        origen: null,
        numProtocoloDesde: null,
        numProtocoloHasta: null,
        servicio: null,
        prioridad: null,
        area: null,
        laboratorioInterno: null,
        tipoPrestacionSolicititud: '15220000',
        organizacion: null,
        estado: []
    };

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        public servicioPrestaciones: PrestacionesService,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private turnoService: TurnoService
    ) { }

    ngOnInit() {
        this.prioridadesFiltroEnum = enumerados.getPrioridadesFiltroLab();
        this.estadosFiltroEnum = enumerados.getEstadosFiltroLab();
        this.estadosValFiltroEnum = enumerados.getEstadosFiltroLab().slice(1,4);
        this.origenEnum = enumerados.getOrigenLab();
        this.laboratorioInternoEnum = enumerados.getLaboratorioInterno();
        this.cargaLaboratorioEnum = enumerados.getCargaLaboratorio();
        this.modoCargaLaboratorioEnum = enumerados.getModoCargaLaboratorio();
        this.resetearProtocolo();
        this.refreshSelection();

    }

    /**
     * resetearProtocolo resetea el atributo protoloco con un esquema de prestación vacio
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    resetearProtocolo() {
        this.protocolo = {
            paciente: {},
            solicitud: {
                esSolicitud: true,
                tipoPrestacion: null,
                organizacion: {},
                profesional: {},
                ambitoOrigen: null,
                fecha: new Date(),
                registros: [{
                    nombre: 'Prueba de Laboratorio',
                    concepto: Constantes.conceptoPruebaLaboratorio,
                    valor: {
                        solicitudPrestacion: {
                            practicas: [],
                            fechaTomaMuestra: new Date()
                        }
                    }
                }]
            },
            ejecucion: {
                fecha: new Date(),
                registros: []
            }
        };
    }

    /**
     * Realiza la búsqueda de prestaciones según selección de filtros
     *
     * @param {any} [value]
     * @param {any} [tipo]
     * @memberof PuntoInicioLaboratorioComponent
     */
    refreshSelection(value?, tipo?) {
        this.busqueda.origen = (!this.origen || (this.origen && this.origen.id === 'todos')) ? null : this.origen.id;
        this.busqueda.area = (!this.area || (this.area && this.area.id === 'todos')) ? null : this.area.id;
        this.busqueda.prioridad = (!this.prioridad || (this.prioridad && this.prioridad.id === 'todos')) ? null : this.prioridad.id;
        this.busqueda.servicio = (!this.servicio || (this.servicio && this.servicio.conceptId === null)) ? null : this.servicio.conceptId;
        this.busqueda.pacienteDocumento = (!this.pacienteActivo || (this.pacienteActivo && this.pacienteActivo.documento === null)) ? null : this.pacienteActivo.documento;
        this.busqueda.organizacion = (!this.organizacion) ? null : this.organizacion.id;
        this.busqueda.numProtocoloDesde = (!this.numProtocoloDesde) ? null : this.numProtocoloDesde;
        this.busqueda.numProtocoloHasta = (!this.numProtocoloHasta) ? null : this.numProtocoloHasta;

        if (this.modo.nombre === 'Recepcion') {
            this.busqueda.estado.push('pendiente');
            this.getProtocolos(this.busqueda);
        } else {
            if (this.modo.nombre === 'Listado' || this.modo.nombre === 'Validacion') {
                this.busqueda.estado = (!this.estado || (this.estado && this.estado.id === 'todos')) ? '' : this.estado.id;

                this.getProtocolos(this.busqueda);
            } else {
                this.busqueda.estado = ['ejecucion','validada'];
                this.getProtocolos(this.busqueda);
            }
        }
    };

    getProtocolos(params: any) {
        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                this.plex.info('danger', err);
            }
        });
    }

    // estaSeleccionado(protocolo) {
    //     return false;
    // }a

    /**
     * verProtocolo oculta lista de protocolos y muestra el panel de detalle de protocolo, al ser cliqueado un protocolo de la lista
     *
     * @param {any} protocolo
     * @param {any} index
     * @memberof PuntoInicioLaboratorioComponent
     */
    verProtocolo(protocolo, index) {
        // Si se presionó el boton suspender, no se muestran otros protocolos hasta que se confirme o cancele la acción.
        if (protocolo) {
            this.protocolo = protocolo;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = index;
            this.seleccionPaciente = false;
            this.showCargarSolicitud = true;
        }
    }

    /**
     * volverLista oculta panel de detalle de protolo y muestra en su lugar panel de lista de protocolos
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    volverLista() {
        this.refreshSelection();
        this.showListarProtocolos = true;
        this.showProtocoloDetalle = false;
        this.showCargarSolicitud = false;
    }

    /**
     * Busca unidades organizativas de la organización
     *
     * @param {any} $event
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            let servicioEnum = organizacion.unidadesOrganizativas;
            $event.callback(servicioEnum);
        });
    }

    /**
     * Recupera lista de organizaciones
     *
     * @param {any} event
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadOrganizaciones(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    /**
     * Devuelve lista de prioridades predefinidas para prestaciones de laboratorio
     * @param {any} event
     * @returns
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadPrioridad(event) {
        event.callback(enumerados.getPrioridadesLab());
        return enumerados.getPrioridadesLab();
    }

    /**
     * Inicia la busqueda de pacientes
     *
     * @memberof PuntoInicioLaboratorioComponent
     */

    searchStartPaciente() {
        this.pacientes = null;
        this.pacienteActivo = null;
        this.refreshSelection(null, '');
    }

    /**
     * Limpia búsqueda de pacientes
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    searchClearPaciente() {
        this.pacientes = null;
        this.pacienteActivo = null;

        this.refreshSelection(null, '');
    }

    /**
     * Finaliza búsqueda de pacientes
     *
     * @param {*} resultado
     * @memberof PuntoInicioLaboratorioComponent
     */
    searchEndPaciente(resultado: any) {
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
        this.refreshSelection(null, '');
    }

    /**
     * Seleccionar paciente
     *
     * @param {*} paciente
     * @memberof PuntoInicioLaboratorioComponent
     */
    seleccionarPaciente(paciente: any) {
        this.pacienteActivo = paciente;
        if (this.pacienteActivo) {
            this.refreshSelection(null, this.pacienteActivo.documento);
        }

    }

    /**
     * Asigna paciente activo
     *
     * @param {*} paciente
     * @memberof PuntoInicioLaboratorioComponent
     */
    hoverPaciente(paciente: any) {
        this.pacienteActivo = paciente;
    }

    changeCarga(tipo) {

    }

    /**
     * Cambia configuración de paneles para modo recepción paciente sin turno
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    mostrarFomularioPacienteSinTurno() {
        this.resetearProtocolo();
        this.seleccionPaciente = true;
        this.showProtocoloDetalle = false;
        this.showListarProtocolos = false;
        this.showCargarSolicitud = true;
    }

    /**
     * Guarda en el local storage del browser la selección de filtros de búsqueda para futuras búsquedas
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    recordarFiltros() {
        let filtrosPorDefecto = {
            busqueda: this.busqueda,
            profesional: this.auth.profesional._id
        };

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

        localStorage.setItem('filtros', JSON.stringify(filtrosPorDefecto));
        this.plex.toast('success', 'Se recordará su selección de filtro en sus próximas sesiones.', 'Información', 3000);
    }


    // getlocalStorage() {
    //     let ls = JSON.parse(localStorage.getItem('filtros'));

    //     console.log('ls profesional', ls.profesional);

    //     console.log('ls profesional', this.auth.profesional._id);
    //     if (ls.profesional === this.auth.profesional._id) {
    //         this.busqueda = ls.busqueda;
    //         // this.origen.id = ls.busqueda.origen;
    //         // this.area.id = ls.busqueda.area;
    //         // this.prioridad.id = ls.busqueda.prioridad;
    //         console.log('local storage', this.busqueda);
    //         // this.busqueda.solicitudDesde = new Date(ls.busqueda.solicitudDesde);
    //     }

    //     if (this.modo.nombre === 'Recepcion') {
    //         this.turnosLaboratorio();
    //     }
    // }
}



