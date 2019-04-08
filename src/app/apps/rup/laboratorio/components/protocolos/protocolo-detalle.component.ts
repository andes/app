import { Constantes } from './../../controllers/constants';
import { PrestacionesService } from './../../../../../modules/rup/services/prestaciones.service';
import { TablaDatalleProtocoloComponent } from './tabla-detalle-protocolo/tabla-datalle-protocolo.component';
import { ProtocoloService } from './../../services/protocolo.service';
import { Input, Output, Component, OnInit, HostBinding, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { } from '../../../../../modules/rup/services/prestaciones.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { } from '../../controllers/constants';
import { PacienteBuscarResultado } from '../../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { LaboratorioContextoCacheService } from '../../services/protocoloCache.service';

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
    nombrePractica;
    codigoPractica;
    public showBotonesGuardar: Boolean = false;
    public mostrarMasOpciones: Boolean = false;
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi: Boolean = false;
    public contextoCache;
    public modo;

    practicasEjecucion;
    showObservaciones: Boolean = false;
    solicitudProtocolo: any;
    mostrarMasHeader: Boolean = false;
    showGestorAlarmas: Boolean = false;
    historialResultados;
    validaciones = [];

    @ViewChild(TablaDatalleProtocoloComponent)
    public tablaDetalleProtocoloComponent: TablaDatalleProtocoloComponent;

    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAListaControEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() edicionDatosCabeceraEmitter = new EventEmitter<any>();

    @Input() terminarPracticasChecked;
    @Input() seleccionPaciente: Boolean;
    @Input() protocolos: any;
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
        this.contextoCache = this.laboratorioContextoCacheService.getContextoCache();
        this.modo = this.contextoCache.modo;
        this.showBotonesGuardar = (!this.laboratorioContextoCacheService.isModoRecepcion());

        if ((this.laboratorioContextoCacheService.isModoRecepcionSinTurno() || this.laboratorioContextoCacheService.isModoRecepcion())
            && !this.solicitudProtocolo.solicitudPrestacion.numeroProtocolo) {
            this.editarDatosCabecera();
        } else if (this.laboratorioContextoCacheService.isModoCarga() || this.laboratorioContextoCacheService.isModoValidacion()) {
            this.convertirResultadosValoresAObjetos();
        }
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
    }

    getcargarProtocolo() {
        return this.modelo;
    }

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private servicioProtocolo: ProtocoloService,
        private laboratorioContextoCacheService: LaboratorioContextoCacheService
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
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    editarDatosCabecera() {
        this.contextoCache.edicionDatosCabecera = true;
        this.contextoCache.mostrarCuerpoProtocolo = false;
        this.seleccionPaciente = false;
        this.showBotonesGuardar = false;
        this.edicionDatosCabeceraEmitter.emit();
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    aceptarEdicionCabecera() {
        this.editarListaPracticas = true;
        this.showBotonesGuardar = true;
        this.seleccionPaciente = false;
        this.contextoCache.edicionDatosCabecera = false;
        this.contextoCache.mostrarCuerpoProtocolo = true;
    }

    /**
     *
     *
     * @param {*} protocolo
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
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
    }

    /**
     *
     *
     * @param {PacienteBuscarResultado} resultado
     * @memberof ProtocoloDetalleComponent
     */
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
        if (this.laboratorioContextoCacheService.isModoControl() || this.laboratorioContextoCacheService.isModoRecepcion()) {
            this.solicitudProtocolo.solicitudPrestacion.organizacionDestino = this.auth.organizacion;
            // Verificar utilidad de este bloque
            this.solicitudProtocolo.solicitudPrestacion.fechaTomaMuestra = this.fechaTomaMuestra;
            // await this.cargarPracticasAEjecucion();
        }

        this.modelo.solicitud.tipoPrestacion = Constantes.conceptoPruebaLaboratorio;
        this.guardarProtocolo(true);
    }

    /**
     * Guarda la prestación en la base de datos
     *
     * @memberof ProtocoloDetalleComponent
     */
    async guardarProtocolo(next) {
        if (!this.modelo._id) {
            this.guardarNuevoProtocolo();
        } else {
            if (this.laboratorioContextoCacheService.isModoControl()) {
                this.actualizarAuditoriaProtocolo(next);
            } else if (this.laboratorioContextoCacheService.isModoCarga() || this.laboratorioContextoCacheService.isModoValidacion()) {
                this.setearEstadosCarga();

                if (this.laboratorioContextoCacheService.isModoValidacion()) {
                    this.actualizarEstadosValidacionPracticas();
                }

                this.actualizarProtocoloRegistrosEjecucion(next);
            }
        }
    }

    /**
     *
     *
     * @private
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    private getParams() {
        let solicitud = JSON.parse(JSON.stringify(this.modelo.solicitud));

        let params: any = {
            registros: this.modelo.ejecucion.registros
        };

        if (this.modelo.estados[this.modelo.estados.length - 1].tipo === 'pendiente') {
            params.op = 'nuevoProtocoloLaboratorio';
            params.estado = { tipo: 'ejecucion' };
            params.solicitud = solicitud;
        } else if (this.laboratorioContextoCacheService.isModoControl()) {
            params.solicitud = solicitud;
            params.paciente = this.modelo.paciente,
                params.fechaEjecucion = this.modelo.ejecucion.fecha;
            params.op = 'auditoriaLaboratorio';
        } else if (this.laboratorioContextoCacheService.isModoValidacion() && this.isProtocoloValidado()) {
            params.op = 'estadoPush';
            params.estado = Constantes.estadoValidada;
        } else {
            params.op = 'registros';
            params.solicitud = solicitud;
        }
        return params;
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private guardarNuevoProtocolo() {
        this.contextoCache.turno = null;
        this.modelo.estados = [{ tipo: 'ejecucion' }];
        this.servicioProtocolo.post(this.modelo).subscribe(respuesta => {
            this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            this.activatedRoute.params.subscribe(params => {
                if (params['id']) {
                    this.router.navigate(['/laboratorio/recepcion/']);
                } else {
                    this.contextoCache.mostrarCuerpoProtocolo = true;
                    this.volverAListaControEmit.emit();
                }
            });
        });
    }

    /**
     *
     *
     * @private
     * @param {*} next
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    private async actualizarAuditoriaProtocolo(next) {

        this.servicioPrestacion.patch(this.modelo._id, this.getParams()).subscribe(async () => {
            if (next) {
                if (this.laboratorioContextoCacheService.isModoValidacion() && this.isProtocoloTerminado()) {
                    this.protocolos.splice(this.indexProtocolo, 1);
                }

                if (this.laboratorioContextoCacheService.isModoRecepcion() || this.protocolos.length === 0) {
                    this.contextoCache.mostrarCuerpoProtocolo = true;
                    this.volverAListaControEmit.emit();
                } else {
                    if (!this.protocolos[this.indexProtocolo]) {
                        this.indexProtocolo = this.protocolos.length - 1;
                    }
                    this.cargarProtocolo(this.protocolos[this.indexProtocolo]);
                }
                this.plex.toast('success', this.modelo.ejecucion.registros[0].nombre, 'Solicitud guardada', 4000);
            } else if (this.contextoCache.modoAVolver) {
                this.contextoCache.modoAVolver = null;
            } else {
                this.contextoCache.mostrarCuerpoProtocolo = true;
                this.volverAListaControEmit.emit();
            }
        });
    }

    /**
     *
     *
     * @private
     * @param {*} next
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    private async actualizarProtocoloRegistrosEjecucion(next) {
        this.convertirResultadosObjetosAValores();
        let params: any = { idProtocolo: this.modelo._id, registros: this.modelo.ejecucion.registros };

        if (this.validarPrestacion()) {
            params.estado = Constantes.estadoValidada;
        }

        this.servicioProtocolo.patch(params).subscribe(async () => {
            let alertasValidadas = [];
            if (this.laboratorioContextoCacheService.isModoValidacion()) {
                alertasValidadas = this.validaciones.filter(e => e.validado && e.esValorCritico);
            }

            if (alertasValidadas.length > 0 && await this.confirmarValoresCriticos(alertasValidadas)) {
                this.irAGestorAlarmas();

            } else if (next) {
                this.cargarProximoProtocolo();

            } else if (this.contextoCache.modoAVolver) {
                this.contextoCache.modoAVolver = null;
            } else {
                this.contextoCache.mostrarCuerpoProtocolo = true;
                this.volverAListaControEmit.emit();
            }
        });
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private cargarProximoProtocolo() {
        this.showGestorAlarmas = false;
        if (this.laboratorioContextoCacheService.isModoValidacion() && this.isProtocoloTerminado()) {
            this.protocolos.splice(this.indexProtocolo, 1);
        }
        if (this.laboratorioContextoCacheService.isModoRecepcion() || this.protocolos.length === 0) {
            this.contextoCache.mostrarCuerpoProtocolo = true;
            this.volverAListaControEmit.emit();
        } else {
            if (!this.protocolos[this.indexProtocolo]) {
                this.indexProtocolo = this.protocolos.length - 1;
            }
            this.cargarProtocolo(this.protocolos[this.indexProtocolo]);
        }
        this.plex.toast('success', this.modelo.ejecucion.registros[0].nombre, 'Solicitud guardada', 4000);
    }
    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private convertirResultadosObjetosAValores() {
        this.modelo.ejecucion.registros
            .filter(r => r.valor.practica.resultado.formato.tipo === 'Predefenidos (Selección simple)' && r.valor.resultado.valor)
            .forEach(r => r.valor.resultado.valor = r.valor.resultado.valor.nombre);
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private convertirResultadosValoresAObjetos() {
        this.modelo.ejecucion.registros
            .filter(r => r.valor.practica.resultado.formato.tipo === 'Predefenidos (Selección simple)' && r.valor.resultado.valor)
            .forEach(r => r.valor.resultado.valor = { id: r.valor.resultado.valor, nombre: r.valor.resultado.valor });
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private irAGestorAlarmas() {
        this.validaciones = this.validaciones.filter(e => e.validado && e.esValorCritico);
        this.validaciones.forEach(e => e.esValorCritico = false);
        this.showGestorAlarmas = true;
        this.contextoCache.titulo = 'Gestor de alarmas';
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private setearEstadosCarga() {
        this.contextoCache.practicasCargadas.forEach(e => e.valor.estados.push(this.generarEstado('carga')));
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private actualizarEstadosValidacionPracticas() {
        let practicasValidar = this.validaciones.filter(e => e.validado && !e.esValorCritico);
        practicasValidar.forEach(e => e.registroPractica.valor.estados.push(this.generarEstado('validada')));
        if (this.terminarPracticasChecked) {
            this.terminarPracticas();
        }
    }

    /**
     *
     *
     * @private.
     * @memberof ProtocoloDetalleComponent
     */
    private terminarPracticas() {
        let practicasTerminar = this.modelo.ejecucion.registros.filter( r => ! r.valor.estados.some( e => e.tipo === 'validada') );
        practicasTerminar.forEach( p => p.valor.estados.push(this.generarEstado('terminada')) );
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private validarPrestacion() {
        return !this.modelo.estados.some(o => o.tipo === 'validada') && this.modelo.ejecucion.registros.every(r => r.valor.estados.some(e => e.tipo === 'validada'));
    }

    /**
     *
     *
     * @private
     * @memberof ProtocoloDetalleComponent
     */
    private generarEstado(tipo) {
        return {
            tipo: tipo,
            usuario: this.auth.usuario,
            fecha: new Date(),
        };
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    guardarSolicitud() {
        if (this.validarSolicitud()) {
            if (this.laboratorioContextoCacheService.isModoRecepcion()) {
                this.iniciarProtocolo();
            } else {
                if (this.laboratorioContextoCacheService.isModoRecepcionSinTurno()) {
                    this.laboratorioContextoCacheService.cambiarModo(2);
                }
                this.guardarProtocolo(true);
            }
        } else {
            this.plex.info('warning', 'Debe cargar al menos una práctica');
        }
    }

    /**
     *
     *
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    validarRecepcionPaciente() {
        return this.modelo.solicitud.registros[0].valor.solicitudPrestacion.servicio
            && this.modelo.solicitud.registros[0].valor.solicitudPrestacion.prioridad
            && this.modelo.solicitud.ambitoOrigen;
    }

    validarSolicitud() {
        return this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas[0];
    }

    /**
     *
     *
     * @param {any} modoAVolver
     * @memberof ProtocoloDetalleComponent
     */
    guardarSolicitudYVolver() {
        this.cargarProtocolo(this.modelo);
        this.guardarProtocolo(false);
    }

    /**
     * Pide confirmación al usuario para validar resultados con valores críticos (VC)
     * @memberof TablaDatalleProtocolo
     */
    async confirmarValoresCriticos(alertasValidadas) {
        let msg = 'Se encontraron resultados críticos para los siguientes análisis: ';
        alertasValidadas.forEach(e => {
            msg += e.registroPractica.nombre + ', ';
        });

        return await this.plex.confirm(msg.substring(0, msg.length - 2) + '. ¿Desea confirmar estos valores?');
    }

    /**
     *
     *
     * @param {*} event
     * @memberof ProtocoloDetalleComponent
     */
    showHistorialResultados(event) {
        this.servicioProtocolo.getResultadosAnteriores(event.paciente.id, [event.practica.concepto.conceptId]).subscribe((resultadosAnteriores) => {
            this.historialResultados = {
                practica: event.practica,
                resultadosAnteriores: resultadosAnteriores[0]
            };
            this.contextoCache.mostrarCuerpoProtocolo = false;
            this.contextoCache.verHistorialResultados = true;
        });
    }

    /**
     *
     *
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    mostrarEncabezadoProtocolo() {
        return !this.seleccionPaciente && !this.contextoCache.cargarPorPracticas;
    }

    /**
     *
     *
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    isProtocoloTerminado() {
        return this.modelo.ejecucion.registros.every(
            r => r.estados[r.valor.estados.length - 1].tipo === 'validada' || r.estados[r.valor.estados.length - 1].tipo === 'terminada'
        );
    }
}
