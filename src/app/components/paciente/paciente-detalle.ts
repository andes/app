import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import {
    PacienteService
} from './../../services/paciente.service';
import {
    RenaperService
} from './../../services/fuentesAutenticas/servicioRenaper.service';
import { MAT_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/material';
import { Plex } from '@andes/plex';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


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

    constructor(private pacienteService: PacienteService, private renaperService: RenaperService, private plex: Plex) { }

    ngOnInit() {
        this.backUpDatos['nombre'] = this.paciente.nombre;
        this.backUpDatos['apellido'] = this.paciente.apellido;
        this.backUpDatos['estado'] = this.paciente.estado;
        this.backUpDatos['genero'] = this.paciente.genero;
        this.backUpDatos['fechaNacimiento'] = this.paciente.fechaNacimiento;
        this.backUpDatos['foto'] = this.paciente.foto;
        this.backUpDatos['cuil'] = this.paciente.cuil;
        this.backUpDatos['direccion'] = this.paciente.direccion[0].valor;
        this.backUpDatos['codigoPostal'] = this.paciente.direccion[0].codigoPostal;
    }

    renaperVerification(patient) {

        // TODO llamar al servicio de renaper y actualizar: Datos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!
        // Cancela la búsqueda anterior

        window.document.getElementById('detalleContenedor').classList.add('loadMode');
        this.loading = true;
        let sexoRena = null;
        let documentoRena = null;
        if (patient.estado === 'validado') {
            sexoRena = patient.sexo === 'masculino' ? 'M' : 'F';
            documentoRena = patient.documento;
        } else {
            sexoRena = (patient.sexo.id === 'masculino') ? 'M' : 'F';
            documentoRena = patient.documento;
        }

        this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(resultado => {
            // Queda pendiente actualizar la localidad y provincia de renaper en caso que no la carguen
            this.deshabilitarValidar = true;
            this.loading = false;
            let codigo = resultado.codigo;
            let datos = resultado.datos;
            if (resultado.datos.nroError === 0) {
                if (patient.estado === 'temporal') {
                    patient.nombre = datos.nombres;
                    patient.apellido = datos.apellido;
                    patient.fechaNacimiento = datos.fechaNacimiento;
                    patient.estado = 'validado';
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
                this.renaperNotification.emit(true);
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
