import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import {
    PacienteService
} from './../../services/paciente.service';
import {
    RenaperService
} from './../../services/fuentesAutenticas/servicioRenaper.service';
import { Plex } from '@andes/plex';
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
    nombrePattern;

    permisosRenaper = 'fa:get:renaper';
    autorizadoRenaper = false;  // check si posee permisos

    constructor(public auth: Auth, private renaperService: RenaperService, private plex: Plex, private pacienteService: PacienteService) {
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
    }

    renaperVerification(patient) {
        // TODO llamar al servicio de renaper y actualizar: Datos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!
        // Cancela la búsqueda anterior

        window.document.getElementById('detalleContenedor').classList.add('loadMode');
        this.loading = true;
        let sexoRena = null;
        let documentoRena = null;

        patient.sexo = ((typeof patient.sexo === 'string')) ? patient.sexo : (Object(patient.sexo).id);
        sexoRena = patient.sexo === 'masculino' ? 'M' : 'F';
        documentoRena = patient.documento;

        this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(resultado => {
            // Queda pendiente actualizar la localidad y provincia de renaper en caso que no la carguen
            this.deshabilitarValidar = true;
            this.loading = false;
            let datos = resultado.datos;
            if (resultado.datos.nroError === 0) {
                if (patient.estado === 'temporal') {
                    patient.nombre = datos.nombres;
                    patient.apellido = datos.apellido;
                    patient.fechaNacimiento = moment(datos.fechaNacimiento, 'YYYY-MM-DD');
                    // si nombre y apellido contienen solo caracteres válidos ..
                    if (this.nombrePattern.test(datos.nombres) && this.nombrePattern.test(datos.apellido)) {
                        patient.estado = 'validado';
                    } else {
                        this.plex.toast('danger', 'Algunos campos contienen caracteres ilegibles.', 'Información', 5000);
                    }
                    this.paciente.direccion[0].valor = datos.calle + ' ' + datos.numero;
                    this.paciente.direccion[0].codigoPostal = datos.cpostal;
                    patient.cuil = datos.cuil;
                } else {
                    if (!this.paciente.direccion[0].valor) {
                        this.paciente.direccion[0].valor = datos.calle + ' ' + datos.numero;
                    }
                    if (!this.paciente.cuil) {
                        this.paciente.cuil = datos.cuil;
                    }
                }
                patient.foto = resultado.datos.foto;
                this.renaperNotification.emit(patient.estado === 'validado');
            } else {
                // TODO ver el tema de mostrar algún error si no trae nada
                this.plex.toast('danger', resultado.datos.descripcionError + ', REVISAR LOS DATOS INGRESADOS');
                this.deshabilitarValidar = false;
            }

            window.document.getElementById('detalleContenedor').classList.remove('loadMode');
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
