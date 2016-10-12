import { IDireccion } from './../../interfaces/IDireccion';
import { LocalidadService } from './../../services/localidad.service';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import { PaisService } from './../../services/pais.service';
import { Control } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES, FormArray } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { OrganizacionService } from './../../services/organizacion.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { ProvinciaService } from './../../services/provincia.service';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import * as enumerados from './../../utils/enumerados';


@Component({
    selector: 'organizacion-update',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/organizacion/organizacion-update.html'
})
export class OrganizacionUpdateComponent implements OnInit {

    @Input('selectedOrg') organizacionHijo: IOrganizacion;
    

    @Output()
    data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();

    /*Datos externos que deberían venir de algún servicio*/
    tipos: ITipoEstablecimiento[];
    tiposcom: String[];
    paises: IPais[];
    provincias: IProvincia[];
    todasProvincias: IProvincia[]=[];
    localidades: ILocalidad[];
    todasLocalidades: ILocalidad[]=[];
    updateForm: FormGroup;
    myTipoEst: any;
    myPais: any;
    myProvincia: any;
    myLocalidad: any;
    
    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService, private PaisService: PaisService,
    private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService, private tipoEstablecimientoService: TipoEstablecimientoService) { }

    ngOnInit() {
        //Carga de combos
        this.tiposcom = enumerados.getTipoComunicacion();

        this.PaisService.get().subscribe(resultado => {this.paises = resultado});
        this.ProvinciaService.get().subscribe(resultado => {this.todasProvincias = resultado});
        this.LocalidadService.get().subscribe(resultado => {this.todasLocalidades = resultado});
        
        this.tipoEstablecimientoService.get().subscribe(resultado => {this.tipos = resultado;});
        this.updateForm = this.formBuilder.group({
            nombre: [this.organizacionHijo.nombre, Validators.required],
            nivelComplejidad: [this.organizacionHijo.nivelComplejidad],
            codigo: this.formBuilder.group({
                sisa: [this.organizacionHijo.codigo.sisa, Validators.required],
                cuie: [this.organizacionHijo.codigo.cuie],
                remediar: [this.organizacionHijo.codigo.remediar],
            }),
          
            tipoEstablecimiento: [this.organizacionHijo.tipoEstablecimiento],
            telecom: this.formBuilder.array([]),
            direccion: this.formBuilder.array([])
        });
       
        this.organizacionHijo.telecom.forEach(element => {
            const control = <FormArray> this.updateForm.controls['telecom'];
            control.push(this.formBuilder.group({
                tipo: [(element.tipo === undefined)?"":element.tipo],
                valor:[element.valor],
                ranking:[element.ranking],
                activo:[element.activo] 
            }));
            debugger
        });
               
        // this.organizacionHijo.direccion.forEach(element => {
        //     const control = <FormArray> this.updateForm.controls['direccion'];
        //     control.push(this.formBuilder.group({
        //         valor:[element.valor],
        //         codigoPostal:[element.codigoPostal],
        //         ubicacion: this.formBuilder.group({
        //             pais: [(element.ubicacion.pais === undefined)?{id:"",nombre:""}:element.ubicacion.pais],
        //             provincia: [(element.ubicacion.provincia === undefined)?{id:"",nombre:""}:element.ubicacion.provincia],
        //             localidad: [(element.ubicacion.localidad === undefined)?{id:"",nombre:""}:element.ubicacion.localidad]
        //         }),
        //         activo: [element.activo]
        //     }));
        //     this.myPais = (element.ubicacion.pais === undefined)?{id:"",nombre:""}:element.ubicacion.pais;
        //     this.myProvincia = (element.ubicacion.provincia === undefined)?{id:"",nombre:""}:element.ubicacion.provincia;
        //     this.myLocalidad = (element.ubicacion.localidad === undefined)?{id:"",nombre:""}:element.ubicacion.localidad;
        // });
        
        this.myTipoEst = (this.organizacionHijo.tipoEstablecimiento === undefined)?{id:"",nombre:""}:
        this.organizacionHijo.tipoEstablecimiento;
        this.loadDirecciones()
    }

    onSave(model: any, isvalid: boolean) {
        if (isvalid) {
            let estOperation: Observable<IOrganizacion>;
            model.id = this.organizacionHijo.id;
            model.tipoEstablecimiento = this.myTipoEst;
            estOperation = this.organizacionService.put(model);
            estOperation.subscribe(resultado => this.data.emit(resultado));

        } else {
            alert("Complete datos obligatorios");
        }
    }

    filtrarProvincias(indiceSelected: number){
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) {return p.pais.id == idPais; });
        debugger
        this.localidades = [];
    }
      
    filtrarLocalidades(indiceSelected: number){
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) {return p.provincia.id == idProvincia; });
    }

    setDireccion(objDireccion: IDireccion) {
        //OJO revisar en el create el tema de los paises, localidades, etc no los guarda como obj solo el id
        debugger;
        if (objDireccion) {
           if (objDireccion.ubicacion) {
               if (objDireccion.ubicacion.pais) {
                   this.myPais = objDireccion.ubicacion.pais;
                   if (objDireccion.ubicacion.provincia) {
                       this.provincias = this.todasProvincias.filter((p) => p.pais.id == this.myPais.id);
                       this.myProvincia = objDireccion.ubicacion.provincia;
                       if (objDireccion.ubicacion.localidad) {
                           this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == this.myProvincia.id);
                           this.myLocalidad = objDireccion.ubicacion.localidad;
                       }
                   }
               }
           }
        }
        return this.formBuilder.group({
            valor: [objDireccion.valor],
            codigoPostal: [objDireccion.codigoPostal],
            ubicacion: this.formBuilder.group({
                pais: [this.myPais],
                provincia: [this.myProvincia],
                localidad: [this.myLocalidad]
            }),
            ranking: [objDireccion.ranking],
            activo: [objDireccion.activo]
        })
    }

    loadDirecciones() {
        var cantDirecciones = this.organizacionHijo.direccion.length;
        const control = < FormArray > this.updateForm.controls['direccion'];
        debugger;
        if (cantDirecciones > 0) {
            for (var i = 0; i < cantDirecciones; i++) {
                var objDireccion: any = this.organizacionHijo.direccion[i];
                control.push(this.setDireccion(objDireccion)) 
            }
        }
    }

    cambiarTipoEst(indiceSelected: number){
        this.myTipoEst = this.tipos[indiceSelected];
    }

    onCancel() {
        this.data.emit(null)
    }
    
    iniContacto(objContacto?: any) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        debugger
        return this.formBuilder.group({
            proposito: [objContacto.proposito],
            nombre: [''],
            apellido: [''],
            tipo: [''],
            valor: [''],
            activo: [true]
        });
    }

    addContacto(objContacto?: any) {
        // agrega formMatricula 
        const control = <FormArray> this.updateForm.controls['contacto'];
        debugger
        control.push(this.iniContacto(objContacto));
    }

    removeContacto(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.updateForm.controls['contacto'];
        control.removeAt(i);
    }
}