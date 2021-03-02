import { Component, OnInit, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { ICiudadano } from '../interfaces/ICiudadano';
import { Observable } from 'rxjs';
import * as enumerados from '../../../utils/enumerados';
import { LocalidadService } from 'src/app/services/localidad.service';
import { cache } from '@andes/shared';
import { ProfesionService } from 'src/app/services/profesion.service';
import * as moment from 'moment';
import { InscripcionService } from '../services/inscripcion.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'inscripcion',
    templateUrl: './inscripcion.component.html'
})
export class InscripcionComponent implements OnInit {
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;
    @ViewChild('formulario', { static: true }) formulario;
    public resultado = null;
    recaptcha: any = null;
    public localidades$: Observable<any>;
    public profesiones$: Observable<any>;
    public opcionesGrupos$: Observable<any>;

    public sexos: any[];
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
        grupo: undefined,
        sexo: null,
        fechaNacimiento: null,
        localidad: undefined,
        telefono: '',
        email: '',
        cue: '',
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
        localidadEstablecimiento: undefined,
        relacion: '',
        estado: 'pendiente',
        recaptcha: ''
    };

    public relacion = null;
    public sexo = null;
    public seleccionTramite = true;
    public fechaMaximaNacimiento;
    public profesion;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;

    constructor(
        private plex: Plex,
        private localidadService: LocalidadService,
        private profesionesService: ProfesionService,
        private inscripcionService: InscripcionService,
        private grupoPoblacionalService: GrupoPoblacionalService,
    ) {
        this.plex.updateTitle('Inscripción a vacunación COVID-19 - Provincia de Neuquén');
        this.localidades$ = this.localidadService.get({ codigo: 15 }).pipe(
            cache()
        );
        this.profesiones$ = this.profesionesService.get().pipe(
            cache()
        );
        this.opcionesGrupos$ = this.grupoPoblacionalService.search({ activo: true }).pipe(
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
        this.ciudadano.recaptcha = this.recaptcha;
    }

    seleccionaGrupo() {
        const grupo = this.ciudadano.grupo;
        this.ciudadano.fechaNacimiento = null;
        if (grupo && grupo.nombre === 'mayores60') {
            this.fechaMaximaNacimiento = moment().subtract(60, 'years').toDate();
        } else {
            this.fechaMaximaNacimiento = moment().add(1, 'hour').toDate();
        }
    }

    save(valid) {
        if (!valid.formValid) {
            this.plex.info('danger', 'Revise los datos ingresados');
            return;
        }
        this.ciudadano.sexo = this.sexo.id;
        this.ciudadano.profesion = this.profesion ? this.profesion.nombre : '';
        this.ciudadano.fechaRegistro = new Date();
        this.inscripcionService.save(this.ciudadano).subscribe(inscripto => {
            if (inscripto.documento) {
                this.modal.showed = true;
            }
        }, (error) => {
            this.plex.info('danger', error, 'La inscripción no pudo realizarse ');
        });
    }

    limpiarForm() {
        this.modal.showed = false;
        this.formulario.form.reset();
        this.ciudadano = {
            id: null,
            fechaRegistro: null,
            documento: '',
            nombre: '',
            apellido: '',
            tieneTramite: true,
            nroTramite: '',
            grupo: undefined,
            sexo: null,
            fechaNacimiento: null,
            localidad: undefined,
            telefono: '',
            email: '',
            cue: '',
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
            localidadEstablecimiento: undefined,
            relacion: '',
            estado: 'pendiente',
            recaptcha: ''
        };
        this.formulario.form.markAsPristine();
    }

}

