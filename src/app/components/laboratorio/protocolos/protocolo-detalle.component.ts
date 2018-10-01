import { Input, Output, Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { ProtocoloService } from '../../../services/laboratorio/protocolo.service';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import * as enumerados from './../../../utils/enumerados';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';
import { IPracticaMatch } from '../interfaces/IPracticaMatch.inteface';
import { PracticaBuscarResultado } from '../interfaces/PracticaBuscarResultado.inteface';
import { IPractica } from '../../../interfaces/laboratorio/IPractica';
import { Constantes } from '../consts';

@Component({
    selector: 'protocolo-detalle',
    templateUrl: 'protocolo-detalle.html',
    styleUrls: ['./../laboratorio.scss']
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
    public practicas: IPracticaMatch[] | IPractica[];
    public mostrarMasOpciones = false;
    public protocoloSelected: any = {};
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi = false;
    public busqueda = {
        dniPaciente: null,
        nombrePaciente: null,
        apellidoPaciente: null,
    };

    showObservaciones = false;

    @Input() seleccionPaciente: any;
    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAListaControEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Input() protocolos: any;
    @Input() modo: any;
    @Input() showProtocoloDetalle: any;
    @Input() indexProtocolo: any;
    @Input('cargarProtocolo')
    set cargarProtocolo(value: any) {
        if (value) {
            this.modelo = value;
            ;
            if (this.modo.id === 'recepcion') {
                this.carparPracticasAEjecucion();
            }
        }
    }

    setProtocoloSelected(protocolo: IPrestacion) {
        this.modelo = protocolo;
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
    ) { }

    ngOnInit() {
        this.setProtocoloSelected(this.modelo);
        this.loadOrganizacion();
        this.fechaTomaMuestra = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.fechaTomaMuestra;
        if (this.modo.id === 'validacion') {
            this.cargarResultadosAnteriores();
        }
    }

    /**
     * Setea al resultado de cada práctica un array con la lista de resultados anteriores registrados para el paciente de la práctica
     *
     * @memberof ProtocoloDetalleComponent
     */
    cargarResultadosAnteriores() {
        this.modelo.ejecucion.registros[0].valor.forEach((practica) => {
            this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, practica.concepto.conceptId).subscribe(resultadosAnteriores => {
                practica.resultado.resultadosAnteriores = resultadosAnteriores;
            });
        });
    }

    /**
     * Actualiza las prácticas en ejecución con las prácticas registradas en la solicitud
     *
     * @memberof ProtocoloDetalleComponent
     */
    carparPracticasAEjecucion() {
        if (this.modelo.ejecucion.registros.length === 0) {
            this.modelo.ejecucion.registros.push({
                nombre: 'Practicas',
                concepto: Constantes.conceptoPruebaLaboratorio,
                valor: []
            });
        }

        let practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        let practicasEjecucion = this.modelo.ejecucion.registros[0].valor;

        let practicasCargar = practicasSolicitud.filter((practicaSolicitud) => {
            return practicasEjecucion.findIndex(practicaEjecucion => practicaEjecucion.concepto.conceptId === practicaSolicitud.concepto.conceptId) === -1;
        });

        Array.prototype.push.apply(this.modelo.ejecucion.registros[0].valor, practicasCargar);
    }

    /**
     * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
     *
     * @param {IPractica} practica
     * @memberof ProtocoloDetalleComponent
     */
    seleccionarPractica(practica: IPractica) {
        let existe = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.findIndex(x => x.concepto.conceptId === practica.concepto.conceptId);

        if (existe === -1) {
            // this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.push(practica.concepto);
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.push(practica);
            this.modelo.ejecucion.registros[0].valor.push(practica);
        } else {
            this.plex.alert('', 'Práctica ya ingresada');
        }
    }

   /**
     * Elimina una práctica seleccionada tanto de la solicitud como de la ejecución
     *
     * @param {IPractica} practica
     * @memberof ProtocoloDetalleComponent
     */
    eliminarPractica(practica: IPractica) {
        let practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        practicasSolicitud.splice(practicasSolicitud.findIndex(x => x.id === practica.id), 1);
        let practicasEjecucion = this.modelo.ejecucion.registros[0].valor;
        practicasEjecucion.splice(practicasEjecucion.findIndex(x => x.id === practica.id), 1);
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

    loadOrganizacion() {
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
     * Busca unidades organizativas de la organización
     *
     * @param {any} $event
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            $event.callback(organizacion.unidadesOrganizativas);
        });
    }
    /**
     * Busca prioridades
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadPrioridad($event) {
        $event.callback(enumerados.getPrioridadesLab());
    }
    /**
     * Busca ambito de origen
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadOrigen($event) {
        $event.callback(enumerados.getOrigenFiltroLab());
    }
    /**
     * Busca areas (laboratorios internos)
     *
     * @param {any} event
     * @memberof ProtocoloDetalleComponent
     */
    loadArea(event) {
        event.callback(enumerados.getLaboratorioInterno());
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

    volverProtocolos() {
        this.volverAListaControEmit.emit(true);
    }

    searchStart() {
        this.pacientes = null;
    }
    busquedaInicial() {
        this.practicas = null;
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

    searchClear() {
        this.practicas = null;
    }

    busquedaFinal(resultado: PracticaBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.practicas = resultado.practicas;
        }
    }

    hoverPaciente(paciente: any) {
        this.pacienteActivo = paciente;
    }

    /**
     * Navega al próximo protocolo de la lista de trabajo
     *
     * @memberof ProtocoloDetalleComponent
     */
    siguiente() {
        if ((this.indexProtocolo + 1) < this.protocolos.length) {
            this.indexProtocolo++;
            this.modelo = this.protocolos[this.indexProtocolo];
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
            this.modelo = this.protocolos[this.indexProtocolo];
        }

    }

    /**
     * Muestra el componente de selección de paciente.
     *
     * @memberof ProtocoloDetalleComponent
     */
    cambiarPaciente() {
        this.seleccionPaciente = true;
    }

    async guardarSolicitud($event) {
        this.modelo.solicitud.ambitoOrigen = this.modelo.solicitud.ambitoOrigen.id;
        this.modelo.solicitud.tipoPrestacion = Constantes.conceptoPruebaLaboratorio;


        if (this.modo.id === 'control' || this.modo.id === 'recepcion') {
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.organizacionDestino = this.auth.organizacion;
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.fechaTomaMuestra = this.fechaTomaMuestra;

            this.carparPracticasAEjecucion();
        } else if (this.modo.id === 'validacion' && !this.isProtocoloValidado()) {
            this.actualizarEstadoValidacion();
        }

        if (this.modo.id === 'recepcion') {
            this.iniciarProtocolo();
        } else {
            this.guardarProtocolo();
            this.cargarResultadosAnteriores();
        }
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
     * Agrega estado validado al protocolo en caso que todos los resultados del mismo se encuentren marcados como validados.
     *
     * @memberof ProtocoloDetalleComponent
     */
    actualizarEstadoValidacion() {
        let protocoloValidado = this.modelo.ejecucion.registros[0].valor.every((practica) => {
            return practica.resultado.validado;
        });

        if (protocoloValidado) {
            this.modelo.estados.push(Constantes.estadoValidada);
        }
    }

    /**
     * Marca los resultados de todas las prácticas como validados
     *
     * @param {any} event
     * @memberof ProtocoloDetalleComponent
     */
    validarTodas(event) {
        this.modelo.ejecucion.registros[0].valor.forEach(practica => {
            practica.resultado.validado = event.value;
        });
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
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo = numeroProtocolo;
            this.guardarProtocolo();
        });
    }

    /**
     * Guarda la prestación en la base de datos
     *
     * @memberof ProtocoloDetalleComponent
     */
    guardarProtocolo() {
        if (this.modelo.id) {
            let registros = JSON.parse(JSON.stringify(this.modelo.ejecucion.registros));
            let solicitud = JSON.parse(JSON.stringify(this.modelo.solicitud));

            let params: any = {
                registros: registros
            };

            if (this.modelo.estados[this.modelo.estados.length - 1].tipo === 'pendiente') {
                params.op = 'nuevoProtocoloLaboratorio';
                params.estado = { tipo: 'ejecucion' };
                params.solicitud = solicitud;
            } else if (this.modo.id === 'validacion' && this.isProtocoloValidado()) {
                params.op = 'estadoPush';
                params.estado = Constantes.estadoValidada;
            } else {
                params.op = 'registros';
                params.solicitud = solicitud;
            }

            this.servicioPrestacion.patch(this.modelo.id, params).subscribe(prestacionEjecutada => {
                this.volverAListaControEmit.emit();
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            });
        } else {
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.volverAListaControEmit.emit();
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            });
        }
    }
}
