import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { cache } from '@andes/shared';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ProfesionService } from 'src/app/services/profesion.service';
import * as enumerados from '../../../utils/enumerados';
import { ICiudadano } from '../interfaces/ICiudadano';
import { InscripcionService } from '../services/inscripcion.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { captcha } from '../../../../environments/apiKeyMaps';

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
    public infoCud = false;
    public infoNrotramite = false;
    public sexos: any[];
    public relacionLaboral = [
        { id: 'planta', label: 'Personal de planta' },
        { id: 'eventual', label: 'Personal con contrato eventual' },
        { id: 'terciarizado', label: 'Personal de empresas que brindan servicios terciarizados en ese establecimiento' },
        { id: 'locacion', label: 'Personal contratado por locación de servicios (monotributista, factura AFIP)' },
        { id: 'locacion', label: 'Personal autónomo que factura honorarios a través de colegios o instituciones similares' },
        { id: 'otros', label: 'Otros' },
    ];
    public dias = [
        { id: 'lunes', nombre: 'Lunes, miércoles y viernes' },
        { id: 'martes', nombre: 'Martes, jueves y sábados' },
        { id: 'nocorresponde', nombre: 'No corresponde a mi situación' },
    ];
    public morbilidades = [
        { id: 'diabetes', label: 'Diabetes (insulinodependiente y no insulinodependiente)' },
        { id: 'obesidad', label: 'Obesidad grado 2 o mayor (índice de masa corporal -IMC- mayor a 35)' },
        { id: 'cardiovascular', label: 'Enfermedad cardiovascular' },
        { id: 'renal', label: 'Enfermedad renal crónica' },
        { id: 'respiratoria', label: 'Enfermedad respiratoria crónica' }
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
        cud: '',
        alergia: false,
        condicion: false,
        convaleciente: false,
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
        diaseleccionados: '',
        recaptcha: '',
        morbilidades: undefined
    };

    public relacion = null;
    public sexo = null;
    diaSeleccion = null;
    public seleccionTramite = true;
    public fechaMaximaNacimiento;
    public fechaMinimaNacimiento;

    public profesion;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    public grupoSelected;
    public captchaEnabled = true;

    constructor(
        private plex: Plex,
        private localidadService: LocalidadService,
        private profesionesService: ProfesionService,
        private inscripcionService: InscripcionService,
        private grupoPoblacionalService: GrupoPoblacionalService,
        private route: ActivatedRoute
    ) {
        this.captchaEnabled = captcha.enabled;
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
        this.route.params.subscribe(params => {
            if (params.grupo) {
                this.opcionesGrupos$.pipe(
                    map(grupos => {
                        this.grupoSelected = grupos.find(g => g.nombre === params.grupo);
                        if (this.grupoSelected) {
                            this.ciudadano.grupo = this.grupoSelected;
                            this.seleccionaGrupo();
                        }
                    })
                ).subscribe();
            }
        });
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
        this.infoCud = false;
        this.infoNrotramite = false;
        if (grupo) {
            switch (grupo.nombre) {
                case 'discapacidad':
                    this.fechaMinimaNacimiento = moment('1900-01-01').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(18, 'years').toDate();
                    break;
                case 'mayores60':
                    this.fechaMinimaNacimiento = moment('1900-01-01').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(60, 'years').toDate();
                    break;
                case 'personal-salud':
                case 'policia':
                    this.fechaMinimaNacimiento = moment('1900-01-01').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(18, 'years').toDate();
                    break;
                case 'factores-riesgo': {
                    this.fechaMinimaNacimiento = moment().subtract(60, 'years').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(18, 'years').toDate();
                    break;
                }
            }
        }
    }

    infoCUD() {
        this.infoCud = !this.infoCud;
    }

    infoNT() {
        this.infoNrotramite = !this.infoNrotramite;
    }

    save(valid) {
        if (!valid.formValid) {
            this.plex.info('danger', 'Revise los datos ingresados');
            return;
        }
        this.ciudadano.sexo = this.sexo.id;
        this.ciudadano.profesion = this.profesion ? this.profesion.nombre : '';
        this.ciudadano.fechaRegistro = new Date();
        this.ciudadano.diaseleccionados = this.diaSeleccion ? this.diaSeleccion.id : '';
        this.ciudadano.morbilidades = this.ciudadano.morbilidades ? this.ciudadano.morbilidades.map(c => c.id) : [];
        this.inscripcionService.save(this.ciudadano).subscribe(inscripto => {
            if (inscripto.documento) {
                this.modal.showed = true;
            }
        }, (error) => {
            this.ciudadano.morbilidades = this.ciudadano.morbilidades.map(element => {
                return this.morbilidades.find(morbilidad => morbilidad.id === element);
            });
            this.recaptcha = '';
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
            cud: '',
            alergia: false,
            condicion: false,
            convaleciente: false,
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
            diaseleccionados: '',
            recaptcha: '',
            morbilidades: undefined,
        };
        this.formulario.form.markAsPristine();
    }

}

