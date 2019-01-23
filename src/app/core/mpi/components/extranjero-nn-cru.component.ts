import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PaisService } from '../../../services/pais.service';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IDireccion } from '../interfaces/IDireccion';
import { ParentescoService } from '../../../services/parentesco.service';
import { IContacto } from '../../../interfaces/IContacto';
import * as enumerados from '../../../utils/enumerados';
import { PacienteService } from '../services/paciente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BarrioService } from '../../../services/barrio.service';

@Component({
    selector: 'extranjero-nn-cru',
    templateUrl: 'extranjero-nn-cru.html'
})
export class ExtranjeroNNCruComponent implements OnInit {

    foto = '';
    estados = [];
    sexos: any[];
    generos: any[];
    estadosCiviles: any[];
    tipoComunicacion: any[];
    parentescoModel: any[];
    relacionesBorradas: any[];
    tipoIdentificacion: any[];

    provincias: IProvincia[] = [];
    pacientesSimilares = [];
    barriosNeuquen: any[];
    localidades: any[] = [];
    barrios: any[];

    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    validado = false;
    noPoseeContacto = false;
    contactosBackUp = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    sugerenciaAceptada = false;
    entidadValidadora = '';
    viveEnNeuquen = false;
    viveProvNeuquen = false;
    posibleDuplicado = false;
    altoMacheo = false;
    loading = false;
    esEscaneado = false;
    autoFocus = 0;
    hoy = moment().endOf('day').toDate();

    direccion: IDireccion = {
        valor: '',
        codigoPostal: '',
        ubicacion: {
            pais: null,
            provincia: null,
            localidad: null,
            barrio: null,
        },
        ranking: 0,
        geoReferencia: null,
        ultimaActualizacion: new Date(),
        activo: true
    };

    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };

    public relacion: IPacienteRelacion = {
        relacion: {
            id: '',
            nombre: '',
            opuesto: ''
        },
        referencia: '',
        nombre: '',
        apellido: '',
        documento: '',
        fechaNacimiento: null,
        sexo: ''
    };

    public pacienteModel: IPaciente = {
        id: null,
        documento: '',
        cuil: null,
        activo: true,
        estado: 'temporal',
        nombre: '',
        apellido: '',
        nombreCompleto: '',
        alias: '',
        contacto: [this.contacto],
        sexo: undefined,
        genero: undefined,
        fechaNacimiento: null, // Fecha Nacimiento
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        edad: null,
        edadReal: null,
        fechaFallecimiento: null,
        direccion: [this.direccion],
        estadoCivil: undefined,
        foto: null,
        relaciones: null,
        financiador: null,
        identificadores: null,
        claveBlocking: null,
        scan: null,
        reportarError: false,
        notaError: ''
    };

    public pacientes: IPacienteMatch[] | IPaciente[];
    changeRelaciones: boolean;

    constructor(
        public router: Router,
        private plex: Plex,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barriosService: BarrioService,
        private parentescoService: ParentescoService,
        private pacienteService: PacienteService
    ) { }


    ngOnInit() {
        this.updateTitle('Registro de un paciente sin DNI');

        // Se cargan los parentescos para las relaciones
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });

        this.relacionesBorradas = [];

        // Se cargan enumerados
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.tipoIdentificacion = enumerados.getObjTipoIdentificacion();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();

        // Se cargan provincias y localidades
        // Set País Argentina
        this.paisService.get({
            nombre: 'Argentina'
        }).subscribe(arg => {
            this.paisArgentina = arg[0];
        });

        // Cargamos todas las provincias
        this.provinciaService.get({}).subscribe(rta => {
            this.provincias = rta;
        });

        this.provinciaService.get({
            nombre: 'Neuquén'
        }).subscribe(Prov => {
            this.provinciaNeuquen = Prov[0];
        });

        this.localidadService.get({
            nombre: 'Neuquén'
        }).subscribe(Loc => {
            this.localidadNeuquen = Loc[0];
        });
    }

    private updateTitle(nombre: string) {
        this.plex.updateTitle('MPI / ' + nombre);
        this.plex.updateTitle([{
            route: 'apps/mpi/busqueda',
            name: 'MPI'
        }, {
            name: nombre
        }]);
    }


    // ---------------- PACIENTE -----------------------


    isEmptyObject(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }


    // ------------------ DATOS BASICOS -------------------------

    completarGenero() {
        if (!this.pacienteModel.genero) {
            this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        }
    }

    // ---------------------- DOMICILIO -----------------------

    /**
    * Change del plex-bool viveProvNeuquen
    * carga las localidades correspondientes a Neuquén
    * @param {any} event
    *
    * @memberOf PacienteCreateUpdateComponent
    */
    changeProvNeuquen(event) {
        if (event.value) {
            this.loadLocalidades(this.provinciaNeuquen);
        } else {
            this.viveEnNeuquen = false;
            this.localidades = [];
        }
    }
    /**
     * Change del plex-bool viveNQN
     * carga los barrios de Neuquén
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadNeuquen(event) {
        if (event.value) {
            this.loadBarrios(this.localidadNeuquen);
        } else {
            this.barriosNeuquen = [];
        }
    }

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            this.barriosService.getXLocalidad(localidad.id).subscribe(result => {
                this.barrios = result;
            });
        }
    }

    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                pais: pais.id
            }).subscribe(event.callback);
        }
    }

    loadLocalidades(provincia) {
        if (provincia && provincia.id) {
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
            });
        }
    }


    // ---------------- CONTACTOS ------------------------------

    addContacto(key, valor) {
        let indexUltimo = this.pacienteModel.contacto.length - 1;

        if (this.pacienteModel.contacto[indexUltimo].valor) {
            let nuevoContacto = Object.assign({}, {
                tipo: key,
                valor: valor,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });

            this.pacienteModel.contacto.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }

    }

    verificarContactosRepetidos() {
        let valores = [];
        for (let elem of this.pacienteModel.contacto) {
            const item = valores.find(s => s === elem.valor);
            if (item) {
                return false;
            } else {
                valores.push(elem.valor);
            }
        }
        return true;
    }

    verificarCorreoValido(indice, form) {
        let formato = new RegExp(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/);
        let mail = String(this.pacienteModel.contacto[indice].valor);
        form.form.controls['valor-' + indice].setErrors(null);  // con cada caracter nuevo 'limpia' el error y reevalúa
        window.setTimeout(() => {
            if (mail) {
                if (formato.test(mail)) {
                    form.form.controls['valor-' + indice].setErrors(null);
                } else {
                    form.form.controls['valor-' + indice].setErrors({ 'invalid': true });
                }
            }
        }, 500);
    }

    chequearContacto(key) {
        let index = this.pacienteModel.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return true;
        } else {
            return false;
        }
    }

    limpiarContacto() {
        if (this.noPoseeContacto) { // checkbox en true
            this.contactosBackUp = this.pacienteModel.contacto;
            this.pacienteModel.contacto = [this.contacto];
        } else {
            this.pacienteModel.contacto = this.contactosBackUp;
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.pacienteModel.contacto.splice(i, 1);
        }
    }

    onFocusout(type, value) {
        let item = null;
        for (let elem of this.pacienteModel.contacto) {
            if (elem.tipo === type || elem.valor === value) {
                item = elem;
            }
        }
        if (!item) {
            this.addContacto(type, value);
        } else {
            if (!item.valor) {
                item.valor = value;
            } else if (item.valor !== value) {
                this.addContacto(type, value);
            }
        }
    }

    // ------------------ SAVE -----------------------------

    cancel() {
        this.router.navigate(['apps/mpi/busqueda']);
    }

    save(event) {
        if (!event.formValid) {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
            return;
        }
        this.disableGuardar = true;
        let pacienteGuardar: any = Object.assign({}, this.pacienteModel);
        pacienteGuardar.tipoIdentificacion = ((typeof this.pacienteModel.tipoIdentificacion === 'string')) ? this.pacienteModel.tipoIdentificacion : (Object(this.pacienteModel.tipoIdentificacion).id);
        pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
        pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : undefined;
        pacienteGuardar.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });
        pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;
        if (this.viveProvNeuquen) {
            pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
        }
        if (this.viveEnNeuquen) {
            pacienteGuardar.direccion[0].ubicacion.localidad = this.localidadNeuquen;
        }
        this.pacienteService.save(pacienteGuardar).subscribe(
            resultadoSave => {
                if (this.changeRelaciones) {
                    this.saveRelaciones(resultadoSave);
                }
                this.plex.info('success', 'Los datos se actualizaron correctamente');
                this.router.navigate(['apps/mpi/busqueda']);
            },
            error => {
                this.plex.info('warning', 'Error guardando el paciente');
            }
        );
    }

    // Borra/agrega relaciones al paciente segun corresponda.
    saveRelaciones(unPaciente) {
        this.pacienteService.save(unPaciente).subscribe(unPacienteSave => {
            if (unPacienteSave) {
                // Borramos relaciones
                if (this.relacionesBorradas.length > 0) {
                    this.relacionesBorradas.forEach(rel => {
                        let relacionOpuesta = this.parentescoModel.find((elem) => {
                            if (elem.nombre === rel.relacion.opuesto) {
                                return elem;
                            }
                        });
                        let dto = {
                            relacion: relacionOpuesta,
                            referencia: unPacienteSave.id,
                        };
                        if (rel.referencia) {
                            this.pacienteService.patch(rel.referencia, {
                                'op': 'deleteRelacion',
                                'dto': dto
                            }).subscribe();
                        }
                    });
                }
                // agregamos las relaciones opuestas
                if (unPacienteSave.relaciones && unPacienteSave.relaciones.length > 0) {
                    unPacienteSave.relaciones.forEach(rel => {
                        let relacionOpuesta = this.parentescoModel.find((elem) => {
                            if (elem.nombre === rel.relacion.opuesto) {
                                return elem;
                            }
                        });
                        let dto = {
                            relacion: relacionOpuesta,
                            referencia: unPacienteSave.id,
                            nombre: unPacienteSave.nombre,
                            apellido: unPacienteSave.apellido,
                            documento: unPacienteSave.documento ? unPacienteSave.documento : '',
                            foto: unPacienteSave.foto ? unPacienteSave.foto : null
                        };
                        if (rel.referencia) {
                            this.pacienteService.patch(rel.referencia, {
                                'op': 'updateRelacion',
                                'dto': dto
                            }).subscribe();
                        }
                    });
                }
            }
        });
    }

    // ---------------- NOTIFICACIONES --------------------

    notasNotification(notasNew) {
        this.pacienteModel.notas = notasNew;
    }

    actualizarRelaciones(data: any) {
        this.changeRelaciones = true;
        this.pacienteModel.relaciones = data.relaciones;
        this.relacionesBorradas = data.relacionesBorradas;
    }

}
