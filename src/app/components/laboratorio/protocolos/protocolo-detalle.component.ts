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
    public practicas: IPracticaMatch[] | IPractica[];
    public practicasEjecucion = [];

    public mostrarMasOpciones = false;
    public protocoloSelected: any = {};
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi = false;

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
            this.modelo.solicitud.ambitoOrigen = {
                nombre: this.modelo.solicitud.ambitoOrigen,
                id: this.modelo.solicitud.ambitoOrigen,
            };
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
        console.log("this, modelo", this.modelo);
        this.setProtocoloSelected(this.modelo);
        this.loadOrganizacion();
        this.fechaTomaMuestra = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.fechaTomaMuestra;
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
            return practicasEjecucion.findIndex(practicaEjecucion => practicaEjecucion.concepto.conceptId == practicaSolicitud.concepto.conceptId) == -1;
        });

        Array.prototype.push.apply(this.modelo.ejecucion.registros[0].valor, practicasCargar);
    }

    seleccionarPractica(practica: IPractica) {

        let existe = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.findIndex(x => x.concepto.conceptId === practica.concepto.conceptId);

        if (existe === -1) {
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas.push(practica);
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

    loadProfesionales(event) {


        let query = {
            nombreCompleto: event.query
        };
        this.servicioProfesional.get(query).subscribe(event.callback);
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


    getPracticas(registros) {

        //  if (this.modelo.solicitud.registros) {
        if (this.modelo.solicitud.registros[(this.modelo.solicitud.registros.length) - 1].valor.solicitudPrestacion.practicas) { // Ya hay practicas
            this.practicasEjecucion = this.modelo.solicitud.registros[(this.modelo.solicitud.registros.length) - 1].valor.solicitudPrestacion.practicas;
            return this.practicasEjecucion;
        } else { //caso recepcion
            return this.practicasEjecucion;

        }

        // }
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
            this.protocoloSelected = this.protocolos[this.indexProtocolo];
        }

    }

    anterior() {
        if (this.indexProtocolo > 0) {
            this.indexProtocolo--;
            this.protocoloSelected = this.protocolos[this.indexProtocolo];
        }

    }

    cambiarPaciente() {
        this.seleccionPaciente = true;
    }

    async guardarSolicitud($event) {

        console.log('2', this.modelo.solicitud.ambitoOrigen);
        this.modelo.solicitud.ambitoOrigen = this.modelo.solicitud.ambitoOrigen.id;
        this.modelo.solicitud.tipoPrestacion = Constantes.conceptoPruebaLaboratorio;
        // this.modelo.solicitud.organizacion = this.auth.organizacion;

        if (this.modo.id === 'control' || this.modo.id === 'recepcion') {
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.organizacionDestino = this.auth.organizacion;
            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.fechaTomaMuestra = this.fechaTomaMuestra;


            this.carparPracticasAEjecucion();
        }

        if (this.modo.id === 'recepcion') {
            this.iniciarProtocolo()
        } else {
            this.guardarProtocolo();
        }
        // console.log('this.modelo.ejecucion.registros',this.modelo.ejecucion.registros)
        // }
        // else {
        //     this.plex.alert('Debe completar los datos requeridos');
        // }
    }

    iniciarProtocolo() {
        this.modelo.estados = [{ tipo: "ejecucion" }];
        let organizacionSolicitud = this.modelo.solicitud ? this.modelo.solicitud.organizacion.id : this.auth.organizacion.id;
        this.servicioProtocolo.getNumeroProtocolo(organizacionSolicitud).subscribe(numeroProtocolo => {

            this.modelo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo = numeroProtocolo;
            this.guardarProtocolo();
        });
    }

    guardarProtocolo() {
        if (this.modelo.id) {
            this.servicioPrestacion.put(this.modelo).subscribe(respuesta => {
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