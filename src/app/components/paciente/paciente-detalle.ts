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


@Component({
    selector: 'paciente-detalle',
    templateUrl: 'paciente-detalle.html',
    styleUrls: ['paciente-detalle.scss']
})
export class PacienteDetalleComponent {
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

    private _paciente: IPaciente;
    loading = false;
    deshabilitar = false;
    inconsistenciaDatos = false;

    constructor(private pacienteService: PacienteService, private renaperService: RenaperService,  private plex: Plex) { }

    renaperVerification(patient) {

        // TODO llamar al servicio de renaper y actualizar: Datos básicos y Foto
        // En caso que el paciente ya esté validado sólo traer la foto!
        // Cancela la búsqueda anterior

        window.document.getElementById('detalleContenedor').style.opacity = '0.3';
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
            this.loading = false;
            this.deshabilitar = true;
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
                this.plex.toast('danger', resultado.datos.descripcionError + ' REVISAR LOS DATOS INGRESADOS');
                this.deshabilitar = false;
            }

            window.document.getElementById('detalleContenedor').style.opacity = '1';
        });
    }
}
