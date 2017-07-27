import { LlavesTipoPrestacionService } from './../../../../services/llaves/llavesTipoPrestacion.service';
import { EdadPipe } from './../../../../pipes/edad.pipe';
import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

// Services
import { PrestacionPacienteService } from './../../../../services/rup/prestacionPaciente.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { OrganizacionService } from './../../../../services/organizacion.service';

// Interfaces
import { IPaciente } from './../../../../interfaces/IPaciente';
import { ILlave } from './../../../../interfaces/llaves/ILlave';
import { ILlavesTipoPrestacion } from './../../../../interfaces/llaves/ILlavesTipoPrestacion';

@Component({
    selector: 'solicitud-turno-ventanilla',
    templateUrl: 'solicitud-turno-ventanilla.html'
})

export class SolicitudTurnoVentanillaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    @Input('paciente') paciente: IPaciente;
    @Output() cancelarSolicitudVentanilla = new EventEmitter<boolean>();
    @Output() mostrarDarTurnoSolicitud = new EventEmitter<any>();

    public permisos = [];
    public autorizado = false;

    public modelo: any = {
        paciente: {},
        profesional: {},
        organizacion: {},
        solicitud: {
            fecha: null,
            paciente: {},
            profesional: {},
            organizacion: {},
            turno: null
        },
        estados: []
    };
    public registros: any = {
        solicitudPrestacion: {
            profesionales: [],
            motivo: '',
            autocitado: false
        }
    };

    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;

    // VER SI HACE FALTA
    // public prioridadesPrestacion = enumToArray(PrioridadesPrestacion);


    // LLAVES
    public llaves: any[] = [];
    public llaveTP: ILlavesTipoPrestacion;
    public filtradas: any[] = [];

    constructor(
        private servicioPrestacion: PrestacionPacienteService,
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private servicioPrestacionPaciente: PrestacionPacienteService,
        private llaveTipoPrestacionService: LlavesTipoPrestacionService,
        private auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {

        this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

        // Está autorizado para ver esta pantalla?
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {
            this.modelo.estados.push({
                tipo: 'pendiente'
            });

            // Se crea un paciente que coincida con el schema de la collection 'prestacion'
            let paciente = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                apellido: this.paciente.apellido,
                nombre: this.paciente.nombre,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento,
                telefono: ''
            };

            // Se agrega el paciente al modelo
            this.modelo.paciente = paciente;
            this.showCargarSolicitud = false;

        }
    }

    loadOrganizacion(event) {
        this.servicioOrganizacion.get({}).subscribe(organizaciones => {
            event.callback(organizaciones);
        });
    }

    loadProfesionales(event) {
        this.servicioProfesional.get({}).subscribe(profesionales => {
            event.callback(profesionales);
        });
    }

    loadProfesionalesMulti(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.registros.solicitudPrestacion.profesionales) {
                    listaProfesionales = (resultado) ? this.registros.solicitudPrestacion.profesionales.concat(resultado) : this.registros.solicitudPrestacion.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.registros.solicitudPrestacion.profesionales || []);
        }
    }

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataFiltrada = data.filter(x => { return this.permisos.indexOf(x.id) >= 0; });
            let dataLlaves = data.filter(x => { return this.filtradas.indexOf(x.id);
            });
            this.verificarLlaves(dataLlaves, event);
        });
    }

    public verificarLlaves(tipoPrestaciones: any[], event) {
        tipoPrestaciones.forEach((tipoPrestacion, index) => {

            let band = true;

            // Traigo las llaves de un conceptoTurneable
            this.llaveTipoPrestacionService.get({ idTipoPrestacion: tipoPrestacion.id, activa: true }).subscribe(llaves => {

                this.llaves = llaves;
                this.llaveTP = llaves[0];

                if (!this.llaveTP) {
                    band = true;
                } else {
                    // Verifico que si la llave tiene rango de edad, el paciente esté en ese rango
                    if (this.llaveTP.llave && this.llaveTP.llave.edad && this.paciente) {
                        let edad = new EdadPipe().transform(this.paciente, []);
                        // Edad desde
                        if (this.llaveTP.llave.edad.desde) {

                            let edadDesde = String(this.llaveTP.llave.edad.desde.valor) + ' ' + this.llaveTP.llave.edad.desde.unidad;

                            if (edad < edadDesde) {
                                band = false;
                            }
                        }
                        // Edad hasta
                        if (this.llaveTP.llave.edad.hasta) {

                            let edadHasta = String(this.llaveTP.llave.edad.hasta.valor) + ' ' + this.llaveTP.llave.edad.hasta.unidad;

                            if (edad > edadHasta) {
                                band = false;
                            }
                        }
                    }
                    // Verifico que si la llave tiene seteado sexo, el sexo del paciente coincida
                    if (this.llaveTP.llave && this.llaveTP.llave.sexo && this.paciente) {
                        if (this.llaveTP.llave.sexo !== this.paciente.sexo) {
                            band = false;
                        }
                    }
                }
                if (band) {
                    this.filtradas = [... this.filtradas, tipoPrestacion];
                }
            },
                err => {
                    if (err) {
                        band = false;
                    }
                }, () => {
                    if (tipoPrestaciones.length - 1 === index) {
                        this.cargarDatosLlaves(event);
                        // Se actualiza el calendario con las agendas filtradas por permisos y llaves
                    }
                });
        });
    }

    cargarDatosLlaves(event) {
        if (this.llaves.length === 0) {

            event.callback(this.filtradas);

        } else {
            this.llaves.forEach((llave, indiceLlave) => {

                let solicitudVigente = false;
                // Si la llave requiere solicitud, verificamos en prestacionPaciente la fecha de solicitud
                if (llave.llave && llave.llave.solicitud && this.paciente) {
                    let params = {
                        estado: 'pendiente',
                        idPaciente: this.paciente.id,
                        idTipoPrestacion: llave.tipoPrestacion.id
                    };
                    this.servicioPrestacionPaciente.get(params).subscribe(prestacionPaciente => {
                        if (prestacionPaciente.length > 0) {
                            if (llave.llave.solicitud.vencimiento) {

                                if (llave.llave.solicitud.vencimiento.unidad === 'días') {
                                    this.llaves[indiceLlave].profesional = prestacionPaciente[0].solicitud.profesional;
                                    this.llaves[indiceLlave].organizacion = prestacionPaciente[0].solicitud.organizacion;
                                    this.llaves[indiceLlave].fechaSolicitud = prestacionPaciente[0].solicitud.fecha;
                                    // Controla si la solicitud está vigente
                                    let end = moment(prestacionPaciente[0].solicitud.fecha).add(llave.llave.solicitud.vencimiento.valor, 'days');
                                    solicitudVigente = moment().isBefore(end);
                                    this.llaves[indiceLlave].solicitudVigente = solicitudVigente;
                                    if (!solicitudVigente) {
                                        let indiceFiltradas = this.filtradas.indexOf(llave);
                                        this.filtradas.splice(indiceFiltradas, 1);
                                        this.filtradas = [...this.filtradas];
                                    }
                                }
                            }
                        } else {
                            // Si no existe una solicitud para el paciente y el tipo de prestacion, saco la llave de la lista y saco la prestacion del select
                            this.llaves.splice(indiceLlave, 1);
                            this.llaves = [...this.llaves];

                            let indiceFiltradas = this.filtradas.indexOf(llave);
                            this.filtradas.splice(indiceFiltradas, 1);
                            this.filtradas = [...this.filtradas];
                        }
                    },
                        err => {
                            if (err) {
                                console.log('err', err);

                            }
                        },
                        () => {
                            event.callback(this.filtradas);
                        }
                    );

                } else {
                    // Elimino la llave del arreglo
                    let ind = this.llaves.indexOf(llave);
                    this.llaves.splice(ind, 1);
                    this.llaves = [...this.llaves];

                    let indiceFiltradas = this.filtradas.indexOf(llave);
                    this.filtradas.splice(indiceFiltradas, 1);
                    this.filtradas = [... this.filtradas];
                }
            });
        }
    }

    formularioSolicitud() {
        this.showCargarSolicitud = true;
        this.showBotonCargarSolicitud = false;
    }

    guardarSolicitud($event) {

        if ($event.formValid) {

            delete this.modelo.solicitud.organizacion.$order;
            delete this.modelo.solicitud.profesional.$order;
            delete this.modelo.solicitud.tipoPrestacion.$order;

            this.registros.solicitudPrestacion.profesionales.filter(profesional => {
                return delete profesional.$order;
            });

            this.modelo.solicitud.registros = {
                concepto: this.modelo.solicitud.tipoPrestacion,
                valor: {
                    solicitudPrestacion: this.registros.solicitudPrestacion
                },
                tipo: 'solicitud'
            };

            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                this.modelo.solicitud.registros = {};
                this.registros.solicitudPrestacion = {};
                this.showCargarSolicitud = false;
                this.showBotonCargarSolicitud = true;
            });

        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    // Emite a <puntoInicio-turnos> la solicitud/prestación completa que viene de <lista-solicitud-turno-ventanilla> para usarse en darTurno
    solicitudPrestacionDarTurno(event) {
        this.mostrarDarTurnoSolicitud.emit(event);
    }

    cancelar() {
        this.modelo.solicitud = {};
        this.registros = [];
        this.showCargarSolicitud = false;
        this.showBotonCargarSolicitud = true;
        this.cancelarSolicitudVentanilla.emit(true);
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

}
