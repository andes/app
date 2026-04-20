import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';
import { NgForm } from '@angular/forms';
import { Plex } from '@andes/plex';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { FormPresetResourcesService } from 'src/app/modules/forms-builder/services/preset.resources.service';
import { SECCION_CONTACTOS_ESTRECHOS, SECCION_OPERACIONES, SECCION_USUARIO, SECCION_ESTRATEGIA, SECCION_SIGNOS_SINTOMAS, SECCION_CLASIFICACION, CLASIFICACIONESVSR } from '../../constantes';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { DocumentosService } from 'src/app/services/documentos.service';
@Component({
    selector: 'app-ficha-epidemiologica-crud',
    templateUrl: './ficha-epidemiologica-crud.component.html'
})
export class FichaEpidemiologicaCrudComponent implements OnInit, OnChanges {
    @Input() fichaName: string;
    @Input() paciente: IPaciente;
    @Input() form: any;
    @Input() fichaPaciente: any;
    @Input() editFicha: boolean;
    @Input() accesoHuds: boolean;
    @Input() hideVolver: boolean;
    @ViewChild('form', { static: false }) ngForm: NgForm;
    @Output() volver = new EventEmitter<any>();


    public ficha = [];
    public secciones;
    public descripcion: string;
    public Clasificacion = null;

    public nuevoContacto = false;
    public organizaciones$: Observable<any>;
    public asintomatico = false;
    public operaciones = [];
    public zonaSanitaria = null;
    public contactoCorrecto = false;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    public loading = true;
    constructor(
        private formsService: FormsService,
        private plex: Plex,
        private formsEpidemiologiaService: FormsEpidemiologiaService,
        private formPresetResourceService: FormPresetResourcesService,
        private auth: Auth,
        private organizacionService: OrganizacionService,
        private servicioDocumentos: DocumentosService
    ) { }

    ngOnInit(): void { }

    ngOnChanges() {
        this.formsService.search({ name: this.fichaName }).subscribe(res => {
            this.secciones = res[0].sections;
            this.descripcion = res[0].description;
            if (this.fichaPaciente) {

                this.fichaPaciente.secciones.map(sec => {
                    if (sec.name !== SECCION_CONTACTOS_ESTRECHOS && sec.name !== SECCION_OPERACIONES) {
                        const buscado = this.secciones.findIndex(seccion => seccion.name === sec.name);
                        if (buscado !== -1) {
                            if (sec.name === SECCION_USUARIO && this.editFicha) {
                                this.organizaciones$ = this.auth.organizaciones();
                                sec.fields.map(field => {
                                    switch (Object.keys(field)[0]) {
                                        case 'organizacion':
                                            this.secciones[buscado].fields[Object.keys(field)[0]] = { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre };
                                            this.setOrganizacion(this.secciones[buscado], this.auth.organizacion.id);
                                            break;
                                        case 'fechanotificacion':
                                            this.secciones[buscado].fields['fechanotificacion'] = Object.values(field)[0];
                                            break;

                                    }
                                });
                            } else {
                                sec.fields.map(field => {
                                    if (!this.editFicha && Object.keys(field)[0] === 'organizacion') {
                                        this.organizaciones$ = this.organizacionService.getById(field.organizacion.id ? field.organizacion.id : field.organizacion);
                                    }
                                    if (Object.keys(field)[0] === 'clasificacion') {
                                        this.asintomatico = field.clasificacion.id === 'casoAsintomatico' ? true : false;
                                    }
                                    const key = Object.keys(field);
                                    this.secciones[buscado].fields[key[0]] = field[key[0]];
                                });
                            }
                        }
                    } else {
                        if (sec.name === SECCION_OPERACIONES) {
                            this.operaciones = sec.fields;
                        }
                    }
                });
            } else {
                this.secciones.forEach(seccion => {
                    if (seccion.preset) {
                        this.formPresetResourceService.setResource(`${seccion.preset}`, seccion, this.paciente);
                    }
                });
            }
            this.loading = false;
        });
    }

    registrarFicha() {

        if (this.ngForm.invalid) {
            this.plex.info('warning', 'Hay campos obligatorios que no fueron completados', 'Atención');
            this.ngForm.control.markAllAsTouched();
        } else {
            this.getValues();
            this.setFicha();
        }
    }

    getValues() {
        this.secciones.map(seccion => {
            const campos = [];
            seccion.fields.forEach(arg => {
                const params = {};
                const key = arg.key;
                if (key) {
                    let valor = seccion.fields[key];
                    if (key === 'identificadorpcr') {
                        // Regex que empieza sin 0 y tiene solo números.
                        const regexHisop = new RegExp('^[1-9]+[0-9]*$');
                        if (valor && !regexHisop.test(valor)) {
                            const numeroPcr = valor.replace(/[a-z]*0*/i, '');
                            valor = numeroPcr;
                        }
                    }

                    if (valor !== undefined && valor !== null) {
                        params[key] = valor;
                        if (valor instanceof Date) {
                            params[key] = valor;
                        } else {
                            if (valor?.id) {
                                // caso en el que los select usan el select-search.directive que viene con los dos campos
                                if (valor?.nombre) {
                                    params[key] = {
                                        id: valor.id,
                                        nombre: valor.nombre
                                    };
                                } else {
                                    params[key] = valor.id;
                                }
                            } else if (valor === undefined) {
                                params[key] = arg.check;
                            }
                        }
                        campos.push(params);
                    }
                }
            });
            if (campos.length) {
                this.ficha.push({ name: seccion.name, fields: campos });
            }
        });
    }

    setFicha() {
        const type = this.form ? { id: this.form.id, name: this.form.name } : this.fichaPaciente.type;
        const fichaFinal = {
            type,
            secciones: this.ficha,
            config: this.form ? this.form.config : this.fichaPaciente.config,
            paciente: {
                id: this.paciente.id,
                documento: this.paciente.documento,
                nombre: this.paciente.nombre,
                alias: this.paciente.alias,
                apellido: this.paciente.apellido,
                fechaNacimiento: this.paciente.fechaNacimiento,
                estado: this.paciente.estado,
                tipoIdentificacion: this.paciente.tipoIdentificacion ? this.paciente.tipoIdentificacion : this.paciente.numeroIdentificacion ? 'Passport' : null,
                numeroIdentificacion: this.paciente.numeroIdentificacion ? this.paciente.numeroIdentificacion : null,
                direccion: this.paciente.direccion,
                sexo: this.paciente.sexo,
                genero: this.paciente.genero
            },
            configLaboratorio: {
                interopera: this.form ? this.form.config?.interoperaLab : this.fichaPaciente.configLaboratorio.interopera,
                resultado: this.form ? '' : this.fichaPaciente.configLaboratorio?.resultado,
                nroIdentificacion: this.form ? '' : this.fichaPaciente.configLaboratorio?.nroIdentificacion
            }
        };

        this.obtenerDatosClasificacion();
        this.plex.confirm('¿Desea continuar?', `La ficha se guardará y se abrirá en un evento en SNVS con la clasificación: <br/><b><i>${this.Clasificacion.nombre}</i></b>`).then((resultado) => {
            if (resultado) {
                if (this.fichaPaciente) {
                    this.formsEpidemiologiaService.update(this.fichaPaciente._id, fichaFinal).subscribe({
                        next: () => {
                            this.plex.toast('success', 'Su ficha fue actualizada correctamente');
                            this.volver.emit();
                        },
                        error: () => {
                            this.plex.toast('danger', 'ERROR: La ficha fue actualizada correctamente');
                        }
                    });
                } else {
                    this.formsEpidemiologiaService.save(fichaFinal).subscribe({
                        next: (fichaFinal) => {
                            const msg = fichaFinal.configLaboratorio?.interopera ? `La ficha con el identificador: ${fichaFinal.configLaboratorio.nroIdentificacion} fue registrada correctamente` : 'La ficha fue generada correctamente';
                            this.volver.emit();
                            this.plex.info('success', msg);
                        },
                        error: () => {
                            this.plex.toast('danger', 'ERROR: La ficha no pudo ser registrada');
                        }
                    });
                }
            }
        });


    }

    checkDependency(field) {
        let res = true;
        if (field.dependency) {
            const seccion = this.secciones.find(seccion => seccion.fields[field.dependency.id]);
            if (!seccion) {
                res = false;
                const seccionBuscada = this.secciones.find(seccion => seccion.fields[field.key]);
                if (seccionBuscada) {
                    seccionBuscada.fields[field.key] = null;
                }
            } else {
                if (field.dependency.valor) {
                    const campo = seccion.fields[field.dependency.id];
                    res = field.dependency.valor === campo || field.dependency.valor === campo?.id;
                }
            }
        }
        return res;
    }

    getField(fields: any[], key: string) {
        const item = fields.find(f => key in f);
        return item ? item[key] : undefined;
    }

    /**
     *  Indexa todos los campos del formulario por su key para búsquedas rápidas.
     */
    obtenerDatosClasificacion(): any {

        let organizacion = null;
        let internado = false;
        let previos10dias = false;
        let derivado = false;
        let internado14dias = false;
        let inicioSintomas = false;
        const sintomas: string[] = [];
        const edad = this.paciente.fechaNacimiento ? Math.floor((new Date().getTime() - new Date(this.paciente.fechaNacimiento).getTime()) / 1000 / 60 / 60 / 24 / 365) : null;
        const edadMeses = this.paciente.fechaNacimiento ? Math.floor((new Date().getTime() - new Date(this.paciente.fechaNacimiento).getTime()) / 1000 / 60 / 60 / 24 / 30) : null;

        for (const section of this.ficha) {
            if (section.name === SECCION_USUARIO) {
                organizacion = this.getField(section.fields, 'organizacion');
            }

            if (section.name === SECCION_ESTRATEGIA) {
                const val = this.getField(section.fields, 'internado');
                internado = val?.nombre === 'SI';
                previos10dias = this.getField(section.fields, 'previos10dias');
                derivado = this.getField(section.fields, 'derivado');
                internado14dias = this.getField(section.fields, 'internado14dias');
                inicioSintomas = this.getField(section.fields, 'iniciosintomas');
            }

            if (section.name === SECCION_SIGNOS_SINTOMAS) {
                this.getField(section.fields, 'fiebre')?.nombre === 'SI' ? sintomas.push('fiebre') : null;
                this.getField(section.fields, 'tos')?.nombre === 'SI' ? sintomas.push('tos') : null;
                this.getField(section.fields, 'disnea')?.nombre === 'SI' ? sintomas.push('disnea') : null;
                this.getField(section.fields, 'sepsis')?.nombre === 'SI' ? sintomas.push('sepsis') : null;
                this.getField(section.fields, 'apneas')?.nombre === 'SI' ? sintomas.push('apneas') : null;

            }
        }

        if (!internado) {
            this.Clasificacion = organizacion?.nombre === 'HTAL ZAPALA - DR JUAN J POSE' ? CLASIFICACIONESVSR[2] : CLASIFICACIONESVSR[3];
        } else {
            this.Clasificacion = CLASIFICACIONESVSR[0];
            if (organizacion?.nombre === 'HTAL ZAPALA - DR JUAN J POSE') {
                if (previos10dias && sintomas.includes('fiebre') && sintomas.includes('tos') && !derivado && !internado14dias && !inicioSintomas) {
                    this.Clasificacion = CLASIFICACIONESVSR[1];
                } else {
                    if (!sintomas.includes('fiebre') && (sintomas.includes('disnea') || sintomas.includes('tos')) && (edad >= 60 || edad <= 2) && !derivado && !internado14dias && !inicioSintomas) {
                        this.Clasificacion = CLASIFICACIONESVSR[1];
                    } else {
                        if (!sintomas.includes('fiebre') && !sintomas.includes('disnea') && !sintomas.includes('tos') && (edad <= 0) && (edadMeses <= 6) && (sintomas.includes('sepsis') || sintomas.includes('apneas')) && !derivado && !internado14dias && !inicioSintomas) {
                            this.Clasificacion = CLASIFICACIONESVSR[1];
                        }
                    }
                }
            }
        }

        this.ficha.map(section => {
            if (section.name === SECCION_CLASIFICACION) {
                section.fields.push({ clasificacionfinal: this.Clasificacion });
            }
        });
        return this.Clasificacion;
    }

    toBack() {
        this.volver.emit();
    }

    setSemanaEpidemiologica(event) {
        const primerSintoma = moment(event.value);
        const primerDomingo = moment(primerSintoma).startOf('year').startOf('week').weekday(-1);
        if (primerDomingo.format('YYYY') < moment().format('YYYY')) {
            primerDomingo.add(7, 'days');
        }
        this.secciones.map(seccion => {
            if (seccion.id === 'informacionClinica') {
                const resultado = Math.trunc((primerSintoma.diff(primerDomingo, 'days') / 7)) + 1;
                seccion.fields['semanaepidemiologica'] = resultado ? resultado : '';
            }
        });
    }

    setOrganizacion(seccion, organizacion) {
        const idOrganizacion = organizacion.value ? organizacion.value.id : organizacion;
        this.organizacionService.getById(idOrganizacion).subscribe(res => {
            seccion.fields['telefonoinstitucion'] = res.contacto[0]?.valor;
            seccion.fields['localidad'] = {
                id: res.direccion.ubicacion.localidad.id,
                nombre: res.direccion.ubicacion.localidad.nombre
            };
            seccion.fields['provincia'] = {
                id: res.direccion.ubicacion.provincia.id,
                nombre: res.direccion.ubicacion.provincia.nombre
            };
            this.zonaSanitaria = res.zonaSanitaria;
        });
    }

    descargar() {
        const data = `${this.fichaPaciente.type.name} - ${this.fichaPaciente.paciente.nombre}_${this.fichaPaciente.paciente.apellido}`;
        this.servicioDocumentos.descargarFicha({
            ficha: this.fichaPaciente,
            usuario: this.auth.usuario.nombreCompleto
        }, data).subscribe();
    }
}
