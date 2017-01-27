import { IDireccion } from './../../interfaces/IDireccion';
import { Observable } from 'rxjs/Rx';
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

@Component({
    selector: 'profesional-create-update',
    templateUrl: 'profesional-create-update.html'
})
export class ProfesionalCreateUpdateComponent implements OnInit {
    @Input('seleccion') seleccion: IProfesional;
    @Output() data: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    createForm: FormGroup;
    //Definición de arreglos
    sexos: any[];
    generos: any[];
    tipoComunicacion: any[];
    estadosCiviles: any[];

    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[] = [];
    todasProvincias: IProvincia[] = [];
    todasLocalidades: ILocalidad[] = [];
    todasEspecialidades: IEspecialidad[] = [];

    constructor(private formBuilder: FormBuilder,
        private profesionalService: ProfesionalService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private especialidadService: EspecialidadService) { }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estadosCiviles = enumerados.getObjEstadoCivil();


        //consultamos si es que hay datos cargados en seleccion ... entonces hacemos un update y no un insert
        let nombre = this.seleccion ? this.seleccion.nombre : '';
        let apellido = this.seleccion ? this.seleccion.apellido : '';
        let documento = this.seleccion ? this.seleccion.documento : '';
        let fechaNac = this.seleccion ? this.seleccion.fechaNacimiento : null;
        let fechaFalle = this.seleccion ? this.seleccion.fechaFallecimiento : null;
        let especialidades = this.seleccion ? this.seleccion.especialidad : null;
        let rol = this.seleccion ? this.seleccion.rol : '';
        debugger;
        //let sexo = 'masculino';
        //console.log('no te rompas');
        let sexoSelected = this.seleccion ? enumerados.getObjeto(this.seleccion.sexo) : null;
        // console.log(sexoSelected);
        // console.log('-------------------------');
        // console.log('-------------------------');
        // console.log('-------------------------');
        // console.log('-------------------------');
        //let sexo = 'masculino';
        let genero = this.seleccion ? enumerados.getObjeto(this.seleccion.genero) : null;
        //let genero = 'masculino';
        let estadoCivil = this.seleccion ? enumerados.getObjeto(this.seleccion.estadoCivil) : null;
        //let estadoCivil = "soltero";

        this.createForm = this.formBuilder.group({
            nombre: [nombre, Validators.required],
            apellido: [apellido, Validators.required],
            documento: [documento, Validators.required],
            contacto: this.formBuilder.array([]),
            fechaNacimiento: [fechaNac, Validators.required],
            fechaFallecimiento: [fechaFalle],
            sexo: [sexoSelected],
            genero: [genero],
            direccion: this.formBuilder.array([]),
            estadoCivil: [estadoCivil],
            foto: [''], //Queda pendiente para agregar un path o ver como se implementa
            rol: [rol, Validators.required],
            especialidad: [especialidades],
            matriculas: this.formBuilder.array([])
        });

        if (this.seleccion) {
            //Cargo arrays selecciondaos
            this.loadMatriculas();
            this.loadContactos();
            this.loadDirecciones();
        }

    }

    loadEspecialidades(event) {
        this.especialidadService.get({ nombre: event.query }).subscribe(event.callback)
    }

    /* Codigo Direccion */

    iniDireccion(unaDireccion?: IDireccion) {
        // Inicializa contacto
        debugger;
        var myPais;
        var myProvincia;
        var myLocalidad;
        if (unaDireccion) {
            if (unaDireccion.ubicacion) {
                if (unaDireccion.ubicacion.pais) {
                    myPais = unaDireccion.ubicacion.pais;
                    if (unaDireccion.ubicacion.provincia) {
                        this.provincias = this.todasProvincias.filter((p) => p.pais.id == myPais.id);
                        myProvincia = unaDireccion.ubicacion.provincia;
                        if (unaDireccion.ubicacion.localidad) {
                            this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == myProvincia.id);
                            myLocalidad = unaDireccion.ubicacion.localidad;
                        }
                    }
                }
            }

            return this.formBuilder.group({
                valor: [unaDireccion.valor],
                ubicacion: this.formBuilder.group({
                    pais: [myPais],
                    provincia: [myProvincia],
                    localidad: [myLocalidad]
                }),
                ranking: [unaDireccion.ranking],
                codigoPostal: [unaDireccion.codigoPostal],
                ultimaActualizacion: [unaDireccion.ultimaActualizacion],
                activo: [unaDireccion.activo]
            })
        } else {
            return this.formBuilder.group({
                valor: [''],
                ubicacion: this.formBuilder.group({
                    pais: [''],
                    provincia: [''],
                    localidad: ['']
                }),
                ranking: [],
                codigoPostal: [''],
                ultimaActualizacion: [''],
                activo: [true]
            })
        }
    }

    addDireccion(unaDireccion?) {
        debugger;
        // agrega formMatricula 
        const control = <FormArray>this.createForm.controls['direccion'];
        control.push(this.iniDireccion(unaDireccion));
    }

    loadDirecciones() {
        this.seleccion.direccion.forEach(element => {
            this.addDireccion(element);
        });
    }
    removeDireccion(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.createForm.controls['direccion'];
        control.removeAt(i);
    }
    /*Código de matriculas*/

    setMatricula(objMat: IMatricula) {
        return this.formBuilder.group({
            numero: [objMat.numero, Validators.required],
            descripcion: [objMat.descripcion],
            activo: [objMat.activo],
            fechaInicio: [objMat.fechaInicio],
            fechaVencimiento: [objMat.fechaVencimiento],

        })
    }

    loadMatriculas() {
        var cantidadMatriculasActuales = this.seleccion.matriculas.length;
        const control = <FormArray>this.createForm.controls['matriculas'];
        //Si tienen al menos una matrículas
        if (cantidadMatriculasActuales > 0) {
            for (var i = 0; i < cantidadMatriculasActuales; i++) {
                var objMatricula: IMatricula;
                objMatricula = this.seleccion.matriculas[i];
                control.push(this.setMatricula(objMatricula))
            }
        } else {
            control.push(this.iniMatricula());
        }
    }

    iniMatricula() {
        // Inicializa matrículas
        return this.formBuilder.group({
            numero: ['', Validators.required],
            descripcion: [''],
            fechaInicio: [null],
            fechaVencimiento: [null],
            activo: [true]
        });
    }

    addMatricula() {
        // agrega formMatricula 
        const control = <FormArray>this.createForm.controls['matriculas'];
        control.push(this.iniMatricula());
    }

    removeMatricula(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.createForm.controls['matriculas'];
        control.removeAt(i);
    }

    /*Código de filtrado de combos*/
    loadPaises(event) {
        this.paisService.get().subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        debugger;
        console.log("pais " + pais.value.id);
        this.provinciaService.get({ "pais": pais.value.id }).subscribe(event.callback);
    }

    loadLocalidades(event, provincia) {
        debugger;
        console.log("provincia " + provincia.value.id);
        this.localidadService.get({ "provincia": provincia.value.id }).subscribe(event.callback);
    }

    /*Código de contactos*/

    initContacto(rank: Number) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: ['', Validators.required],
            valor: ['', Validators.required],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    }

    addContacto() {
        const control = <FormArray>this.createForm.controls['contacto'];
        control.push(this.initContacto(control.length + 1));
    }

    removeContacto(indice: number) {
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(indice);
    }

    setContacto(cont: any) {
        let tipo = cont ? enumerados.getObjeto(cont.tipo) : null;
        return this.formBuilder.group({
            tipo: [tipo, Validators.required ],
            valor: [cont.valor, Validators.required],
            ranking: [cont.ranking],
            ultimaActualizacion: [cont.ultimaActualizacion],
            activo: [cont.activo]
        })
    }

    loadContactos() {
        var cantidadContactosActuales = this.seleccion.contacto.length;
        const control = <FormArray>this.createForm.controls['contacto'];

        if (cantidadContactosActuales > 0) {
            for (var i = 0; i < cantidadContactosActuales; i++) {
                var contacto: any = this.seleccion.contacto[i];
                control.push(this.setContacto(contacto))
            }
        } else {
            control.push(this.initContacto(1));
        }
    }

    /*Guardar los datos*/
    onSave(model: any, isvalid: boolean) {
        debugger;
        if (isvalid) {
            model.activo = true;
            model.genero = model.genero.id;
            model.sexo = model.sexo.id;
            model.estadoCivil = model.estadoCivil.id;
            model.contacto = model.contacto.map(elem => { elem.tipo = elem.tipo.id; return elem; })
            let profOperation: Observable<IProfesional>;

            if (this.seleccion) {
                model.id = this.seleccion.id;
                profOperation = this.profesionalService.put(model);
            } else {
                profOperation = this.profesionalService.post(model);
            }

            profOperation.subscribe(resultado => this.data.emit(resultado));

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        this.data.emit(null);
        return false;
    }
}