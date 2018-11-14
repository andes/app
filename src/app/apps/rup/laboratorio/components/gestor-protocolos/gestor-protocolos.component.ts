import { Constantes } from './../../controllers/constants';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { ProtocoloDetalleComponent } from '../protocolos/protocolo-detalle.component';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Component({
    selector: 'gestor-protocolos',
    templateUrl: 'gestor-protocolos.html',
    styleUrls: ['../../assets/laboratorio.scss']
})

export class GestorProtocolosComponent

    implements OnInit {

    @Output()  volverAPuntoInicioEmmiter: EventEmitter<any> = new EventEmitter<any>(); 
    public seleccionPaciente: Boolean = false;
    public showListarProtocolos: Boolean = true;
    public showProtocoloDetalle: Boolean = false;
    public showCargarSolicitud: Boolean = false;
    public edicionDatosCabecera: Boolean;
    public showBotonesGuardar: Boolean = false;
    public mostrarListaMpi: Boolean = false;
    public mostrarCuerpoProtocolo: Boolean = true;
    public ocultarPanelLateral: Boolean = false;
    public editarListaPracticas: Boolean = false;

    // public protocolos: IPrestacion[];
    // public protocolo: IPrestacion;
    public protocolos: any[];
    public protocolo: any;

    @Input('protocolo')
    set setProtocolo(value: any) {
        console.log('setProtocolo')
        if (value) {
            this.seleccionarProtocolo({ protocolo: value, index: 0 });
            this.ocultarPanelLateral = true;
        }
    }
    @Input() modo;

    @Input('paciente')
    set paciente(value) {
        console.log('setPaciente')
        if (value) {
            this.resetearProtocolo(value);
            this.seleccionarProtocolo({ protocolo: this.protocolo, index: 0 });
            this.editarListaPracticas = true;
            this.edicionDatosCabecera = true;
            this.ocultarPanelLateral = true;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = 0;
            this.seleccionPaciente = false;
            this.mostrarCuerpoProtocolo = true;
        }
    }

    public laboratorioInternoEnum: any;
    public pacientes;
    public pacienteActivo;
    public cargaLaboratorioEnum;
    public modoCargaLaboratorioEnum;
    public indexProtocolo;
    public turnosRecepcion;
    public origen = null;
    public area = null;
    public areas = [];
    public prioridad = null;
    public servicio = null;
    public estado;
    public organizacion;
    public busqueda;

    public accionIndex = 1;
    public modoAVolver = '';

    @ViewChild(ProtocoloDetalleComponent)
    private protocoloDetalleComponent: ProtocoloDetalleComponent;

    constructor(
        public plex: Plex,
        public servicioPrestaciones: PrestacionesService,
        public auth: Auth,
    ) { }

    ngOnInit() {
        if (!this.protocolo) {
            this.resetearProtocolo({});
        }

        // this.refreshSelection();
    }

    cambio($event) {
        this.accionIndex = $event;
        if ($event === 0) {
            this.modo = 'recepcion';
        } else if ($event === 1) {
            this.modo = 'control';
        } else if ($event === 2) {
            this.modo = 'carga';
        } else if ($event === 3) {
            this.modo = 'validacion';
        } else if ($event === 4) {
            this.modo = 'listado';
        }
        this.refreshSelection();
    }

    /**
     * resetearProtocolo resetea el atributo protoloco con un esquema de prestación vacio
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    resetearProtocolo(paciente) {
        this.protocolo = {
            paciente: paciente,
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
        // this.protocolo = IPrestacion.constructor();
        console.log('resetearProtocolo', this.protocolo);
    }

    /**
     * Realiza la búsqueda de prestaciones según selección de filtros
     *
     * @param {any} [value]
     * @param {any} [tipo]
     * @memberof PuntoInicioLaboratorioComponent
     */
    refreshSelection($event?) {
        console.log('refreshSelection');
        if ($event) {
            this.busqueda = $event;
        }

        this.getProtocolos(this.busqueda);
    }

    getProtocolos(params: any) {
        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            console.log(protocolos);
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                this.plex.info('danger', err);
            }
        });
    }

    // estaSeleccionado(protocolo) {
    //     return false;
    // }

    /**
     * seleccionarProtocolo oculta lista de protocolos y muestra el panel de detalle de protocolo, al ser cliqueado un protocolo de la lista
     *
     * @param {any} protocolo
     * @param {any} index
     * @memberof PuntoInicioLaboratorioComponent
     */
    seleccionarProtocolo(value) {
        console.log('seleccionarProtocolo', value.index);
        // Si se presionó el boton suspender, no se muestran otros protocolos hasta que se confirme o cancele la acción.
        if (value.protocolo) {
            this.mostrarCuerpoProtocolo = (this.modo === 'control') || (this.modo === 'carga') || (this.modo === 'validacion') || (this.modo === 'puntoInicio');
            this.protocolo = value.protocolo;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = value.index;
            this.seleccionPaciente = false;
            this.showCargarSolicitud = true;
            this.ocultarPanelLateral = (this.modo === 'recepcion') || (this.modo === 'puntoInicio');
            this.showBotonesGuardar = (this.modo !== 'recepcion');
        }
    }

    selectedIndex(i) {
        console.log('selectedIndex', i);
        return true;
    }

    /**
     * volverLista oculta panel de detalle de protolo y muestra en su lugar panel de lista de protocolos
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    volverLista() {
        if (this.modo === 'puntoInicio') {
            console.log('volverLista', this.modo)
            // location.reload();
            this.volverAPuntoInicioEmmiter.emit(true);
        } else {
            this.refreshSelection();
            this.showListarProtocolos = true;
            this.showProtocoloDetalle = false;
            this.showCargarSolicitud = false;
            this.ocultarPanelLateral = false;
            this.seleccionPaciente = false;
    
            this.showBotonesGuardar = false;    
        
        }
        
    }

    /**
     * Inicia la busqueda de pacientes
     *
     * @memberof PuntoInicioLaboratorioComponent
     */

    searchStartPaciente() {
        this.pacientes = null;
        this.pacienteActivo = null;
        this.refreshSelection();
    }

    /**
     * Limpia búsqueda de pacientes
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    searchClearPaciente() {
        this.pacientes = null;
        this.pacienteActivo = null;

        this.refreshSelection();
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
        this.refreshSelection();
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
            this.refreshSelection();
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
        console.log('mostrarFomularioPacienteSinTurno');
        this.resetearProtocolo({});
        this.edicionDatosCabecera = true;
        this.ocultarPanelLateral = true;
        this.showListarProtocolos = false;
        this.showProtocoloDetalle = true;
        this.indexProtocolo = 0;
        this.seleccionPaciente = true;
        this.mostrarCuerpoProtocolo = false;
    }

    mostrarBotonesGuardarProtocoloFooter($event) {
        this.showBotonesGuardar = $event;
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

    volverAControl() {
        this.protocoloDetalleComponent.cargarCodigosPracticas();
        this.ocultarPanelLateral = true;
        this.modoAVolver = this.modo;
        this.modo = 'control';
    }

    guardarSolicitudYVolver() {
        this.ocultarPanelLateral = false;
        this.modo = this.modoAVolver;
        this.protocoloDetalleComponent.guardarSolicitudYVolver(this.modoAVolver);
        this.modoAVolver = '';
    }

    guardarSolicitud() {
        this.protocoloDetalleComponent.guardarSolicitud()
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

    //     if (this.modo === 'Recepcion') {
    //         this.turnosLaboratorio();
    //     }
    // }
}



