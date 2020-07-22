import { IDireccion } from '../../core/mpi/interfaces/IDireccion';
import { Observable } from 'rxjs';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { FORM_DIRECTIVES } from '@angular/common';
import { ProfesionalService } from './../../services/profesional.service';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { EspecialidadService } from './../../services/especialidad.service';
import { IProfesional } from './../../interfaces/IProfesional';
import { IMatricula } from './../../interfaces/IMatricula';
import { IPais } from './../../interfaces/IPais';
import { IProvincia } from './../../interfaces/IProvincia';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IEspecialidad } from './../../interfaces/IEspecialidad';
import * as enumerados from './../../utils/enumerados';
import {
    IContacto
} from './../../interfaces/IContacto';
import { RenaperService } from '../../services/fuentesAutenticas/servicioRenaper.service';
import { Plex } from '@andes/plex';
import { Matching } from '@andes/match';
import { Router, ActivatedRoute } from '@angular/router';
import { SIISAService } from '../../services/siisa.service';
import { ISiisa } from './../../interfaces/ISiisa';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'profesional-create-update',
    templateUrl: 'profesional-create-update.html',
    styleUrls: [
        'profesional.scss'
    ]
})
export class ProfesionalCreateUpdateComponent implements OnInit {
    @Input() seleccion: IProfesional;
    @Output() data: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    public fechaNacimiento: Date;
    public fechaFallecimiento: Date;

    // Getter que previene el error de AOT
    // https://github.com/angular/angular-cli/issues/6099
    get formData(): any { return this.createForm; }

    createForm: FormGroup;
    // Definición de arreglos
    sexos: any[];
    generos: any[];
    tipoComunicacion: any[];
    estadosCiviles: any[];
    sugeridos;
    mostrarBtnGuardar = true;
    match100 = false;
    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[] = [];
    todasProvincias: IProvincia[] = [];
    todasLocalidades: ILocalidad[] = [];
    todasEspecialidades: IEspecialidad[] = [];
    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };
    profesional: any = {
        id: '',
        nombre: '',
        apellido: '',
        documento: null,
        contactos: [this.contacto],
        fechaNacimiento: '',
        sexo: '',
        generoAutopercibido: '',
        nombreAutopercibido: '',
        profesionExterna: null,
        matriculaExterna: '',
    };
    match = new Matching();
    weights = {
        identity: 0.55,
        name: 0.10,
        gender: 0.3,
        birthDate: 0.05
    };
    fotoProfesional: any;
    validado = false;
    noPoseeContacto = false;
    public seEstaCreandoProfesional = true;
    public profesiones: ISiisa[] = [];
    constructor(private formBuilder: FormBuilder,
        private profesionalService: ProfesionalService,
        private paisService: PaisService,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private especialidadService: EspecialidadService,
        private renaperService: RenaperService,
        private siisaService: SIISAService,
        public sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estadosCiviles = enumerados.getObjEstadoCivil();

        this.route.params.subscribe(params => {
            if (params && params['id']) {
                this.seEstaCreandoProfesional = false;
                this.profesionalService.getProfesional({ id: params['id'] }).subscribe(profesional => {
                    this.profesional = profesional[0];
                    if (this.profesional.validadoRenaper) {
                        this.validado = true;
                        this.fotoProfesional = this.sanitizer.bypassSecurityTrustResourceUrl(this.profesional.foto);
                    } else {
                        this.profesionalService.getFoto({ id: this.profesional.id }).subscribe(resp => {
                            this.fotoProfesional = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
                        });
                    }
                });
            }
        });
        this.siisaService.getProfesiones().subscribe(res => {
            this.profesiones = res;
        });
    }


    /*Código de filtrado de combos*/
    loadPaises(event) {
        this.paisService.get({}).subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        this.provinciaService.get({ 'pais': pais.value.id }).subscribe(event.callback);
    }

    loadLocalidades(event, provincia) {
        this.localidadService.get({ 'provincia': provincia.value.id }).subscribe(event.callback);
    }

    /*Código de contactos*/

    addContacto(key, valor) {
        let nuevoContacto = Object.assign({}, {
            tipo: key,
            valor: valor,
            ranking: 0,
            activo: true,
            ultimaActualizacion: new Date()
        });
        this.profesional.contactos.push(nuevoContacto);
    }

    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.profesional.contactos = [this.contacto];
            this.profesional.contactos[0].valor = '';
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.profesional.contactos.splice(i, 1);
        }
    }

    renaperVerification(profesional) {
        if (!profesional.documento || (profesional.sexo.id === 'otro')) {
            this.plex.info('warning', 'La validación por RENAPER requiere sexo MASCULINO o FEMENINO.', 'Atención');
        } else {
            // this.loading = true;
            let sexoRena = null;
            let documentoRena = null;

            profesional.sexo = ((typeof profesional.sexo === 'string')) ? profesional.sexo : (Object(profesional.sexo).id);
            sexoRena = profesional.sexo;
            documentoRena = profesional.documento;
            this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(
                resultado => {
                    if (resultado) {
                        this.validado = true;
                        this.profesional.nombre = resultado.nombre.toUpperCase();
                        this.profesional.apellido = resultado.apellido.toUpperCase();
                        this.profesional.fechaNacimiento = moment(resultado.fechaNacimiento, 'YYYY-MM-DD');
                        this.profesional.validadoRenaper = true;
                        this.profesional.foto = resultado.foto;
                        this.fotoProfesional = this.sanitizer.bypassSecurityTrustResourceUrl(this.profesional.foto);
                        this.plex.toast('success', 'El profesional ha sido validado con RENAPER');
                    } else {
                        this.plex.info('warning', '', 'El profesional no se encontró en RENAPER');
                    }
                }, err => {
                    this.plex.info('warning', '', 'El profesional no se encontró en RENAPER');
                });
        }
    }

    save($event) {
        if ($event.formValid) {
            let match100 = false;
            this.profesional['profesionalMatriculado'] = false;
            this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);
            this.profesionalService.getProfesional({ documento: this.profesional.documento })
                .subscribe(
                    datos => {
                        if (datos.length > 0) {
                            datos.forEach(profCandidato => {
                                this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);
                                const prof = {
                                    sexo: (profCandidato.sexo && (typeof this.profesional.sexo === 'string')) ? profCandidato.sexo.toString().toLowerCase() : (Object(this.profesional.sexo).id),
                                    nombre: profCandidato.nombre,
                                    apellido: profCandidato.apellido,
                                    fechaNacimiento: profCandidato.fechaNacimiento,
                                    documento: profCandidato.documento
                                };
                                let porcentajeMatching = this.match.matchPersonas(this.profesional, prof, this.weights, 'Levenshtein');
                                let profesionalMatch = {
                                    matching: 0,
                                    paciente: null
                                };
                                if (porcentajeMatching) {

                                    profesionalMatch.matching = porcentajeMatching * 100;
                                    profesionalMatch.paciente = profCandidato;
                                }
                                if (profesionalMatch.matching >= 94) {
                                    match100 = true;
                                }

                            });

                            if (match100 && this.seEstaCreandoProfesional) {
                                this.plex.info('warning', '', 'El profesional que está intentando guardar ya se encuentra cargado');
                                // this.mostrarBtnGuardar = false;
                            } else {
                                this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);

                                this.profesionalService.saveProfesional(this.profesional)
                                    .subscribe(nuevoProfesional => {
                                        this.plex.info('success', '', `¡El profesional se ${this.seEstaCreandoProfesional ? 'creó' : 'editó'} con éxito!`);
                                        this.router.navigate(['/tm/profesional']);
                                    });
                            }
                            // this.sugeridosEncontrados = true;
                            // this.sugeridos = datos;
                        } else {
                            this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);
                            this.profesionalService.saveProfesional(this.profesional)
                                .subscribe(nuevoProfesional => {
                                    this.plex.info('success', '', '¡El profesional se creó con éxito!');
                                    this.router.navigate(['/tm/profesional']);

                                });
                        }

                    });
        }
    }
}
