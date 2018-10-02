import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import { PacienteService } from './../../services/paciente.service';
import { RenaperService } from './../../services/fuentesAutenticas/servicioRenaper.service';
import { SisaService } from './../../services/fuentesAutenticas/servicioSisa.service';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs';

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
    @Output() setProvincia: EventEmitter<String> = new EventEmitter<String>();
    @Output() setLocalidad: EventEmitter<String> = new EventEmitter<String>();

    _paciente: IPaciente;
    loading = false;
    deshabilitarValidar = false;    // (des)habilita el boton que realiza la validacion.
    inconsistenciaDatos = false;
    backUpDatos = [];
    nombrePattern;
    // datosRena = null;
    // datosSisa = null;

    constructor(private renaperService: RenaperService,
        private sisaService: SisaService,
        private pacienteService: PacienteService,
        private plex: Plex) {
        this.nombrePattern = new RegExp(pacienteService.nombreRegEx.source);
    }

    ngOnInit() {
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
            if (this.paciente.direccion[0].ubicacion.localidad) {
                // Se almacena sólo el nombre ya que es lo unico que se envia en el emit.
                this.backUpDatos['localidad'] = this.paciente.direccion[0].ubicacion.localidad.nombre;
            } else {
                this.backUpDatos['localidad'] = '';
            }
            if (this.paciente.direccion[0].ubicacion.provincia) {
                // Se almacena sólo el nombre ya que es lo unico que se envia en el emit.
                this.backUpDatos['provincia'] = this.paciente.direccion[0].ubicacion.provincia.nombre;
            } else {
                this.backUpDatos['provincia'] = '';
            }
        }
    }

    renaperVerification(patient) {

        this.loading = true;
        let sexoRena = null;
        let documentoRena = null;

        patient.sexo = ((typeof patient.sexo === 'string')) ? patient.sexo : (Object(patient.sexo).id);
        sexoRena = patient.sexo === 'masculino' ? 'M' : 'F';
        documentoRena = patient.documento;

        Observable.forkJoin([
            this.renaperService.get({ documento: documentoRena, sexo: sexoRena }),
            this.sisaService.get({ documento: documentoRena, sexo: patient.sexo, nombre: ''.toString })]).subscribe(result => {

                this.deshabilitarValidar = true;
                let pacienteRena = null;
                let pacienteSisa = null;

                if (result[1].matcheos) {
                    pacienteSisa = result[1].matcheos.datosPaciente;
                }

                if (result[0].datos.nroError === 0) {
                    pacienteRena = result[0].datos;

                    if (patient.estado === 'temporal') {
                        patient.fechaNacimiento = moment(pacienteRena.fechaNacimiento, 'YYYY-MM-DD');
                        // si nombre y apellido contienen solo caracteres válidos ..
                        if (this.nombrePattern.test(pacienteRena.nombres) && this.nombrePattern.test(pacienteRena.apellido)) {
                            patient.nombre = pacienteRena.nombres;
                            patient.apellido = pacienteRena.apellido;
                            patient.estado = 'validado';
                            this.renaperNotification.emit(true);
                            this.loading = false;
                        } else {
                            if (this.nombrePattern.test(pacienteSisa.nombre) && this.nombrePattern.test(pacienteSisa.apellido)) {
                                patient.nombre = pacienteSisa.nombre;
                                patient.apellido = pacienteSisa.apellido;
                                patient.estado = 'validado';
                                this.renaperNotification.emit(true);
                                this.loading = false;
                            } else {
                                this.renaperNotification.emit(false);
                                this.loading = false;
                                this.plex.toast('danger', 'Algunos campos contienen caracteres ilegibles.', 'Información', 5000);
                            }
                        }
                        this.paciente.direccion[0].valor = pacienteSisa.direccion[0].valor;
                        this.paciente.direccion[0].codigoPostal = pacienteSisa.direccion[0].codigoPostal;
                        this.setProvincia.emit(pacienteSisa.direccion[0].ubicacion.provincia.nombre);
                        this.setLocalidad.emit(pacienteSisa.direccion[0].ubicacion.localidad.nombre);
                        patient.cuil = pacienteRena.cuil;
                    } else {
                        if (!this.paciente.direccion[0].valor) {
                            this.paciente.direccion[0].valor = pacienteSisa.direccion[0].valor;
                        }
                        if (!this.paciente.cuil) {
                            this.paciente.cuil = pacienteRena.cuil;
                        }
                        if (!this.paciente.direccion[0].ubicacion.localidad) {
                            this.setLocalidad.emit(pacienteSisa.direccion[0].ubicacion.localidad.nombre);
                        }
                        if (!this.paciente.direccion[0].ubicacion.provincia) {
                            this.setProvincia.emit(pacienteSisa.direccion[0].ubicacion.provincia.nombre);
                        }
                        this.loading = false;
                    }
                    patient.foto = pacienteRena.foto;
                } else {
                    // TODO ver el tema de mostrar algún error si no trae nada
                    this.plex.toast('danger', result[0].datos.descripcionError + ', REVISAR LOS DATOS INGRESADOS');
                    this.deshabilitarValidar = false;
                }
            });
    }

    setDatosOriginales(patient) {

        patient.foto = this.backUpDatos['foto'];
        this.paciente.direccion[0].valor = this.backUpDatos['direccion'];
        this.paciente.direccion[0].codigoPostal = this.backUpDatos['codigoPostal'];
        this.setProvincia.emit(this.backUpDatos['provincia']);
        this.setLocalidad.emit(this.backUpDatos['localidad']);

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
