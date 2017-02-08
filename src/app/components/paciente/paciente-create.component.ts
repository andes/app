import { FinanciadorService } from './../../services/financiador.service';
import { IDireccion } from './../../interfaces/IDireccion';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import { IFinanciador } from './../../interfaces/IFinanciador';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProvinciaService } from './../../services/provincia.service';
import { PaisService } from './../../services/pais.service';
import { PacienteService } from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';

import { IPaciente } from './../../interfaces/IPaciente';
import { IProvincia } from './../../interfaces/IProvincia';

@Component({
    selector: 'paciente-create',
    templateUrl: 'paciente-create.html'
})
export class PacienteCreateComponent implements OnInit {
    @Input('seleccion') seleccion: IPaciente;
    //@Input('selectedPaciente') pacienteHijo: IPaciente;
    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    createForm: FormGroup;
    estados = [];
    sexos : any [];
    generos :any [];
    estadosCiviles : any [];
    tipoComunicacion : any [];
    relacionTutores : any [];

    paises: IPais[] = [];
    provincias: IProvincia[] = [];
    localidades: ILocalidad[] = [];
    todasProvincias: IProvincia[] = [];
    todasLocalidades: ILocalidad[] = [];
    showCargar: boolean;
    error: boolean = false;
    mensaje: string = "";
    barrios: IBarrio[] = [];
    obrasSociales: IFinanciador[] = [];
    pacRelacionados = [];

    constructor(private formBuilder: FormBuilder,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private BarrioService: BarrioService,
        private pacienteService: PacienteService,
        private financiadorService: FinanciadorService) { }

    ngOnInit() {

        // //Se cargan los combos
        this.financiadorService.get().subscribe(resultado => {this.obrasSociales = resultado});
        //Se cargan los enumerados
        this.showCargar = false;
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.estadosCiviles = enumerados.getObjEstadoCivil();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estados = enumerados.getEstados();
        this.relacionTutores = enumerados.getObjRelacionTutor();

        //Se verifican los datos en la seleccion
        let nombre = this.seleccion ? this.seleccion.nombre : '';
        let apellido = this.seleccion ? this.seleccion.apellido : '';
        let alias = this.seleccion ? this.seleccion.alias : '';
        let documento = this.seleccion ? this.seleccion.documento : '';
        let fechaNac = this.seleccion ? this.seleccion.fechaNacimiento : null;
        let sexoSelected = this.seleccion ? enumerados.getObjeto(this.seleccion.sexo) : null;
        let generoSelected = this.seleccion ? enumerados.getObjeto(this.seleccion.genero) : null;
        let estadoCivilSelected = this.seleccion ? enumerados.getObjeto(this.seleccion.estadoCivil) : null;

        this.createForm = this.formBuilder.group({
            nombre: [nombre, Validators.required],
            apellido: [apellido, Validators.required],
            alias: [alias,Validators.required],
            documento: [documento,Validators.required],
            fechaNacimiento: [fechaNac,Validators.required],
            estado: ['', Validators.required],
            sexo: [sexoSelected],
            genero: [generoSelected],
            estadoCivil: [estadoCivilSelected],
            contacto: this.formBuilder.array([
              this.iniContacto(1)
            ]),
            direccion: this.formBuilder.array([
                this.iniDireccion()
            ]),
            financiador: this.formBuilder.array([
            ]),
            relaciones: this.formBuilder.array([
              //this.iniRelacion()
            ]),
            activo: [true]
        });
    }

    iniContacto(rank: Number) {
        // Inicializa los datos del contacto
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

    iniRelacion() {
        return this.formBuilder.group({
            relacion: [''],
            //referencia: [''],
            apellido: [''],
            nombre: [''],
            documento: ['']
        });
    }

    addContacto() {
        const control = <FormArray>this.createForm.controls['contacto'];
        control.push(this.iniContacto(control.length));
    }

    removeContacto(i: number) {
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(i);
    }

    iniDireccion(unaDireccion?: IDireccion) {
        // Inicializa Direccion
        //debugger;
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
                ranking: [1],
                codigoPostal: [''],
                ultimaActualizacion: [''],
                activo: [true]
            })
        }
    }

    addDireccion(unaDireccion?) {
        // agrega una Direccion al array de direcciones
        const control = <FormArray>this.createForm.controls['direccion'];
        control.push(this.iniDireccion(unaDireccion));
    }

    loadDirecciones() {
        this.seleccion.direccion.forEach(element => {
            this.addDireccion(element);
        });
    }

    removeDireccion(indice: number) {
        const control = <FormArray>this.createForm.controls['direccion'];
        control.removeAt(indice);
    }

    /*Código de filtrado de combos*/
    loadPaises(event) {
        this.paisService.get().subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        console.log("pais " + pais.value.id);
        this.provinciaService.get({ "pais": pais.value.id }).subscribe(event.callback);
    }

    loadLocalidades(event, provincia) {
        console.log("provincia " + provincia.value.id);
        this.localidadService.get({ "provincia": provincia.value.id }).subscribe(event.callback);
    }

    onSave(model: IPaciente, isvalid: boolean) {
        if (isvalid) {
            let operacionPac: Observable<IPaciente>;
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

    filtrarProvincias(indexPais: number) {
        var pais = this.paises[(indexPais - 1)];
        this.provincias = this.todasProvincias.filter((p) => p.pais.id == pais.id);
    }

    filtrarLocalidades(indexProvincia: number) {
        var provincia = this.provincias[(indexProvincia - 1)];
        this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == provincia.id);
    }

    addFinanciador() {
        // agrega form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['financiador'];
        control.push(this.iniFinanciador(control.length));
    }

    removeFinanciador(i: number) {
        // elimina form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['financiador'];
        control.removeAt(i);
    }

    addRelacion() {
        // agrega form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['relaciones'];
        control.push(this.iniRelacion());
    }

    removeRelacion(i: number) {
        // elimina form Financiador u obra Social
        const control = <FormArray>this.createForm.controls['relaciones'];
        control.removeAt(i);
    }


}
