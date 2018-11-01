import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import { PacienteService } from './../../services/paciente.service';
import { RenaperService } from './../../services/fuentesAutenticas/servicioRenaper.service';
import { SisaService } from './../../services/fuentesAutenticas/servicioSisa.service';
import { Plex } from '@andes/plex';
import { PacienteCreateUpdateComponent } from './paciente-create-update.component';
import { ObraSocialService } from '../../services/obraSocial.service';
import { IObraSocial } from '../../interfaces/IObraSocial';
import { Auth } from '@andes/auth';

@Component({
    selector: 'paciente-detalle',
    templateUrl: 'paciente-detalle.html',
    styleUrls: ['paciente-detalle.scss']
})
export class PacienteDetalleComponent implements OnInit {
    /**
     * Recibe un paciente por parámetro
     *
     * @type {IPaciente}
     * @memberof PacienteDetalleComponent
     */
    @Input('mostrarRenaper') mostrarRenaper: Boolean;
    @Input('paciente')
    set paciente(value: IPaciente) {
        this._paciente = value;
    }
    get paciente() {
        return this._paciente;
    }

    @Output() renaperNotification: EventEmitter<boolean> = new EventEmitter<boolean>();

    _paciente: IPaciente;
    loading = false;
    deshabilitarValidar = false;
    inconsistenciaDatos = false;
    backUpDatos = [];
    obraSocial: IObraSocial;    // Si existen mas de dos se muestra solo la de la primera posicion del array
    nombrePattern;
    permisosRenaper = 'fa:get:renaper';
    autorizadoRenaper = false;  // check si posee permisos

    constructor(private renaperService: RenaperService,
        private parent: PacienteCreateUpdateComponent,
        private plex: Plex,
        public auth: Auth,
        private sisaService: SisaService,
        private pacienteService: PacienteService,
        private obraSocialService: ObraSocialService) {
        this.nombrePattern = pacienteService.nombreRegEx;
    }

    ngOnInit() {
        // Se chequea si el usuario posee permisos para validación por renaper
        this.autorizadoRenaper = this.auth.check(this.permisosRenaper);

        this.backUpDatos['nombre'] = this.paciente.nombre;
        this.backUpDatos['apellido'] = this.paciente.apellido;
        this.backUpDatos['estado'] = this.paciente.estado;
        this.backUpDatos['genero'] = this.paciente.genero;
        this.backUpDatos['fechaNacimiento'] = this.paciente.fechaNacimiento;
        this.backUpDatos['foto'] = this.paciente.foto;
        this.backUpDatos['cuil'] = this.paciente.cuil;
        if (this.paciente.direccion) {
            this.backUpDatos['direccion'] = this.paciente.direccion[0].valor;
            this.backUpDatos['codigoPostal'] = this.paciente.direccion[0].codigoPostal;
        }

        this.loadObraSocial();
    }

    loadObraSocial() {
        this.obraSocialService.get({ dni: this._paciente.documento }).subscribe(resultado => {
            if (resultado.length) {
                this.obraSocial = resultado[0];
            }
        });
    }

    async renaperVerification(patient) {
        this.loading = true;
        let sexoRena = null;
        let documentoRena = null;

        patient.sexo = ((typeof patient.sexo === 'string')) ? patient.sexo : (Object(patient.sexo).id);
        sexoRena = patient.sexo === 'masculino' ? 'M' : 'F';
        documentoRena = patient.documento;

        this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(async resultado => {
            // Queda pendiente actualizar la localidad y provincia de renaper en caso que no la carguen
            this.deshabilitarValidar = true;
            this.loading = false;
            let datos = resultado.datos;
            if (resultado.datos.nroError === 0) {
                if (patient.estado === 'temporal') {
                    patient.nombre = datos.nombres;
                    patient.apellido = datos.apellido;
                    patient.fechaNacimiento = moment(datos.fechaNacimiento, 'YYYY-MM-DD');

                    // Se chequea si el paciente actual ya existe como validado.
                    await this.parent.verificaPacienteRepetido().then(validadoExistente => {
                        if (validadoExistente) {
                            patient = this.parent.pacienteModel;
                            this.plex.alert('El paciente que está intentando cargar ya se encuentra validado por otra fuente auténtica.');
                        } else {
                            if (this.nombrePattern.test(datos.nombres) && this.nombrePattern.test(datos.apellido)) {
                                patient.nombre = datos.nombres;
                                patient.apellido = datos.apellido;
                                patient.estado = 'validado';
                                this.renaperNotification.emit(true);
                                this.loading = false;
                            } else {
                                this.plex.info('danger', '', 'Intento de validación fallida. Se volverá a intentar.', 5000);
                                this.getSisa(patient);
                            }
                        }
                    });
                } else {
                    if (!patient.direccion[0].valor) {
                        patient.direccion[0].valor = datos.calle + ' ' + datos.numero;
                    }
                    if (!patient.cuil) {
                        patient.cuil = datos.cuil;
                    }
                    this.loading = false;
                }
                patient.foto = resultado.datos.foto;
                if (!patient.direccion[0].valor) {
                    patient.direccion[0].valor = datos.calle + ' ' + datos.numero;
                }
                if (!patient.cuil) {
                    patient.cuil = datos.cuil;
                }
                if (!patient.direccion[0].codigoPostal) {
                    patient.direccion[0].codigoPostal = datos.cpostal;
                }
            } else {
                this.plex.toast('danger', resultado.datos.descripcionError + ', REVISAR LOS DATOS INGRESADOS');
                this.deshabilitarValidar = false;
                // this.getSisa(patient);
            }
        });
    }

    private getSisa(paciente: any) {
        let dto = {
            documento: paciente.documento,
            sexo: paciente.sexo,
        };
        this.sisaService.get(dto).subscribe(resp => {
            let pacienteSisa = resp.matcheos.datosPaciente;
            if (pacienteSisa) {
                if (this.nombrePattern.test(pacienteSisa.nombre) && this.nombrePattern.test(pacienteSisa.apellido)) {
                    paciente.nombre = pacienteSisa.nombre;
                    paciente.apellido = pacienteSisa.apellido;
                    paciente.estado = 'validado';
                    this.renaperNotification.emit(true);
                    this.deshabilitarValidar = true;

                    this.loading = false;
                } else {
                    this.renaperNotification.emit(false);
                    this.loading = false;
                    this.plex.toast('danger', 'Algunos campos contienen caracteres ilegibles.', 'Información', 5000);
                }
            } else {
                this.plex.toast('danger', 'NO SE ENCONTRO INFORMACION, REVISAR LOS DATOS INGRESADOS');
                this.loading = false;
            }
        }, err => {
            this.plex.toast('danger', 'NO SE ENCONTRO INFORMACION, REVISAR LOS DATOS INGRESADOS');
            this.loading = false;

        });
    }

    setDatosOriginales(patient) {

        patient.foto = this.backUpDatos['foto'];
        this.paciente.direccion[0].valor = this.backUpDatos['direccion'];
        this.paciente.direccion[0].codigoPostal = this.backUpDatos['codigoPostal'];

        if (this.backUpDatos['estado'] === 'temporal') {
            patient.nombre = this.backUpDatos['nombre'];
            patient.apellido = this.backUpDatos['apellido'];
            patient.fechaNacimiento = this.backUpDatos['fechaNacimiento'];
            patient.cuil = this.backUpDatos['cuil'];
            patient.estado = this.backUpDatos['estado'];
            patient.genero = this.backUpDatos['genero'];
            this.renaperNotification.emit(false);   // desbloquea los campos requeridos
        }

        this.deshabilitarValidar = false;
    }
}
