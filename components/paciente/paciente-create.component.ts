import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import {Observable} from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProvinciaService } from './../../services/provincia.service';
import { PaisService } from './../../services/pais.service';
import { PacienteService } from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';

import {IPaciente } from './../../interfaces/IPaciente';
import { IProvincia } from './../../interfaces/IProvincia';

@Component({
    selector: 'paciente-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/paciente/paciente-create.html'
})
export class PacienteCreateComponent implements OnInit {
    createForm: FormGroup;
    estados = [];
    sexos = [];
    generos = [];
    relacionTutores = [];
    estadosCiviles = [];
    tiposContactos = [];
    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[]= [];
    barrios: IBarrio[] = [];
    obrasSociales = [{id:"42343241131",nombre:"ISSN"},{id:"4354353452",nombre:"SOSUNC"},{id:"32131313123123",nombre:"OSPEPRI"}]

    constructor(private formBuilder: FormBuilder, private PaisService: PaisService,
    private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService, 
    private BarrioService: BarrioService,private pacienteService: PacienteService) {}

    ngOnInit() {

        //CArga de combos
        this.PaisService.get().subscribe(resultado => {this.paises = resultado});
        this.ProvinciaService.get().subscribe(resultado => {this.provincias = resultado});
        this.LocalidadService.get().subscribe(resultado => {this.localidades = resultado});

        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.estados = enumerados.getEstados();
        this.relacionTutores = enumerados.getRelacionTutor();

        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: [''],
            alias: [''],
            documento: [''],
            fechaNacimiento: [],
            estado: ['', Validators.required],
            sexo: [''],
            genero: [''],
            estadoCivil: [''],
            contacto: this.formBuilder.array([
            ]),
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: [''],
                        barrio: ['']
                    }),
                    ranking: [1],
                    codigoPostal: [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
            ]),
            financiador: this.formBuilder.array([
            ]),
            tutor: this.formBuilder.array([
            ]),
            activo:[true]
        });
    }

    iniContacto(rank: Number) {
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

    iniFinanciador(rank: Number) {
        // form Financiador u obra Social
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            entidad: [''],
            ranking: [rank],
            fechaAlta: [fecha],
            fechaBaja: [''],
            activo: [true]
        });
    }

    iniTutor(){
        return this.formBuilder.group({
            relacion: [''],
            apellido: [''],
            nombre: [''],
            documento: ['']
        });
    }

    addContacto() {
        // agrega formMatricula 
        const control = <FormArray> this.createForm.controls['contacto'];
        control.push(this.iniContacto(control.length));
    }

    removeContacto(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(i);
    }

    onSave(model: IPaciente, isvalid: boolean) {
        debugger;
        if (isvalid) {
            let operacionPac: Observable < IPaciente > ;
             operacionPac = this.pacienteService.post(model);

             operacionPac.subscribe(resultado => {
                 debugger;
                 console.log(resultado);
             });

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        //this.data.emit(null)
    }

    findObject(objeto, dato) { 
    return objeto.id === dato;
}


    filtrarProvincias(indexPais: number){
        var pais = this.paises[(indexPais-1)];
        this.provincias = this.provincias.filter((p) => p.pais.id == pais.id);
    }

    filtrarLocalidades(indexProvincia: number){
        var provincia = this.provincias[(indexProvincia-1)];
        this.localidades = this.localidades.filter((loc) => loc.provincia.id == provincia.id);
    }

    verObraSocial(indexOS: any, indexFin: number){
        var OS = this.obrasSociales[(indexOS-1)];
        this.createForm.value.financiador[indexFin].id = OS.id;
    }

    addFinanciador(){
   // agrega form Financiador u obra Social
        const control = <FormArray> this.createForm.controls['financiador'];
        control.push(this.iniFinanciador(control.length));
    }

    removeFinanciador(i: number) {
        // elimina form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['financiador'];
        control.removeAt(i);
    }

    addTutor(){
   // agrega form Financiador u obra Social
        const control = <FormArray> this.createForm.controls['tutor'];
        control.push(this.iniTutor());
    }

    removeTutor(i: number) {
        // elimina form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['tutor'];
        control.removeAt(i);
    }

}