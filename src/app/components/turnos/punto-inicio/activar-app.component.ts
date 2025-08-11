import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { AppMobileService } from '../../../services/appMobile.service';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'activar-app',
    templateUrl: 'activar-app.html'
})
export class ActivarAppComponent {

    @Input()
    set paciente(value: IPaciente) {
        if (value) {
            this._paciente = value;
            if (this._paciente.id) {
                this.celular = this.contacto('celular');
                this.verificarEstadoCuenta();
            }
        }
    }
    get paciente(): IPaciente {
        return this._paciente;
    }
    @Input() showCampoCelular = true;
    @Output() activar: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('form', { static: false }) ngForm: NgForm;

    private _paciente: IPaciente;
    public celular = null;
    public email: string = null;
    public message = '';
    public typeMessage = null;
    public showEditar = true;
    public disableEditar = true;
    public showActivar = false;
    public showReenviar = false;
    public disableActivacion = true;
    public emailReadonly = false;
    public cuentaActivada = false;
    private cuentaExistente = false;
    public hasEmailValido$: Observable<boolean>;

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public plex: Plex,
        public auth: Auth,
        public appMobile: AppMobileService
    ) { }

    verificarEstadoCuenta() {
        this.appMobile.check(this.paciente.id).subscribe(data => {
            if (!data.account) {
                // No posee cuenta
                this.showActivar = true;
                this.disableActivacion = true;
            } else {
                if (!data.account.activacionApp) {
                    this.message = 'Cuenta pendiente de activación por el usuario';
                    this.typeMessage = 'info';
                    this.disableEditar = false;
                    this.emailReadonly = true;
                    this.showReenviar = true;
                    this.disableActivacion = false;
                    this.cuentaExistente = true;
                } else {
                    this.message = 'Cuenta activada exitosamente';
                    this.typeMessage = 'success';
                    this.emailReadonly = true;
                    this.showEditar = false;
                    this.showReenviar = false;
                    this.cuentaActivada = true;
                }
                this.showActivar = false;
                this.email = data.account.email;
                this.celular = data.account.telefono;
            }
        });
    }

    editarEmail() {
        this.disableEditar = true;
        this.disableActivacion = true;
        this.emailReadonly = false;
        this.showActivar = true;
        this.showReenviar = false;
        this.message = 'Al editar un correo ya validado, se reiniciará el proceso de activación';
        this.typeMessage = 'warning';
    }

    contacto(key) {
        const index = this.paciente.contacto.findIndex(item => item.tipo === key && item.valor !== null);
        if (index >= 0) {
            return this.paciente.contacto[index].valor.toString();
        }
        return null;
    }

    addContacto(key, value) {
        const index = this.paciente.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return this.paciente.contacto[index].valor = value;
        } else {
            const nuevo = {
                tipo: key,
                valor: value,
                ranking: 1,
                activo: true,
                ultimaActualizacion: new Date()
            };
            this.paciente.contacto.push(nuevo);
        }
    }

    checkEmail() {
        if (!this.celular) {
            this.celular = this.contacto('celular');
        }
        if (this.ngForm.invalid || !this.email) {
            return;
        }
        this.hasEmailValido$ = this.appMobile.getByEmail(this.email).pipe(
            map(resp => {
                if (resp.length && resp[0].pacientes[0].id !== this.paciente.id) {
                    this.disableActivacion = true;
                    this.message = 'Su dirección no ha podido ser validada, dirección ya utilizada';
                    this.typeMessage = 'danger';
                } else {
                    this.disableActivacion = false;
                    this.emailReadonly = true;
                    this.disableEditar = false;
                    this.message = 'Su dirección ha sido validada,';
                    if (this.paciente.id) {
                        this.message += ' puede iniciar el proceso de activación';
                    } else {
                        this.message += ' se ha iniciado el proceso de activación';
                        this.activar.emit({ email: this.email, celular: this.celular });
                    }
                    this.typeMessage = 'success';
                }
                return true;
            })
        );
    }

    activarApp() {
        if (!this.showCampoCelular) {
            this.celular = this.contacto('celular');
        }
        this.paciente.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });
        if (this.celular && this.email) {
            this.addContacto('celular', this.celular);
            this.addContacto('email', this.email);
            const cambios = {
                op: 'updateContactos',
                contacto: this.paciente.contacto
            };
            const contacto = {
                email: this.email,
                telefono: this.celular
            };
            this.servicePaciente.patch(this.paciente.id, cambios).subscribe(resultado => {
                if (resultado) {
                    this.plex.toast('info', 'Datos del paciente actualizados', 'Información', 500);
                }
            });
            if (this.cuentaExistente) {
                // Reenviar codigo de activación
                this.appMobile.reenviar(this.paciente.id, { contacto }).subscribe((resultado) => {
                    if (resultado.status === 'OK') {
                        this.plex.toast('success', 'El código de activación ha sido reenviado.', 'Información', 500);
                        this.message = 'Cuenta pendiente de activación por el usuario';
                        this.typeMessage = 'info';
                    }
                });
            } else {
                // Activar mobile
                this.appMobile.create(this.paciente.id, contacto).subscribe((datos) => {
                    if (datos.error) {
                        if (datos.error === 'email_not_found') {
                            this.plex.info('warning', 'El paciente no tiene asignado un email.');
                        }
                        if (datos.error === 'email_exists') {
                            this.plex.info('warning', 'El mail ingresado ya existe, ingrese otro email');
                        }
                    } else {
                        this.plex.toast('success', 'Se ha enviado el código de activación al paciente', 'Información', 500);
                        this.message = 'Cuenta pendiente de activación por el usuario';
                        this.typeMessage = 'info';
                    }
                });
            }
            this.showActivar = false;
            this.showReenviar = true;
            this.cuentaExistente = true;
        } else {
            this.plex.info('warning', 'Debe ingresar un número de celular y un email como datos de contacto para activar la app mobile');
        }
    }

}
