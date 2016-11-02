import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { FORM_DIRECTIVES } from '@angular/common';

import { ProfesionalService } from './../../services/profesional.service';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
import { EspecialidadService} from './../../services/especialidad.service';

import { IProfesional } from './../../interfaces/IProfesional';
import { IMatricula } from './../../interfaces/IMatricula';
import {IPais} from './../../interfaces/IPais';
import { IProvincia } from './../../interfaces/IProvincia';
import { ILocalidad } from './../../interfaces/ILocalidad';
import {IEspecialidad} from './../../interfaces/IEspecialidad';
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'profesional-create',
    templateUrl: 'profesional-create.html'
})
export class ProfesionalCreateComponent implements OnInit {

    @Output() data: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    createForm: FormGroup;
    //Definición de arreglos
    sexos: any [];
    generos:any [];
    tipoComunicacion: any[];
    estadosCiviles: any[];

    paises:IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[]= [];
    todasProvincias: IProvincia[] = [];
    todasLocalidades: ILocalidad[] = [];
    todasEspecialidades: IEspecialidad[] = [];
    
    constructor(private formBuilder: FormBuilder,
                private profesionalService: ProfesionalService,
                private paisService: PaisService,
                private provinciaService: ProvinciaService,
                private localidadService: LocalidadService,
                private especialidadService: EspecialidadService) {}

    ngOnInit() {

        //Carga arrays
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.tipoComunicacion = enumerados.getTipoComunicacion();
        this.estadosCiviles = enumerados.getEstadoCivil();

        this.paisService.get().subscribe(resultado => {this.paises = resultado});
        this.provinciaService.get().subscribe(resultado => this.todasProvincias = resultado);
        this.localidadService.get().subscribe(resultado => this.todasLocalidades = resultado);

        this.especialidadService.get().subscribe(resultado => {this.todasEspecialidades = resultado})

        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            documento: ['', Validators.required],
            contacto: this.formBuilder.array([
                this.initContacto(1)
            ]),
            fechaNacimiento: ['', Validators.required],
            fechaFallecimiento: [''],
            sexo: [],
            genero:[''],
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    codigoPostal: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: ['']
                    }),
                    ranking: ['1'],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
            ]),
            estadoCivil: [''],
            foto: [''], //Queda pendiente para agregar un path o ver como se implementa
            rol:['',Validators.required],
            especialidad:this.formBuilder.array([
                //this.iniEspecialidad()
            ]),
            matriculas: this.formBuilder.array([
                this.iniMatricula()

            ])
        });
    }

    /*Código de matriculas*/
    iniMatricula() {
        // Inicializa matrículas
        return this.formBuilder.group({
            numero: ['', Validators.required],
            descripcion: [''],
            fechaInicio: [''],
            fechaVencimiento: [''],
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

    /*Código de especialidad*/
    
    setEspecialidad(id:string,nbe:String){
        return this.formBuilder.group({
            id:[id],
            nombre:[nbe],
        })
    }

    addEspecialidad(){
        var e = (document.getElementById("ddlEspecialidades")) as HTMLSelectElement;
        var indice = e.selectedIndex;
        var id = this.todasEspecialidades[indice].id;
        var nombre = this.todasEspecialidades[indice].nombre;
        
        const control = <FormArray>this.createForm.controls['especialidad'];
        control.push(this.setEspecialidad(id,nombre));
    }

    removeEspecialidad(i: number){
        const control = <FormArray>this.createForm.controls['especialidad'];
        control.removeAt(i);
    }


/*Código de filtrado de combos*/
    filtrarProvincias(indiceSelected: number){
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) {return p.pais.id == idPais});
        this.localidades = [];
    }
    
    filtrarLocalidades(indiceSelected: number){
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) {return p.provincia.id == idProvincia});
    }

    /*Código de contactos*/

    initContacto(rank: Number) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: [''],
            valor: [''],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    }

    addContacto() {
        const control = <FormArray> this.createForm.controls['contacto'];
        control.push(this.initContacto(control.length + 1));
    }

    removeContacto(indice: number){
        const control = <FormArray> this.createForm.controls['contacto'];
        control.removeAt(indice);
    }

    /*Guardar los datos*/
    onSave(model: IProfesional, isvalid: boolean) {
        debugger;
        if (isvalid) {
            let profOperation: Observable<IProfesional>;
            model.activo = true;
            profOperation = this.profesionalService.post(model);

            profOperation.subscribe(resultado => this.data.emit(resultado));

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        this.data.emit(null)
    }



}