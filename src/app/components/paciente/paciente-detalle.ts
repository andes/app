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
    @Input() mostrarRenaper: Boolean;
    @Input() orientacion: 'vertical' | 'horizontal' = 'vertical';
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

    renaperVerification(patient) {
        if (!patient.documento || (patient.sexo.id === 'otro')) {
            this.plex.info('warning', 'La validación por renaper requiere sexo MASCULINO o FEMENINO.', 'Atención');
        } else {
            this.loading = true;
            let sexoRena = null;
            let documentoRena = null;

            patient.sexo = ((typeof patient.sexo === 'string')) ? patient.sexo : (Object(patient.sexo).id);
            sexoRena = patient.sexo === 'masculino' ? 'M' : 'F';
            documentoRena = patient.documento;

            this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(
                resultado => {
                    this.deshabilitarValidar = true;
                    let datos = resultado.datos;
                    if (resultado.datos.nroError === 0) {
                        if (patient.estado === 'temporal') {
                            // Se cargan los datos mínimos para poder consultar matcheo
                            patient.nombre = datos.nombres;
                            patient.apellido = datos.apellido;
                            patient.fechaNacimiento = moment(datos.fechaNacimiento, 'YYYY-MM-DD');
                            // Se chequea si el paciente actual ya existe como validado.
                            this.parent.verificaPacienteRepetido().then(validadoExistente => {
                                if (validadoExistente) {
                                    patient = this.parent.pacienteModel;
                                    this.plex.info('info', 'El paciente que está intentando cargar ya se encuentra validado por otra fuente auténtica.');
                                    this.loading = false;
                                } else {
                                    // si nombre y apellido contienen solo caracteres válidos ..
                                    if (this.nombrePattern.test(datos.nombres) && this.nombrePattern.test(datos.apellido)) {
                                        patient.nombre = datos.nombres;
                                        patient.apellido = datos.apellido;
                                        patient.estado = 'validado';
                                        this.renaperNotification.emit(true);
                                        this.loading = false;
                                    } else {
                                        this.plex.toast('info', 'Reintentando validación', 'INFORMACION:', 3500);
                                        this.getSisa(patient, sexoRena);
                                    }
                                    this.paciente.direccion[0].valor = datos.calle + ' ' + datos.numero;
                                    this.paciente.direccion[0].codigoPostal = datos.cpostal;
                                    this.paciente.cuil = datos.cuil;
                                    patient.foto = resultado.datos.foto;
                                }
                            });
                        } else {
                            //  Se completan datos FALTANTES
                            if (!this.paciente.direccion[0].valor) {
                                this.paciente.direccion[0].valor = datos.calle + ' ' + datos.numero;
                            }
                            if (!this.paciente.direccion[0].codigoPostal) {
                                this.paciente.direccion[0].codigoPostal = datos.cpostal;
                            }
                            if (!this.paciente.cuil) {
                                this.paciente.cuil = datos.cuil;
                            }
                            patient.foto = resultado.datos.foto;
                            this.loading = false;
                        }
                    } else {
                        this.deshabilitarValidar = false;
                        this.plex.info('info', 'Por favor, revisar los datos ingresados.', 'No se encontró información');
                        this.loading = false;
                    }
                });
        }
    }

    private getSisa(paciente: any, sexoRena) {
        let dto = {
            documento: paciente.documento,
            sexo: sexoRena,
        };
        this.sisaService.getPaciente(dto).subscribe(sisaPaciente => {
            if (sisaPaciente) {
                if (this.nombrePattern.test(sisaPaciente.nombre) && this.nombrePattern.test(sisaPaciente.apellido)) {
                    paciente.nombre = sisaPaciente.nombre;
                    paciente.apellido = sisaPaciente.apellido;
                    paciente.estado = 'validado';
                    this.renaperNotification.emit(true);
                    this.deshabilitarValidar = true;
                    this.loading = false;
                } else {
                    this.renaperNotification.emit(false);
                    this.loading = false;
                    this.plex.info('info', 'Nombre y/o apellido contienen caracteres ilegibles. El paciente se registrará como temporal.', 'Información', 5000);
                }
            } else {
                this.plex.info('info', 'Por favor, revisar los datos ingresados.', 'No se encontró información');
                this.loading = false;
            }
        }, err => {
            this.plex.info('warning', 'Por favor, revisar los datos ingresados.', 'No se encontró información');
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
