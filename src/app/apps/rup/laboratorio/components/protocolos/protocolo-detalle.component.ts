import { TablaDatalleProtocoloComponent } from './tabla-detalle-protocolo/tabla-datalle-protocolo.component';
import { PracticaService } from './../../services/practica.service';
import { ProtocoloService } from './../../services/protocolo.service';
import { Input, Output, Component, OnInit, HostBinding, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { ProfesionalService } from '../../../../../services/profesional.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Constantes } from '../../controllers/constants';
import { PacienteBuscarResultado } from '../../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';

@Component({
    selector: 'protocolo-detalle',
    templateUrl: 'protocolo-detalle.html',
    styleUrls: ['../../assets/laboratorio.scss']
})

export class ProtocoloDetalleComponent

    implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
    fecha: any;
    fechaTomaMuestra = new Date();
    prestacionOrigen: any;
    organizacionOrigen: null;
    profesionalOrigen: null;
    organizacion: any;
    modelo: any;
    flagMarcarTodas: Boolean = false;
    nombrePractica;
    codigoPractica;
    public showBotonesGuardar: Boolean = false;
    public mostrarMasOpciones: Boolean = false;
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi: Boolean = false;
    practicasEjecucion;
    showObservaciones: Boolean = false;
    solicitudProtocolo: any;
    mostrarMasHeader: Boolean = false;

    @ViewChild(TablaDatalleProtocoloComponent)
    public tablaDetalleProtocoloComponent: TablaDatalleProtocoloComponent;

    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAListaControEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() mostrarCuerpoProtocoloEmit = new EventEmitter<any>();
    @Output() edicionDatosCabeceraEmitter = new EventEmitter<any>();

    @Input() edicionDatosCabecera: Boolean;
    @Input() seleccionPaciente: Boolean;
    @Input() showProtocoloDetalle: Boolean;
    @Input() mostrarCuerpoProtocolo: Boolean;
    @Input() protocolos: any;
    @Input() modo: string;
    @Input() indexProtocolo: any;
    @Input() busqueda: any;
    @Input() editarListaPracticas;
    listado: any;
    seleccion: any;
    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }
    public activo = 1;

    public cambio(value: number) {
        this.plex.toast('info', 'Tab seleccionado: ' + value);
        this.activo = value;
    }

    /**
     *
     *
     * @param {*} value
     * @memberof ProtocoloDetalleComponent
     */
    cargarProtocolo(value: any) {
        this.modelo = value;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
        this.practicasEjecucion = this.modelo.ejecucion.registros;
        this.showBotonesGuardar = (this.modo !== 'recepcion');

        if (this.practicasEjecucion.length > 0 && (this.modo === 'puntoInicio' || this.modo === 'recepcion' || this.modo === 'control')) {
            this.cargarCodigosPracticas();
        }

        if ((this.modo === 'puntoInicio' || this.modo === 'recepcion') && !this.solicitudProtocolo.solicitudPrestacion.numeroProtocolo) {
            this.editarDatosCabecera();
            // this.seleccionPaciente = this.modo === 'recepcion';
        } else {
            this.aceptarEdicionCabecera();
        }
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    cargarCodigosPracticas() {
        let ids = this.practicasEjecucion.map((reg) => { return reg._id; });
        this.servicioPractica.getCodigosPracticas(ids).subscribe(idsCodigos => {
            this.practicasEjecucion.forEach(practica => {
                let p = idsCodigos.filter((idCodigo) => {
                    return idCodigo._id === practica._id;
                })[0];

                practica.codigo = p.codigo;
                practica.area = p.area;
            });
        });
    }

    /**
     *
     *
     * @param {IPrestacion} protocolo
     * @memberof ProtocoloDetalleComponent
     */
    setProtocoloSelected(protocolo: IPrestacion) {
        this.modelo = protocolo;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
        // this.practicasEjecucion = this.modelo.ejecucion.registros;
    }

    getcargarProtocolo() {
        return this.modelo;
    }

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        private router: Router,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private servicioProtocolo: ProtocoloService,
        private servicioProfesional: ProfesionalService,
        private servicioPractica: PracticaService
    ) { }

    ngOnInit() {
        this.setProtocoloSelected(this.modelo);
        this.loadOrganizacion();
        this.fechaTomaMuestra = this.solicitudProtocolo.solicitudPrestacion.fechaTomaMuestra;
    }

    /**
     * Asigna paciente al modelo, oculta componente de búsqueda de paciente y exhibe panel de datos de paciente
     *
     * @param {*} paciente
     * @memberof ProtocoloDetalleComponent
     */
    seleccionarPaciente(paciente: any): void {
        this.modelo.paciente = paciente;
        this.seleccionPaciente = false;
        this.showProtocoloDetalle = true;
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    loadOrganizacion() {
        this.modelo.solicitud.organizacion = this.auth.organizacion;
        this.servicioOrganizacion.get(this.modelo.solicitud.organizacion.nombre).subscribe(resultado => {
            let salida = resultado.map(elem => {
                return {
                    'id': elem.id,
                    'nombre': elem.nombre
                };
            });
            this.organizacion = salida;
        });
    }

    /**
     * Busca y carga lista de profesionales
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadProfesionales($event) {
        let query = {
            nombreCompleto: $event.query
        };
        this.servicioProfesional.get(query).subscribe((resultado: any) => {
            $event.callback(resultado);
        });
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    editarDatosCabecera() {
        // this.edicionDatosCabecera = (this.modo !== 'puntoInicio');
        // this.mostrarCuerpoProtocolo = (this.modo === 'puntoInicio');
        this.edicionDatosCabecera = true;
        this.mostrarCuerpoProtocolo = false;
        this.seleccionPaciente = false;
        this.showBotonesGuardar = false;
        this.mostrarCuerpoProtocoloEmit.emit(this.mostrarCuerpoProtocolo);

        this.edicionDatosCabeceraEmitter.emit();
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    aceptarEdicionCabecera() {
        this.editarListaPracticas = true;
        this.edicionDatosCabecera = false;
        this.seleccionPaciente = false;
        this.mostrarCuerpoProtocolo = true;
        this.mostrarCuerpoProtocoloEmit.emit(this.mostrarCuerpoProtocolo);
        this.showBotonesGuardar = true;
    }

    estaSeleccionado(protocolo) {
        return false;
    }
    /**
     * Redirecciona a la pagina provista por parametro
     *
     * @param {string} pagina
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    redirect(pagina: string) {
        this.router.navigate(['./"${pagina}"']);
        return false;
    }
    /**
     * Funcionalidades del buscador de MPI
     */
    searchStart() {
        this.listado = null;
        this.seleccion = null;
        // this.router.navigate(['/laboratorio/recepcion/']);

    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.listado = resultado.pacientes;
        }
    }
    /**
     *
     *
     * @param {*} paciente
     * @memberof ProtocoloDetalleComponent
     */
    onPacienteSelected(paciente: PacienteBuscarResultado) {
        this.modelo.paciente = paciente;
        this.listado = null;
        this.seleccionPaciente = false;
    }

    /**
     * Navega al próximo protocolo de la lista de trabajo
     *
     * @memberof ProtocoloDetalleComponent
     */
    siguiente() {
        if ((this.indexProtocolo + 1) < this.protocolos.length) {
            this.indexProtocolo++;
            this.cargarDetalle();
        }
    }

    /**
     * Navega al protocolo anterior de la lista de trabajo
     *
     * @memberof ProtocoloDetalleComponent
     */
    anterior() {
        if (this.indexProtocolo > 0) {
            this.indexProtocolo--;
            this.cargarDetalle();
        }
    }

    cargarDetalle() {
        this.modelo = this.protocolos[this.indexProtocolo];
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
        this.practicasEjecucion = this.modelo.ejecucion.registros;
    }

    /**
     * Muestra el componente de selección de paciente.
     *
     * @memberof ProtocoloDetalleComponent
     */
    cambiarPaciente() {
        this.seleccionPaciente = true;
    }


    /**
     * Retorna true si el último estado registrado es de validada, false si no.
     *
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    isProtocoloValidado() {
        return this.modelo.estados[this.modelo.estados.length - 1].tipo === 'validada';
    }

    /**
     * Destilda de checkbox 'marcar todas', cuando alguna práctica es desmarcada de la lista
     *
     * @param {any} event
     * @memberof ProtocoloDetalleComponent
     */
    clickValidar(event) {
        if (!event.value) {
            this.flagMarcarTodas = false;
        }
    }

    /**
     * Muestra panel de observación
     *
     * @memberof ProtocoloDetalleComponent
     */
    verObservaciones() {
        this.showObservaciones = true;
    }

    /**
     * Oculta panel de observación
     *
     * @memberof ProtocoloDetalleComponent
     */
    cerrarObservacion() {
        this.showObservaciones = false;
    }

    /**
     * Para solicitudes no ejecutas. Agrega estado en ejecución y asigna número de protocolo
     *
     * @memberof ProtocoloDetalleComponent
     */
    iniciarProtocolo() {
        let organizacionSolicitud = this.auth.organizacion.id;
        this.servicioProtocolo.getNumeroProtocolo(organizacionSolicitud).subscribe(numeroProtocolo => {
            this.solicitudProtocolo.solicitudPrestacion.numeroProtocolo = numeroProtocolo;
            this.guardarProtocolo(true);
        });
    }

    /**
     * Guarda la prestación en la base de datos
     *
     * @memberof ProtocoloDetalleComponent
     */
    async guardarProtocolo(next) {
        if (this.modelo.id) {
            if ( (this.modo === 'carga' || this.modo === 'validacion') && !(await this.tablaDetalleProtocoloComponent.validarResultados()) )  {
                return ;
            }

            let registros = this.modelo.ejecucion.registros;
            let solicitud = JSON.parse(JSON.stringify(this.modelo.solicitud));

            let params: any = {
                registros: registros
            };

            if (this.modelo.estados[this.modelo.estados.length - 1].tipo === 'pendiente') {
                params.op = 'nuevoProtocoloLaboratorio';
                params.estado = { tipo: 'ejecucion' };
                params.solicitud = solicitud;
            } else if (this.modo === 'validacion' && this.isProtocoloValidado()) {
                params.op = 'estadoPush';
                params.estado = Constantes.estadoValidada;
            } else {
                params.op = 'registros';
                params.solicitud = solicitud;
            }

            this.servicioPrestacion.patch(this.modelo.id, params).subscribe(prestacionEjecutada => {
                // if (next && this.modo !== 'puntoInicio') {
                if (next) {

                    this.protocolos.splice(this.indexProtocolo, 1);
                    if (this.modo === 'recepcion' || this.protocolos.length === 0) {
                        this.mostrarCuerpoProtocolo = true;
                        this.volverAListaControEmit.emit();
                    } else {
                        if (!this.protocolos[this.indexProtocolo]) {
                            this.indexProtocolo = this.protocolos.length - 1;
                        }
                        this.cargarProtocolo(this.protocolos[this.indexProtocolo]);
                    }
                    this.plex.toast('success', this.modelo.ejecucion.registros[0].nombre, 'Solicitud guardada', 4000);
                }
                // } else {
                //     this.mostrarCuerpoProtocolo = true;
                //     this.volverAListaControEmit.emit()
                // }
            });
        } else {
            this.modelo.estados = [{ tipo: 'ejecucion' }];
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.mostrarCuerpoProtocolo = true;
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                this.volverAListaControEmit.emit();
            });
        }
    }

    guardarSolicitud() {
        this.modelo.solicitud.tipoPrestacion = Constantes.conceptoPruebaLaboratorio;

        if (this.modo === 'control' || this.modo === 'recepcion') {
            this.solicitudProtocolo.solicitudPrestacion.organizacionDestino = this.auth.organizacion;
            this.solicitudProtocolo.solicitudPrestacion.fechaTomaMuestra = this.fechaTomaMuestra;

            // await this.cargarPracticasAEjecucion();
        } else if (this.modo === 'validacion' && !this.isProtocoloValidado()) {
            // this.actualizarEstadoValidacion();
        }

        if (this.modo === 'recepcion') {
            this.iniciarProtocolo();
        } else {
            this.guardarProtocolo(true);
            // this.cargarResultadosAnteriores();
        }
    }

    /**
     *
     *
     * @param {any} modoAVolver
     * @memberof ProtocoloDetalleComponent
     */
    guardarSolicitudYVolver(modoAVolver) {
        this.modo = modoAVolver;
        this.cargarProtocolo(this.modelo);
        this.guardarProtocolo(false);
    }


    // getConfiguracionResultado(idPractica) {
    //     return new Promise( async (resolve) => {
    //         await this.servicioPractica.findByIds( {id: idPractica} ).subscribe(
    //             (practicas : any) => { resolve(practicas[0] ? practicas[0].resultado : null); });
    //     });
    // }
}
