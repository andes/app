import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
// import { FORM_DIRECTIVES } from '@angular/common';

import { ProfesionalService } from './../../services/profesional.service';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';

import { IProfesional } from './../../interfaces/IProfesional';
import { IMatricula } from './../../interfaces/IMatricula';
import {IPais} from './../../interfaces/IPais';
import { IProvincia } from './../../interfaces/IProvincia';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IBarrio } from './../../interfaces/IBarrio';
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'profesional-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/profesional/profesional-create.html'
})
export class ProfesionalCreateComponent implements OnInit {

    @Output() data: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    createForm: FormGroup;
    //Definición de arreglos
    sexos: any [];
    paises:IPais[] = [];
    provincias: IProvincia[] = [];
    todasProvincias: IProvincia[] = [];
    localidades: ILocalidad[]= [];
    todasLocalidades: ILocalidad[] = [];
    
    //barrios: IBarrio[] = [];

    constructor(private formBuilder: FormBuilder,
                private profesionalService: ProfesionalService,
                private paisService: PaisService,
                private provinciaService: ProvinciaService,
                private localidadService: LocalidadService) {}

    ngOnInit() {

        //Carga de combos
        this.sexos = enumerados.getSexo();
        
        this.paisService.get().subscribe(resultado => {this.paises = resultado});
        this.provinciaService.get().subscribe(resultado => this.todasProvincias = resultado);
        this.localidadService.get().subscribe(resultado => this.todasLocalidades = resultado);


        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            documento: ['', Validators.required],
            fechaNacimiento: ['', Validators.required],
            sexo: [],
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: [''],
                        barrio: ['']
                    }),
                    ranking: [''],
                    codigoPostal: [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
            ]),
            telefono: [''],
            email: [''],
            matriculas: this.formBuilder.array([
                this.iniMatricula()

            ])
        });
    }

    iniMatricula() {
        // Inicializa matrículas
        return this.formBuilder.group({
            numero: ['', Validators.required],
            descripcion: [''],
            fechaInicio: [''],
            fechaVencimiento: [''],
            vigente: [false]
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


    filtrarProvincias(indiceSelected: number){
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) {return p.pais.id == idPais; });
        this.localidades = [];
    }
    
    filtrarLocalidades(indiceSelected: number){
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) {return p.provincia.id == idProvincia; });
        
    }

    onSave(model: IProfesional, isvalid: boolean) {
        
        if (isvalid) {
            let profOperation: Observable<IProfesional>;
            model.activo = true;
            profOperation = this.profesionalService.post(model);

            profOperation.subscribe(resultado => { debugger; this.data.emit(resultado); });

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        this.data.emit(null)
    }



}