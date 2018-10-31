import { IPractica } from './../../interfaces/IPractica';
import { PracticaService } from './../../services/practica.service';
import { ProtocoloService } from './../../services/protocolo.service';
import { Input, Output, Component, OnInit, HostBinding, NgModule, ViewContainerRef, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { ProfesionalService } from '../../../../../services/profesional.service';
// import { PracticaBuscarResultado } from '../../interfaces/PracticaBuscarResultado.inteface';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import * as enumerados from './../../../../../utils/enumerados';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { IPracticaMatch } from '../../interfaces/IPracticaMatch.inteface';
import { Constantes } from '../../controllers/constants';

@Component({
    selector: 'protocolo-detalle',
    templateUrl: 'protocolo-detalle.html',
    styleUrls: ['../../assets/laboratorio.scss']
})

export class ProtocoloDetalleComponent

    implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    // practicas;

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
    public mostrarMasOpciones = false;
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi = false;
    public busqueda = {
        dniPaciente: null,
        nombrePaciente: null,
        apellidoPaciente: null,
    };
    practicasEjecucion;
    showObservaciones = false;
    mostrarCuerpoProtocolo = true;
    solicitudProtocolo: any;
    practicasCarga = [];
    mostrarMasHeader = false;

    @Input() edicionDatosCabecera: Boolean;
    @Input() seleccionPaciente: Boolean;
    @Input() showProtocoloDetalle: Boolean;
    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAListaControEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Input() protocolos: any;
    @Input() modo: String;
    @Input() indexProtocolo: any;
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
    cargarProtocolo(value: any) {

        this.modelo = value;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
        this.practicasEjecucion = this.modelo.ejecucion.registros;

        if (this.modo === 'recepcion' && !this.solicitudProtocolo.solicitudPrestacion.numeroProtocolo) {
            this.editarDatosCabecera();
            this.seleccionPaciente = true;
        } else if (this.modo === 'validacion' || this.modo === 'carga') {
            this.cargarListaPracticaCarga();
            if (this.modo === 'validacion') {
                this.cargarResultadosAnteriores();
            }
        }

    }

    /**
     * Setea al resultado de cada práctica un array con la lista de resultados anteriores registrados para el paciente de la práctica
     *
     * @memberof ProtocoloDetalleComponent
     */
    cargarResultadosAnteriores() {
        this.practicasEjecucion.forEach((practica) => {
            this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, practica.concepto.conceptId).subscribe(resultadosAnteriores => {
                practica.resultado.resultadosAnteriores = resultadosAnteriores;
            });
        });
    }

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

    editarDatosCabecera() {
        this.edicionDatosCabecera = true;
        this.mostrarCuerpoProtocolo = false;
    }

    aceptarEdicionCabecera() {
        this.edicionDatosCabecera = false;
        this.seleccionPaciente = false;
        this.mostrarCuerpoProtocolo = true;
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

    // volverProtocolos() {
    //     this.volverAListaControEmit.emit(true);
    // }

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
            console.log('this.modelo.ejecucion.registros', this.modelo.ejecucion.registros);

            if (this.modo === 'carga' || this.modo === 'validacion') {
                // this.validarResultados();
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
            console.log('params', params);

            this.servicioPrestacion.patch(this.modelo.id, params).subscribe(prestacionEjecutada => {
                this.protocolos.splice(this.indexProtocolo, 1);
                if (this.modo === 'recepcion' || this.protocolos.length === 0) {
                    this.volverAListaControEmit.emit();
                } else {
                    if (!this.protocolos[this.indexProtocolo]) {
                        this.indexProtocolo = this.protocolos.length - 1;
                    }
                    this.cargarProtocolo(this.protocolos[this.indexProtocolo]);
                }
                this.plex.toast('success', this.modelo.ejecucion.registros[0].nombre, 'Solicitud guardada', 4000);
            });
        } else {
            this.modelo.estados = [{ tipo: 'ejecucion' }];
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.volverAListaControEmit.emit();
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            });
        }
    }

    async guardarSolicitud($event) {
        this.modelo.solicitud.ambitoOrigen = this.modelo.solicitud.ambitoOrigen.id;
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
            this.guardarProtocolo();
            // this.cargarResultadosAnteriores();
        }
    }

    cargarListaPracticaCarga() {
        console.log('cargarListaPracticaCarga');
        let recorrerSubpracticas = async (reg, nivelTab) => {
            let margen = [];
            for (let i = 0; i < nivelTab; i++) {
                margen.push({});
            };
            let esCompuesta = reg.registros.length > 0;

            this.practicasCarga.push({
                practica: reg,
                esCompuesta: esCompuesta,
                margen: margen,
            });

            reg.registros.forEach(r => {
                recorrerSubpracticas(r, nivelTab + 1);
            });
        };

        this.practicasEjecucion.forEach(p => {
            recorrerSubpracticas(p, 0);
        });
        this.cargarConfiguracionesResultado();

    }

    async cargarConfiguracionesResultado() {
        // return new Promise( async (resolve) => {
        let ids = [];
        this.practicasCarga.map((reg) => { ids.push(reg.practica._id); });
        await this.servicioPractica.findByIds({ ids: ids }).subscribe(
            (resultados) => {
                this.practicasCarga.map((reg) => {
                    for (let resultado of resultados) {
                        let practica: any = resultado;
                        if (resultado.id === reg.practica._id) {
                            reg.formatoResultado = practica.resultado.formato;
                            reg.formatoResultado.unidadMedida = practica.unidadMedida;
                            reg.formatoResultado.valoresReferencia = practica.presentaciones[0].valoresReferencia[0];
                            reg.valoresCriticos = practica.valoresCriticos;
                            break;
                        }
                    }
                });
                // resolve(resultado);
            });

        // });
    }

    validarResultados() {
        this.practicasCarga.forEach((objetoPractica) => {
            let resultado = objetoPractica.practica.valor.resultado;
            let alertasValReferencia = [];
            let alertasValCriticos = [];
            if (resultado && !objetoPractica.esCompuesta) {
                let valoresReferencia = objetoPractica.formatoResultado.valoresReferencia;
                if (objetoPractica.valoresCriticos.minimo > resultado.valor || objetoPractica.valoresCriticos < resultado.valor) {
                    alertasValCriticos.push({
                        nombre: objetoPractica.practica.nombre,
                        resultado: resultado
                    });
                    console.log('alerta Critica!', objetoPractica.practica.nombre, resultado);
                } else if (valoresReferencia.valorMinimo > resultado.valor || valoresReferencia.valorMaximo < resultado.valor) {
                    alertasValCriticos.push({
                        nombre: objetoPractica.practica.nombre,
                        resultado: resultado
                    });
                    console.log(objetoPractica);
                    console.log('alerta Referencia!', objetoPractica.practica.nombre, resultado);
                }
            }
        });
    }
    // validarResultados() {
    //     // this.practicasEjecucion
    // }

    // getConfiguracionResultado(idPractica) {
    //     return new Promise( async (resolve) => {
    //         console.log(idPractica)
    //         await this.servicioPractica.findByIds( {id: idPractica} ).subscribe(
    //             (practicas : any) => {console.log(practicas); resolve(practicas[0] ? practicas[0].resultado : null); });
    //     });
    // }
}
