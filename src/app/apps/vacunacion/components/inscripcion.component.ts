import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { ICiudadano } from '../interfaces/ICiudadano';
import { Observable } from 'rxjs';
import * as enumerados from '../../../utils/enumerados';
import { LocalidadService } from 'src/app/services/localidad.service';
import { cache } from '@andes/shared';
import { ProfesionService } from 'src/app/services/profesion.service';
import * as moment from 'moment';
import { InscripcionService } from '../services/inscripcion.service';

@Component({
    selector: 'inscripcion',
    templateUrl: './inscripcion.component.html'
})
export class InscripcionComponent implements OnInit {

    public resultado = null;
    recaptcha: any = null;
    public localidades$: Observable<any>;
    public profesiones$: Observable<any>;

    public sexos: any[];
    public opcionesGrupos = [
        { id: 'mayores60', nombre: 'Mayores de 60' },
        { id: 'personal-salud', nombre: 'Personal de Salud' }
    ];

    public relacionLaboral = [
        { id: 'planta', label: 'Personal de planta' },
        { id: 'eventual', label: 'Personal con contrato eventual' },
        { id: 'terciarizado', label: 'Personal de empresas que brindan servicios terciarizados en ese establecimiento' },
        { id: 'locacion', label: 'Personal contratado por locación de servicios (monotributista, factura AFIP)' },
        { id: 'locacion', label: 'Personal autónomo que factura honorarios a través de colegios o instituciones similares' },
        { id: 'otros', label: 'Otros' },
    ];
    public ciudadano: ICiudadano = {
        id: null,
        fechaRegistro: null,
        documento: '',
        nombre: '',
        apellido: '',
        tieneTramite: true,
        nroTramite: '',
        grupo: null,
        sexo: null,
        fechaNacimiento: null,
        localidad: undefined,
        telefono: '',
        email: '',
        estado: '',
        alergia: false,
        condicion: false,
        enfermedad: false,
        convaleciente: false,
        aislamiento: false,
        vacuna: false,
        plasma: false,
        amamantando: false,
        embarazada: false,
        profesion: '',
        matricula: null,
        establecimiento: '',
        localidadEstablecimiento: '',
        relacion: '',
    };

    public relacion = null;
    public grupo = null;
    public sexo = null;
    public seleccionTramite = true;
    public fechaMaximaNacimiento;
    public profesion;
    constructor(
        private plex: Plex,
        private localidadService: LocalidadService,
        private profesionesService: ProfesionService,
        private inscripcionService: InscripcionService
    ) {
        this.plex.updateTitle('VACUNACIÓN');
        this.localidades$ = this.localidadService.get({codigo: 15}).pipe(
            cache()
        );
        this.profesiones$ = this.profesionesService.get().pipe(
            cache()
        );
    }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
    }

    limpiarRespuesta() {
        this.resultado = null;
    }

    resolved(captchaResponse: any[]) {
        this.recaptcha = captchaResponse;
    }

    cancelar() {
    }

    seleccionaGrupo() {
        const grupo = this.grupo;
        this.ciudadano.fechaNacimiento = null;
        if (this.grupo.id === 'mayores60') {
            this.fechaMaximaNacimiento = moment().subtract(60, 'years').toDate();
        } else {
            this.fechaMaximaNacimiento = moment().add(1, 'hour').toDate();
        }
    }

    save(valid) {
        if (!valid.formValid) {
            this.plex.info('danger', 'Reviso los datos ingresados');
            return;
        }
        this.ciudadano.grupo = this.grupo.id;
        this.ciudadano.sexo = this.sexo.id;
        this.ciudadano.profesion = this.profesion ? this.profesion.nombre : '';
        // this.inscripcionService.save();
    }

}

