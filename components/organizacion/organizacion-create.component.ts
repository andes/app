import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { IPais } from './../../interfaces/IPais';
import { PaisService } from './../../services/pais.service';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { Observable } from 'rxjs/Rx';
import { OrganizacionService } from './../../services/organizacion.service';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES, FormArray } from '@angular/forms';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { ProvinciaService } from './../../services/provincia.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import * as enumerados from './../../utils/enumerados';


@Component({
    selector: 'organizacion-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/organizacion/organizacion-create.html'
})
export class OrganizacionCreateComponent implements OnInit {
@Output() data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();
    createForm: FormGroup;
    tipos: ITipoEstablecimiento[];
    tiposcom: String[];
    tiposContactos: String[];
    paises: IPais[];
    provincias: IProvincia[];
    todasProvincias: IProvincia[];
    localidades: ILocalidad[];
    todasLocalidades: ILocalidad[];
    barrios: IBarrio[];
    

    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService, private PaisService: PaisService,
    private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService, 
    private BarrioService: BarrioService, private tipoEstablecimientoService: TipoEstablecimientoService) {}
        
    ngOnInit() {
        this.tiposcom = enumerados.getTipoComunicacion();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.PaisService.get().subscribe(resultado => {this.paises = resultado});
        this.ProvinciaService.get().subscribe(resultado => {this.todasProvincias = resultado});
        this.LocalidadService.get().subscribe(resultado => {this.todasLocalidades = resultado});
        this.tipoEstablecimientoService.get().subscribe(resultado => {this.tipos = resultado;});

        
        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            nivelComplejidad:[''],
            codigo: this.formBuilder.group({
                sisa: ['', Validators.required],
                cuie:[''],
                remediar:[''],
            }),
            tipoEstablecimiento:[''],
            telecom: this.formBuilder.array([]),
            direccion: this.formBuilder.array([
               this.formBuilder.group({
                   valor: [''],
                   ubicacion: this.formBuilder.group({
                       pais: [''],
                       provincia: [''],
                       localidad: ['']
                   }),
                   ranking: [''],
                   codigoPostal: [''],
                   latitud: [''],
                   longitud: [''],
                   activo: [true]
               })
           ]),
           contacto: this.formBuilder.array([])
        });
    }

    addTelecom() {
        const control = <FormArray> this.createForm.controls['telecom'];
        control.push(this.iniTelecom());
    }

    iniTelecom() {
        // Inicializa telecom
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
           tipo: [''],
           valor:[''],
           ranking:[''],
           activo:[''] 
        });
    }

    removeTelecom(i: number) {
        // elimina formTelecom
        const control = <FormArray>this.createForm.controls['telecom'];
        control.removeAt(i);
    }

    iniContacto() {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            proposito: [''],
            nombre: [''],
            apellido: [''],
            tipo: [''],
            valor: [''],
            activo: [true]
        });
    }

    addContacto() {
        // agrega formContacto 
        const control = <FormArray> this.createForm.controls['contacto'];
        control.push(this.iniContacto());
    }

    removeContacto(i: number) {
        // elimina formContacto
        const control = <FormArray>this.createForm.controls['contacto'];
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
    
    onSave(model: IOrganizacion, isvalid: boolean){
        if(isvalid){
            let estOperation:Observable<IOrganizacion>;
            model.activo = true;
            estOperation = this.organizacionService.post(model);
            estOperation.subscribe(resultado => this.data.emit(resultado));

        }else{
            alert("Complete datos obligatorios");
        }
    }

    onCancel(){
        this.data.emit(null)
    }

}