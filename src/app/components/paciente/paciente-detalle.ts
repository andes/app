import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IPaciente } from '../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../core/mpi/services/paciente.service';
import { RenaperService } from './../../services/fuentesAutenticas/servicioRenaper.service';
import { SisaService } from './../../services/fuentesAutenticas/servicioSisa.service';
import { Plex } from '@andes/plex';
// import { PacienteCreateUpdateComponent } from './paciente-create-update.component';
import { ObraSocialService } from '../../services/obraSocial.service';
import { Auth } from '@andes/auth';
import { IFinanciador } from '../../interfaces/IFinanciador';
import { ObraSocialCacheService } from '../../services/obraSocialCache.service';

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
    @Input() esTab = false;
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
    obraSocial: IFinanciador;    // Si existen mas de dos se muestra solo la de la primera posicion del array
    nombrePattern;
    permisosRenaper = 'fa:get:renaper';
    autorizadoRenaper = false;  // check si posee permisos

    constructor(private renaperService: RenaperService,
        // private parent: PacienteCreateUpdateComponent,
        private plex: Plex,
        public auth: Auth,
        private sisaService: SisaService,
        private pacienteService: PacienteService,
        private obraSocialService: ObraSocialService,
        private obraSocialCacheService: ObraSocialCacheService) {
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
        if (this.paciente.direccion && this.paciente.direccion.length > 0) {
            this.backUpDatos['direccion'] = this.paciente.direccion[0].valor;
            this.backUpDatos['codigoPostal'] = this.paciente.direccion[0].codigoPostal;
        }

        this.loadObraSocial();
    }

    loadObraSocial() {
        if (!this._paciente || !this._paciente.documento) {
            this.obraSocialCacheService.setFinanciadorPacienteCache(null);
            return;
        }
        this.obraSocialService.getObrasSociales(this._paciente.documento).subscribe(resultado => {
            if (resultado.length > 0) {
                this.obraSocial = resultado[0];
                this.obraSocialCacheService.setFinanciadorPacienteCache(this.obraSocial);
            } else {
                this.obraSocialCacheService.setFinanciadorPacienteCache(null);
            }
        });
    }

    // TODO VALIDAR PACIENTE
    renaperVerification(patient) {
        if (!patient.documento && patient.sexo) {
            this.plex.info('warning', 'La validación requiere datos de documento y sexo');
            return;
        }

        let sexoPaciente = ((typeof patient.sexo === 'string')) ? patient.sexo : (Object(patient.sexo).id);
        if (sexoPaciente === 'otro') {
            this.plex.info('warning', 'La validación requiere sexo MASCULINO o FEMENINO.', 'Atención');
            return;
        }
        this.deshabilitarValidar = true;
        this.loading = true;
        this.pacienteService.validar(patient).subscribe(resultado => {
            this.loading = false;
            if (resultado.existente) {
                this.plex.info('info', 'El paciente que está cargando ya existe en el sistema', 'Atención');
                patient = resultado.paciente;
            } else if (resultado.validado) {
                patient.nombre = resultado.paciente.nombre;
                patient.apellido = resultado.paciente.apellido;
                patient.estado = resultado.paciente.estado;
                patient.fechaNacimiento = resultado.paciente.fechaNacimiento;
                patient.foto = resultado.paciente.foto;
                //  Se completan datos FALTANTES
                if (!patient.direccion[0].valor && resultado.paciente.direccion) {
                    patient.direccion[0].valor = resultado.paciente.direccion;
                }
                if (!patient.direccion[0].codigoPostal && resultado.paciente.cpostal) {
                    patient.direccion[0].codigoPostal = resultado.paciente.cpostal;
                }
                if (!patient.cuil && resultado.paciente.cuil) {
                    patient.cuil = resultado.paciente.cuil;
                }
                this.plex.toast('success', '¡Paciente Validado!');
            } else {
                this.plex.toast('danger', 'Validación Fallida');
                this.deshabilitarValidar = false;
            }
        });
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
