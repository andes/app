import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { ISolicitud } from '../../../modules/rup/interfaces/solicitud.interface';
import { ReglaService } from '../../../services/top/reglas.service';

@Component({
    selector: 'nueva-solicitud',
    templateUrl: './nuevaSolicitud.html',
})
export class NuevaSolicitudComponent {
    showSeleccionarPaciente = true;
    permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
    paciente: any;
    autocitado: boolean;
    motivo: '';
    fecha: any;
    arrayPrestacionesDestino = [];

    modelo: any = {
        paciente: {
            id: '',
            nombre: '',
            apellido: '',
            documento: '',
            sexo: '',
            fechaNacimiento: null
        },
        solicitud: {
            organizacion: null,
            organizacionOrigen: null,
            profesional: null,
            profesionalOrigen: null,
            fecha: null,
            turno: null,
            tipoPrestacion: null,
            tipoPrestacionOrigen: null,
            prestacionOrigen: null,
            registros: []
        },
        estados: [
            { tipo: 'pendiente' }
        ]
    };
    @Input() tipoSolicitud: string;
    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
    arrayPrestacionesOrigen: { id: any; nombre: any; }[];
    arrayReglasOrigen: { id: any; nombre: any; }[];
    arrayOrganizacionesOrigen: { id: any; nombre: any; }[];
    dataOrganizacionesOrigen = [];
    dataTipoPrestacionesOrigen = [];
    constructor(
        private router: Router,
        private plex: Plex,
        private auth: Auth,
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private servicioPrestacion: PrestacionesService,
        private servicioTurnos: TurnoService,
        private servicioReglas: ReglaService

    ) { }


    seleccionarPaciente(paciente: any): void {
        this.paciente = paciente;
        this.showSeleccionarPaciente = false;
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        }
    }

    onSelect() {
        if (this.tipoSolicitud === 'salida' && this.auth.organizacion.id && this.modelo.solicitud.tipoPrestacionOrigen && this.modelo.solicitud.tipoPrestacionOrigen.conceptId) {
            this.servicioReglas.get({ organizacionOrigen: this.auth.organizacion.id, prestacionOrigen: this.modelo.solicitud.tipoPrestacionOrigen.conceptId })
                .subscribe(
                    res => {
                        this.arrayPrestacionesDestino = res.map(elem => { return { id: elem.destino.prestacion.conceptId, nombre: elem.destino.prestacion.term }; });
                        console.log(this.arrayPrestacionesDestino);
                    }
                );
        }
        if (this.tipoSolicitud === 'entrada' && this.auth.organizacion.id && this.modelo.solicitud.tipoPrestacion && this.modelo.solicitud.tipoPrestacion.conceptId) {
            this.servicioReglas.get({ organizacionDestino: this.auth.organizacion.id, prestacionDestino: this.modelo.solicitud.tipoPrestacion.conceptId })
                .subscribe(
                res => {
                    debugger;
                        this.arrayOrganizacionesOrigen = res;
                        this.dataOrganizacionesOrigen = res.map(elem => { return { id: elem.origen.organizacion.id, nombre: elem.origen.organizacion.nombre }; });
                    }
                );
        }
    }

    onSelectOrganizacionOrigen() {
        let regla: any = this.arrayOrganizacionesOrigen.find((org: any) => org.origen.organizacion.id === this.modelo.solicitud.organizacionOrigen.id);
        this.dataTipoPrestacionesOrigen = regla.origen.prestaciones.map(elem => { return { id: elem.id, nombre: elem.term }; });
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

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data: any) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
        });
    }

    guardarSolicitud($event) {

        if ($event.formValid) {
            if (this.autocitado) {
                this.modelo.solicitud.profesional = this.modelo.solicitud.profesionalOrigen;
            }
            if (this.tipoSolicitud === 'entrada') {
                this.modelo.solicitud.organizacion = this.auth.organizacion;
            } else {
                this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
            }
            this.modelo.solicitud.registros.push({
                nombre: this.modelo.solicitud.tipoPrestacion.term,
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: {
                    solicitudPrestacion: {
                        motivo: this.motivo,
                        autocitado: this.autocitado
                    }
                },
                tipo: 'solicitud'
            });
            this.modelo.paciente = {
                id: this.paciente.id,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                documento: this.paciente.documento,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento
            };
            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.newSolicitudEmitter.emit();
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                // this.showCargarSolicitud = false;
                // this.showBotonCargarSolicitud = true;

                // this.modelo = {
                //     paciente: this.paciente,
                //     profesional: {},
                //     organizacion: {},
                //     solicitud: {
                //         fecha: null,
                //         paciente: {},
                //         organizacion: {},
                //         organizacionOrigen: this.auth.organizacion,
                //         profesional: {},
                //         profesionalOrigen: {},
                //         turno: null
                //     },
                //     estados: [
                //         { tipo: 'pendiente' }
                //     ]
                // };
                // this.registros = {
                //     solicitudPrestacion: {
                //         profesionales: [],
                //         motivo: '',
                //         autocitado: false,
                //     }
                // };

            });

        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar() {
        // this.modelo = {
        //     paciente: this.paciente,
        //     profesional: {},
        //     organizacion: this.auth.organizacion,
        //     solicitud: {
        //         fecha: null,
        //         paciente: {},
        //         organizacion: {},
        //         organizacionOrigen: this.auth.organizacion,
        //         profesional: {},
        //         profesionalOrigen: {},
        //         turno: null
        //     },
        //     estados: [
        //         { tipo: 'pendiente' }
        //     ]
        // };
        // this.registros = {
        //     solicitudPrestacion: {
        //         profesionales: [],
        //         motivo: '',
        //         autocitado: false
        //     }
        // };
        this.newSolicitudEmitter.emit();
    }
}
