import { Input, Output, Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { ProtocoloService } from '../../../services/laboratorio/protocolo.service';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import * as enumerados from './../../../utils/enumerados';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';
import { IPracticaMatch } from '../interfaces/IPracticaMatch.inteface';
import { PracticaBuscarResultado } from '../interfaces/PracticaBuscarResultado.inteface';
import { IPractica } from '../../../interfaces/laboratorio/IPractica';
import { Constantes } from '../consts';
import { SnomedService } from '../../../services/term/snomed.service';

@Component({
    selector: 'protocolo-detalle',
    templateUrl: 'protocolo-detalle.html',
    styleUrls: ['./../laboratorio.scss']
})

export class ProtocoloDetalleComponent

    implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
    //estado: any;

    fecha: any;
    fechaTomaMuestra = new Date();
    prestacionOrigen: any;
    organizacionOrigen: null;
    profesionalOrigen: null;
    organizacion: any;
    modelo: any;
    flagMarcarTodas: Boolean = false; res
    public practicas: IPracticaMatch[] | IPractica[];
    public mostrarMasOpciones = false;
    public protocoloSelected: any = {};
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi = false;
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
            // this.modelo.solicitud.ambitoOrigen = {
            //     nombre: this.modelo.solicitud.ambitoOrigen,
            //     id: this.modelo.solicitud.ambitoOrigen,
            // };
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
        private servicioSnomed: SnomedService
    ) { }

    ngOnInit() {
        this.setProtocoloSelected(this.modelo);
        this.loadOrganizacion();
        this.fechaTomaMuestra = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.fechaTomaMuestra;
        if (this.modo.id === 'validacion') {
            this.cargarResultadosAnteriores();
        }
    }

    cargarResultadosAnteriores() {
        this.modelo.ejecucion.registros[0].valor.forEach((practica) => {
            this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, practica.concepto.conceptId).subscribe(resultadosAnteriores => {
                practica.resultado.resultadosAnteriores = resultadosAnteriores;
            });
        });
    }

    carparPracticasAEjecucion() {
        if (this.modelo.ejecucion.registros.length === 0) {
            this.modelo.ejecucion.registros.push({
                nombre: "Practicas",
                concepto: Constantes.conceptoPruebaLaboratorio,
                valor: []
            });
        }

        let practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        let practicasEjecucion = this.modelo.ejecucion.registros[0].valor;

        let practicasCargar = practicasSolicitud.filter((practicaSolicitud) => {
            return practicasEjecucion.findIndex(practicaEjecucion => practicaEjecucion.concepto.conceptId === practicaSolicitud.conceptId) == -1;
        });

        Array.prototype.push.apply(this.modelo.ejecucion.registros[0].valor, practicasCargar);
    }

    seleccionarPractica(practica: IPractica) {
        let existe = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.findIndex(x => x.conceptId === practica.concepto.conceptId);

        if (existe === -1) {
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.push(practica.concepto);
            this.modelo.ejecucion.registros[0].valor.push(practica);
        } else {
            this.plex.alert('', 'Práctica ya ingresada');
        }
    }

    eliminarPractica(practica: IPractica) {
        let practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        practicasSolicitud.splice(practicasSolicitud.findIndex(x => x.id === practica.id), 1);
        let practicasEjecucion = this.modelo.ejecucion.registros[0].valor;
        practicasEjecucion.splice(practicasEjecucion.findIndex(x => x.id === practica.id), 1);
    }

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

    loadProfesionales($event) {
        let query = {
            nombreCompleto: $event.query
        };
        this.servicioProfesional.get(query).subscribe((resultado: any) => {
            $event.callback(resultado);
        });
    }



    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            $event.callback(organizacion.unidadesOrganizativas);
        });
    }

    loadPrioridad($event) {
        $event.callback(enumerados.getPrioridadesLab());
    }

    loadOrigen($event) {
        $event.callback(enumerados.getOrigenFiltroLab());
    }

    loadArea(event) {
        event.callback(enumerados.getLaboratorioInterno());
    }


    public busqueda = {
        dniPaciente: null,
        nombrePaciente: null,
        apellidoPaciente: null,
    };

    estaSeleccionado(protocolo) {
        return false;
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
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

    busquedaFInal(resultado: PracticaBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.practicas = resultado.practicas;
        }
    }

    hoverPaciente(paciente: any) {
        this.pacienteActivo = paciente;
    }

    siguiente() {
        if ((this.indexProtocolo + 1) < this.protocolos.length) {
            this.indexProtocolo++;
            this.modelo = this.protocolos[this.indexProtocolo];
        }

    }

    anterior() {
        if (this.indexProtocolo > 0) {
            this.indexProtocolo--;
            this.modelo = this.protocolos[this.indexProtocolo];
        }

    }

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
            this.iniciarProtocolo()
        } else {
            this.guardarProtocolo();
            this.cargarResultadosAnteriores();
        }
    }

    isProtocoloValidado() {
        return this.modelo.estados[this.modelo.estados.length - 1].tipo === "validada";
    }

    actualizarEstadoValidacion() {
        let protocoloValidado = this.modelo.ejecucion.registros[0].valor.every((practica) => {
            return practica.resultado.validado;
        });

        if (protocoloValidado) {
            this.modelo.estados.push(Constantes.estadoValidada);
        }
    }

    validarTodas(event) {
        this.modelo.ejecucion.registros[0].valor.forEach(practica => {
            practica.resultado.validado = event.value;
        });
    }

    clickValidar(event) {
        if (!event.value) {
            this.flagMarcarTodas = false;
        }
    }
    verObservaciones() {
        this.showObservaciones = true;
    }

    cerrarObservacion() {
        this.showObservaciones = false;

    }

    iniciarProtocolo() {
        this.modelo.estados = [{ tipo: "ejecucion" }];
        let organizacionSolicitud = this.auth.organizacion.id;
        this.servicioProtocolo.getNumeroProtocolo(organizacionSolicitud).subscribe(numeroProtocolo => {
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo = numeroProtocolo;
            this.guardarProtocolo();
        });
    }

    guardarProtocolo() {
        if (this.modelo.id) {
            let registros = JSON.parse(JSON.stringify(this.modelo.ejecucion.registros));
            let solicitud = JSON.parse(JSON.stringify(this.modelo.solicitud));

            let params: any = {
                registros: registros
            };

            if (this.modo.id === 'validacion' && this.isProtocoloValidado()) {
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