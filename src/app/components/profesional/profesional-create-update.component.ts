import { IDireccion } from './../../interfaces/IDireccion';
import { Observable } from 'rxjs/Observable';
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
import { Router } from '@angular/router';
@Component({
    selector: 'profesional-create-update',
    templateUrl: 'profesional-create-update.html',
    styles: ['img {max-height: 200px;}']
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
        nombre: '',
        apellido: '',
        documento: null,
        contactos: [this.contacto],
        fechaNacimiento: '',
        sexo: '',
        generoAutopercibido: '',
        nombreAutopercibido: ''

    };
    match = new Matching();
    weights = {
        identity: 0.3,
        name: 0.3,
        gender: 0.1,
        birthDate: 0.3
    };
    validado = false;
    noPoseeContacto = false;
    constructor(private formBuilder: FormBuilder,
        private profesionalService: ProfesionalService,
        private paisService: PaisService,
        private plex: Plex,
        private router: Router,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private especialidadService: EspecialidadService,
        private renaperService: RenaperService) { }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estadosCiviles = enumerados.getObjEstadoCivil();

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
            this.profesional.contacto.splice(i, 1);
        }
    }

    renaperVerification(profesional) {
        if (!profesional.documento || (profesional.sexo.id === 'otro')) {
            this.plex.info('warning', 'La validación por renaper requiere sexo MASCULINO o FEMENINO.', 'Atención');
        } else {
            // this.loading = true;
            let sexoRena = null;
            let documentoRena = null;

            profesional.sexo = ((typeof profesional.sexo === 'string')) ? profesional.sexo : (Object(profesional.sexo).id);
            sexoRena = profesional.sexo === 'masculino' ? 'M' : 'F';
            documentoRena = profesional.documento;

            this.renaperService.get({ documento: documentoRena, sexo: sexoRena }).subscribe(
                resultado => {
                    if (resultado.datos.nroError === 0) {
                        this.validado = true;
                        this.profesional.nombre = resultado.datos.nombres;
                        this.profesional.apellido = resultado.datos.apellido;
                        this.profesional.fechaNacimiento = moment(resultado.datos.fechaNacimiento, 'YYYY-MM-DD');
                    } else {
                        this.plex.info('warning', '', 'El profesional no se encontro en renaper');
                    }
                });
        }
    }


    save($event) {
        if ($event.formValid) {
            let match100 = false;
            this.profesional['profesionalMatriculado'] = false;
            this.profesionalService.get({ documento: this.profesional.documento })
                .subscribe(
                    datos => {
                        if (datos.length > 0) {
                            datos.forEach(profCandidato => {

                                let porcentajeMatching = this.match.matchPersonas(this.profesional, profCandidato, this.weights, 'Levenshtein');
                                let profesionalMatch = {
                                    matching: 0,
                                    paciente: null
                                };
                                if (porcentajeMatching) {

                                    profesionalMatch.matching = porcentajeMatching * 100;
                                    profesionalMatch.paciente = profCandidato;
                                }
                                if (profesionalMatch.matching === 100) {
                                    match100 = true;
                                }

                            });

                            if (match100) {
                                this.plex.info('warning', '', 'El profesional que esta intentando guardar ya se encuentra cargado');
                                this.mostrarBtnGuardar = false;
                            } else {
                                this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);

                                this.profesionalService.saveProfesional({ profesional: this.profesional })
                                    .subscribe(nuevoProfesional => {
                                        this.plex.info('success', '', 'El profesional se creo con exito!');
                                        this.router.navigate(['/tm/profesional']);
                                    });
                            }
                            // this.sugeridosEncontrados = true;
                            // this.sugeridos = datos;
                        } else {
                            this.profesional.sexo = ((typeof this.profesional.sexo === 'string')) ? this.profesional.sexo : (Object(this.profesional.sexo).id);
                            this.profesionalService.saveProfesional({ profesional: this.profesional })
                                .subscribe(nuevoProfesional => {
                                    this.plex.info('success', '', 'El profesional se creo con exito!');
                                    this.router.navigate(['/tm/profesional']);

                                });
                        }

                    });
        }
    }

}
