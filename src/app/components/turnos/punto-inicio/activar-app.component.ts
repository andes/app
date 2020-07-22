import {
    Component,
    Input,
    ViewChild,
    Output,
    EventEmitter
} from '@angular/core';
import {
    Plex
} from '@andes/plex';
import {
    Auth
} from '@andes/auth';
import {
    IPaciente
} from '../../../core/mpi/interfaces/IPaciente';

// Servicios
import {
    TurnoService
} from '../../../services/turnos/turno.service';
import {
    AppMobileService
} from '../../../services/appMobile.service';
import {
    PacienteService
} from '../../../core/mpi/services/paciente.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'activar-app',
    templateUrl: 'activar-app.html'
})

export class ActivarAppComponent {

    @Input('paciente')
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
    @ViewChild('form', null) ngForm: NgForm;

    private _paciente: IPaciente;
    public celular = null;
    public email: String = null;
    public message: String = '';
    public typeMessage = null;
    public showEditar = true;
    public disableEditar = true;
    public showActivar = false;
    public showReenviar = false;
    public disableActivacion = true;
    public emailReadonly = false;
    public cuentaActivada = false;

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
        let index = this.paciente.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return this.paciente.contacto[index].valor.toString();
        }
        return null;
    }

    addContacto(key, value) {
        let index = this.paciente.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return this.paciente.contacto[index].valor = value;
        } else {
            let nuevo = {
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
        if (this.ngForm.invalid || !this.celular || !this.email) {
            return;
        }
        this.appMobile.getByEmail(this.email).subscribe(resp => {
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
        });
    }

    activarApp() {
        this.celular = this.contacto('celular');
        if (this.celular && this.email) {
            this.addContacto('celular', this.celular);
            this.addContacto('email', this.email);
            let cambios = {
                op: 'updateContactos',
                contacto: this.paciente.contacto
            };
            let contacto = {
                email: this.email,
                telefono: this.celular
            };
            this.servicePaciente.patch(this.paciente.id, cambios).subscribe(resultado => {
                if (resultado) {
                    this.plex.toast('info', 'Datos del paciente actualizados');
                }
            });
            if (!this.showActivar && this.showReenviar) {
                // Reenviar codigo de activación
                this.appMobile.reenviar(this.paciente.id, { contacto }).subscribe((resultado) => {
                    if (resultado.status === 'OK') {
                        this.plex.toast('success', 'El código de activación ha sido reenviado.');
                        this.message = 'Cuenta pendiente de activación por el usuario';
                        this.typeMessage = 'info';
                    }
                    this.showActivar = false;
                    this.showReenviar = true;
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
                        this.plex.toast('success', 'Se ha enviado el código de activación al paciente');
                        this.message = 'Cuenta pendiente de activación por el usuario';
                        this.typeMessage = 'info';
                    }
                });
            }
        } else {
            this.plex.info('warning', 'Debe ingresar un número de celular y un email como datos de contacto para activar la app mobile');
        }
    }
}
