import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

// Services
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import { ReglaService } from '../../../../services/top/reglas.service';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    // @Input('paciente') paciente: IPaciente;

    private _paciente: any;

    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
        // Se crea un paciente que coincida con el schema de la collection 'prestacion'
        let paciente = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            sexo: this.paciente.sexo,
            fechaNacimiento: this.paciente.fechaNacimiento,
            telefono: ''
        };


        // Se agrega el paciente al modelo
        this.modelo.paciente = paciente;
    }
    get paciente(): any {
        return this._paciente;
    }

    @Output() cerrarSolicitudVentanilla = new EventEmitter<boolean>();

    public permisos = [];
    public autorizado = false;
    public puedeAutocitar = false;
    prestacionDestino: any;
    prestacionOrigen: any;
    arrayReglasDestino = [];
    autocitado = false;
    motivo: '';
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
            registros: []
        },
        estados: [],
        prestacionOrigen: null
    };

    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;

    arrayPrestacionesOrigen: { id: any; nombre: any; }[];
    arrayReglasOrigen: { id: any; nombre: any; }[];
    arrayOrganizacionesOrigen: { id: any; nombre: any; }[];
    dataOrganizacionesOrigen = [];
    dataOrganizacionesDestino = [];
    dataTipoPrestacionesOrigen = [];
    dataReglasDestino = [];
    dataReglasOrigen: { id: any; nombre: any; }[];


    constructor(
        private servicioPrestacion: PrestacionesService,
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private servicioReglas: ReglaService,
        private auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {

        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        this.puedeAutocitar = this.auth.getPermissions('turnos:puntoInicio:autocitado:?').length > 0;

        this.showCargarSolicitud = false;

        // Está autorizado para ver esta pantalla?
        if (!this.autorizado) {
            this.redirect('inicio');
        }
    }

    onSelect() {
        if (this.auth.organizacion.id && this.modelo.solicitud.tipoPrestacion && this.modelo.solicitud.tipoPrestacion.conceptId) {
            if (this.prestacionOrigen) {
                // let regla: any = this.arrayReglasOrigen.find((rule: any) => { return rule.conceptId === this.prestacionOrigen.id; });
                let regla: any = this.arrayReglasOrigen.find((rule: any) => { return rule.prestacion.conceptId === this.prestacionOrigen.id; });

                if (regla.auditable) {
                    this.modelo.estados.push({ tipo: 'auditoria' });
                } else {
                    this.modelo.estados.push({ tipo: 'pendiente' });
                }
                this.modelo.solicitud.tipoPrestacionOrigen = regla.prestacion;
            }
        }
    }

    onSelectOrganizacionOrigen() {
        let regla: any = this.arrayOrganizacionesOrigen.find((org: any) => org.origen.organizacion.id === this.modelo.solicitud.organizacionOrigen.id);
        if (regla && regla.origen) {
            this.arrayReglasOrigen = regla.origen.prestaciones;
            this.dataTipoPrestacionesOrigen = regla.origen.prestaciones.map(elem => { return { id: elem.prestacion.conceptId, nombre: elem.prestacion.term }; });
        }
    }


    onSelectPrestacionOrigen() {
        if (this.modelo.solicitud && this.modelo.solicitud.tipoPrestacion) {
            this.servicioReglas.get({ organizacionDestino: this.auth.organizacion.id, prestacionDestino: this.modelo.solicitud.tipoPrestacion.conceptId })
                .subscribe(
                    res => {
                        this.arrayOrganizacionesOrigen = res;
                        this.dataOrganizacionesOrigen = res.map(elem => { return { id: elem.origen.organizacion.id, nombre: elem.origen.organizacion.nombre }; });
                    }
                );
        }
    }

    guardarSolicitud($event) {
        if ($event.formValid) {
            this.modelo.solicitud.organizacion = this.auth.organizacion;
            if (this.autocitado) {
                this.modelo.solicitud.profesional = this.modelo.solicitud.profesionalOrigen;
                this.modelo.solicitud.organizacionOrigen = this.modelo.solicitud.organizacion;
                this.modelo.solicitud.tipoPrestacionOrigen = this.modelo.solicitud.tipoPrestacion;
                // solicitudes autocitadas
                this.modelo.estados.push({ tipo: 'pendiente' });
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
            this.servicioPrestacion.post(this.modelo).subscribe(
                respuesta => {
                    this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                    this.cerrarSolicitudVentanilla.emit(true);
                },
                err => {
                    this.plex.toast('danger', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud no generada', 4000);
                    this.cerrarSolicitudVentanilla.emit(true);
                }
            );

        } else {
            this.plex.info('warning', 'Debe completar los datos requeridos');
        }
    }



    cancelar() {
        this.cerrarSolicitudVentanilla.emit(true);

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

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            event.callback([]);
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}
