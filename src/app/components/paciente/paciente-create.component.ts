import { FinanciadorService } from './../../services/financiador.service';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import { IFinanciador } from './../../interfaces/IFinanciador';
import {Observable} from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

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
    templateUrl: 'paciente-create.html'
})
export class PacienteCreateComponent implements OnInit {

    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    createForm: FormGroup;
    estados = [];
    sexos = [];
    generos = [];
    relacionTutores = [];
    estadosCiviles = [];
    tiposContactos = [];
    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    todasProvincias: IProvincia[] = [];
    localidades: ILocalidad[]= [];
    todasLocalidades: ILocalidad[] = [];
    showCargar: boolean;
    error: boolean = false;
    mensaje: string = "";
    barrios: IBarrio[] = [];
    obrasSociales: IFinanciador[] = [];
    pacRelacionados = [];

    constructor(private formBuilder: FormBuilder, private PaisService: PaisService,
    private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService, 
    private BarrioService: BarrioService,private pacienteService: PacienteService, 
                private financiadorService: FinanciadorService) {}

    ngOnInit() {

        //CArga de combos
        this.PaisService.get().subscribe(resultado => {this.paises = resultado});
        this.ProvinciaService.get().subscribe(resultado => {this.todasProvincias = resultado});
        this.LocalidadService.get().subscribe(resultado => {this.todasLocalidades = resultado});
        this.financiadorService.get().subscribe(resultado => {this.obrasSociales = resultado});
        
        this.showCargar = false;
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
            relaciones: this.formBuilder.array([
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

    iniRelacion(){
        return this.formBuilder.group({
            relacion: [''],
            referencia: [''],
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
                  this.data.emit(resultado)
             });

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        this.data.emit(null)
    }

    filtrarProvincias(indexPais: number){
        var pais = this.paises[(indexPais-1)];
        this.provincias = this.todasProvincias.filter((p) => p.pais.id == pais.id);
    }

    filtrarLocalidades(indexProvincia: number){
        var provincia = this.provincias[(indexProvincia-1)];
        this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == provincia.id);
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

    addRelacion(){
   // agrega form Financiador u obra Social
        const control = <FormArray> this.createForm.controls['relaciones'];
        control.push(this.iniRelacion());
    }

    removeRelacion(i: number) {
        // elimina form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['relaciones'];
        control.removeAt(i);
    }

    buscarPacRelacionado(){
        //var formsRel = this.createForm.value.relaciones[i];
        var nombre = (document.getElementById("relNombre") as HTMLSelectElement).value;
        var apellido = (document.getElementById("relApellido") as HTMLSelectElement).value;
        var documento = (document.getElementById("relDocumento") as HTMLSelectElement).value;

        if ((nombre == "") && (apellido == "") && (documento == "")) {
            this.error = true;
            this.mensaje = "Debe completar al menos un campo de búsqueda";
            return;
        }

        this.pacienteService.getBySerch(apellido, nombre, documento, "", null, "")
                                .subscribe(resultado => {
                                        if(resultado.length>0) {
                                            this.pacRelacionados = resultado;
                                            this.showCargar = false;
                                            this.error = false;
                                            this.mensaje = "";
                                        } else {
                                            this.pacRelacionados = []
                                            this.showCargar = true;
                                            this.error = true;
                                            this.mensaje = "No se encontraron datos registrados";
                                        }
                                    });
    }

    setRelacion(relacion:String,nombre:String, apellido: String, documento: String, referencia: String){
        return this.formBuilder.group({
            relacion: [relacion],
            referencia: [referencia],
            apellido: [apellido],
            nombre: [nombre],
            documento: [documento]
        });
    }

    validar(paciente: IPaciente){
        var relacion = (document.getElementById("relRelacion") as HTMLSelectElement).value;
        const control = <FormArray>this.createForm.controls['relaciones'];
        control.push(this.setRelacion(relacion,paciente.nombre,paciente.apellido,paciente.documento,paciente.id));

        (document.getElementById("relRelacion") as HTMLSelectElement).value = "";
        (document.getElementById("relNombre") as HTMLSelectElement).value = "";
        (document.getElementById("relApellido") as HTMLSelectElement).value = "";
        (document.getElementById("relDocumento") as HTMLSelectElement).value = "";

        this.pacRelacionados = []
    }

    cargarDatos(){
        this.error = false;
        this.mensaje = "";
        var relacion = (document.getElementById("relRelacion") as HTMLSelectElement).value;
        var nombre = (document.getElementById("relNombre") as HTMLSelectElement).value;
        var apellido = (document.getElementById("relApellido") as HTMLSelectElement).value;
        var documento = (document.getElementById("relDocumento") as HTMLSelectElement).value;

        if ((nombre == "") || (apellido == "") || (documento == "") || (relacion == "")) {
            this.error = true;
            this.mensaje = "Debe completar los datos solicitados";
            return;
        }

        const control = <FormArray>this.createForm.controls['relaciones'];
        control.push(this.setRelacion(relacion,nombre,apellido,documento, ""));

        (document.getElementById("relRelacion") as HTMLSelectElement).value = "";
        (document.getElementById("relNombre") as HTMLSelectElement).value = "";
        (document.getElementById("relApellido") as HTMLSelectElement).value = "";
        (document.getElementById("relDocumento") as HTMLSelectElement).value = "";

    }

}