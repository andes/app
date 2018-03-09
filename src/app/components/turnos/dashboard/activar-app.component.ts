import {
    Component,
    Input,
    OnInit,
    EventEmitter,
    Output,
    OnChanges
} from '@angular/core';
import {
    Plex
} from '@andes/plex';
import {
    Auth
} from '@andes/auth';
import * as moment from 'moment';
import * as calculos from './../../../utils/calculosDashboard';
import {
    IPaciente
} from './../../../interfaces/IPaciente';

// Servicios
import {
    TurnoService
} from '../../../services/turnos/turno.service';
import {
    AppMobileService
} from '../../../services/appMobile.service';
import {
    PacienteService
} from '../../../services/paciente.service';

@Component({
    selector: 'activar-app',
    templateUrl: 'activar-app.html'
})

export class ActivarAppComponent implements OnInit, OnChanges {

    @Input('paciente') paciente: IPaciente;

    public checkPass = false;
    public celular: String = '';
    public email: String = '';
    public message: String = '';
    public hideButton = false;
    public hideButtonResend = true;

    // Inicialización
    constructor(
        public serviceTurno: TurnoService,
        public servicePaciente: PacienteService,
        public plex: Plex,
        public auth: Auth,
        public appMobile: AppMobileService
    ) {}

    ngOnInit() {
        // Se cargan los datos calculados
        this.celular = this.contacto('celular');
        this.email = this.contacto('email');

    }

    ngOnChanges(changes: any) {
        this.servicePaciente.getById(this.paciente.id).subscribe(p => {
            this.paciente = p;
            this.celular = this.contacto('celular');
            this.email = this.contacto('email');
            this.hideButton = false;
            this.message = '';
            this.checkPass = false;
            this.appMobile.check(this.paciente.id).subscribe(data => {
                if (!data.account) {
                    // No posee cuenta
                    this.checkPass = true;

                } else {
                    if (!data.account.activacionApp) {
                        this.message = 'Cuenta pendiente de activación por el usuario';
                        this.hideButtonResend = false;
                        this.checkPass = true;
                    } else {
                        this.message = 'Cuenta ya activada';
                        this.checkPass = false;
                        this.hideButtonResend = true;
                    }
                    this.hideButton = true;
                    this.email = data.account.email;
                    this.celular = data.account.telefono;
                }
            });

        });

    }

    contacto(key) {
        let index = this.paciente.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return this.paciente.contacto[index].valor;
        }
        return '';
    }

    addContacto(key, value) {
        let index = this.paciente.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return this.paciente.contacto[index].valor = value;
        } else {
            let nuevo = {
                'tipo': key,
                'valor': value,
                'ranking': 1,
                'activo': true,
                'ultimaActualizacion': new Date()
            };
            this.paciente.contacto.push(nuevo);
            // this.paciente.contacto.sort((a,b) => a.tipo == b.tipo ? 0 :  );
        }
    }



    activarApp() {
        if (this.celular && this.email) {
            this.addContacto('celular', this.celular);
            this.addContacto('email', this.email);
            let cambios = {
                'op': 'updateContactos',
                'contacto': this.paciente.contacto
            };


            if (this.hideButton && !this.hideButtonResend) {
                let contacto = {
                    email: this.email,
                    telefono: this.celular
                };
                this.appMobile.reenviar(this.paciente.id, { contacto }).subscribe((resultado) => {
                    if (resultado.status === 'OK') {
                        this.plex.alert('El código de activación ha sido reenviado.');
                    }
                });
            } else {
                let contacto = {
                    email: this.email,
                    telefono: this.celular
                };
                this.appMobile.create(this.paciente.id, contacto).subscribe((datos) => {
                    this.servicePaciente.patch(this.paciente.id, cambios).subscribe(resultado => {
                        if (resultado) {
                            this.plex.toast('info', 'Datos del paciente actualizados');
                        }
                    });
                    if (datos.error) {
                        if (datos.error === 'email_not_found') {
                            this.plex.alert('El paciente no tiene asignado un email.');
                        }
                        if (datos.error === 'email_exists') {
                            this.plex.alert('El mail ingresado ya existe, ingrese otro email');
                        }
                    } else {
                        this.plex.alert('Se ha enviado el código de activación al paciente');
                        this.checkPass = true;
                        this.hideButton = true;
                        this.hideButtonResend = false;
                        this.message = 'Cuenta pendiente de activación por el usuario';

                    }
                });
            }
        } else {
            this.plex.alert('Debe ingresar un número de celular y un email como datos de contacto para activar la app mobile');
        }

    }

}
