import { Input, Output, Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
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

    showSeleccionarPaciente = true;
    showSeleccionarPractica = true;
    permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
    paciente: any;
    motivo: '';
    prioridad: any;
    servicio: any;
    fecha: any;
    prestacionOrigen: any;
    organizacionOrigen: null;
    profesionalOrigen: null;
    organizacion: any;
    modelo: any;
   
    public practicas: IPracticaMatch[] | IPractica[];
    public practicasActivas = [];

    public mostrarMasOpciones = false;
    public protocoloSelected: any = {};
    public fechaDesde: any;
    public fechaHasta: any;
    public parametros = [];
    public pacientes;
    public pacienteActivo;
    public mostrarListaMpi = false;
    // public profesional = {
    //     nombre: 'Marco',
    //     apellido: 'Santarelli'
    // };

    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() volverAListaControEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Input() protocolos: any;
    @Input() modo: any;
    @Input() indexProtocolo: any;
    @Input('cargarProtocolo')
    set cargarProtocolo(value: any) {
        console.log('cargarProtocolo', value)
        if (value) {
            this.modelo = value;
        }
    }

    setProtocoloSelected(protocolo : IPrestacion) {
        this.modelo = protocolo;
    }

    get cargarProtocolo() {
        return this.modelo;
    }

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        private router: Router,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private servicioProfesional: ProfesionalService,
    ) { }

    ngOnInit() {
        this.setProtocoloSelected(this.modelo);
        this.loadOrganizacion();
    }

    seleccionarPractica(practica: IPractica) {
        let existe = this.practicasActivas.findIndex(x => x.id === practica.id);

        if (existe === -1) {

            this.practicasActivas.push(practica);
            this.showSeleccionarPractica = false;
        }
        else {
            this.plex.alert('', 'Práctica ya ingresada');
        }
        console.log(this.practicasActivas);


    }

    eliminarPractica(practica: IPractica) {
        this.practicasActivas.splice(this.practicasActivas.findIndex(x => x.id === practica.id), 1);


    }

    seleccionarPaciente(paciente: any): void {
        this.modelo.paciente = paciente;
        this.showSeleccionarPaciente = false;
    }

    loadOrganizacion(event?) {
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
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }


    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            $event.callback(organizacion.unidadesOrganizativas);
        });

    }

    loadPrioridad(event) {
        event.callback(enumerados.getPrioridadesLab());
        return enumerados.getPrioridadesLab();
    }
    public busqueda = {
        dniPaciente: null,
        nombrePaciente: null,
        apellidoPaciente: null,
    };

    estaSeleccionado(protocolo) {
        return false;
    }

    cargarResultados() {
        console.log('cargarResultado');
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    volverProtocolos() {
        this.volverAListaControEmit.emit(true);
    }

    getPracticas(registros) {
        let registro: any = this.getRegistrosByConceptId(registros, '122869004');

        return registro ? registro.registros : [];
    }

    getCodigoPractica(registros) {
        let registro: any = this.getRegistrosByConceptId(registros, '260299005');
        return (registro) ? registro.valor : '';
    }

    getRegistrosByConceptId(registros, conceptId) {
        return registros.find((reg) => {
            return reg.concepto.conceptId === conceptId;
        });

    }

    getNumeroProtocolo(registros) {
        let registro: any = registros.find((reg) => {
            return reg.nombre === 'numeroProtocolo';
        });
        return registro ? registro.valor : null;
    }

    getUnidad(registros) {
        console.log('getUnidad', registros)
        let registro: any = registros.find((reg) => {
            return reg.concepto.conceptId === '282372007';
        });
        return registro ? registro.valor.term : null;
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
        console.log("busquedaFInal", this.practicas);
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
        this.showSeleccionarPaciente = true;
    }

    guardar() {
        this.servicioPrestacion.post(this.protocoloSelected).subscribe((result) => {
            // this.protocolos = protocolos;
            console.log(result);
        }, err => {
            if (err) {
                console.log(err);
            }
        });
    }   
    guardarSolicitud($event) {
        // this.modelo.solicitud.organizacion = this.auth.organizacion;
        // this.modelo.solicitud.profesional = {
        //     id: this.auth.profesional.id,
        //     nombre: this.auth.usuario.nombre,
        //     apellido: this.auth.usuario.apellido,
        //     documento: this.auth.usuario.documento
        // };
console.log('guardarSolicitud', this.modelo.solicitud.profesional)
        this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
        this.modelo.solicitud.profesionalOrigen = this.modelo.solicitud.profesional

        this.modelo.solicitud.registros.push({
            nombre: Constantes.nombrePrestacionLaboratorio,
            concepto: Constantes.codigoSnomedPrestacionLaboratorio,

            valor: {
                solicitudPrestacion: {
                    autocitado: false,
                    prioridad: this.prioridad,
                    servicio: this.servicio,
                    motivo: this.motivo,
                    organizacionOrigen: this.organizacionOrigen,
                    profesionalOrigen: this.profesionalOrigen,
                    practicas: this.practicasActivas,
                }
            }
        });
        // this.modelo.paciente = {
        //     id: this.modelo.paciente.id,
        //     nombre: this.protocoloSelected.paciente.nombre,
        //     apellido: this.protocoloSelected.paciente.apellido,
        //     documento: this.protocoloSelected.paciente.documento,
        //     sexo: this.protocoloSelected.paciente.sexo,
        //     fechaNacimiento: this.protocoloSelected.paciente.fechaNacimiento
        // };

        this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
            this.newSolicitudEmitter.emit();
            this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
        });


    }
}



