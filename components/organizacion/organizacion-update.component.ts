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
            direccion: this.formBuilder.array([]),
            contacto: this.formBuilder.array([])
        });
       
        this.organizacionHijo.telecom.forEach(element => {
            const control = <FormArray> this.updateForm.controls['telecom'];
            control.push(this.formBuilder.group({
                tipo: [(element.tipo === undefined)?"":element.tipo],
                valor:[element.valor],
                ranking:[element.ranking],
                activo:[element.activo] 
            }));
        });
               
        this.myTipoEst = (this.organizacionHijo.tipoEstablecimiento === undefined)?{id:"",nombre:""}:
        this.organizacionHijo.tipoEstablecimiento;
        this.loadDirecciones(),
        this.loadContactos(),
        this.loadTelecom()
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
        this.localidades = [];
    }
      
    filtrarLocalidades(indiceSelected: number){
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) {return p.provincia.id == idProvincia; });
    }

    setDireccion(objDireccion: IDireccion) {
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
        if (cantDirecciones > 0) {
            for (var i = 0; i < cantDirecciones; i++) {
                var objDireccion: any = this.organizacionHijo.direccion[i];
                control.push(this.setDireccion(objDireccion)) 
            }
        }
    }

    setContacto(cont: any) {
        return this.formBuilder.group({
            proposito: [cont.proposito],
            nombre: [cont.proposito],
            apellido: [cont.apellido],
            tipo: [cont.tipo],
            valor: [cont.valor],
            activo: [cont.activo]
        })
    }

    loadContactos() {
        var cantidadContactosActuales = this.organizacionHijo.contacto.length;
        const control = < FormArray > this.updateForm.controls['contacto'];

        if (cantidadContactosActuales > 0) {
            for (var i = 0; i < cantidadContactosActuales; i++) {
                var contacto: any = this.organizacionHijo.contacto[i];
                control.push(this.setContacto(contacto))
            }
        }
    }

    setTelecom(cont: any) {
        return this.formBuilder.group({
            proposito: [cont.proposito],
            nombre: [cont.proposito],
            apellido: [cont.apellido],
            tipo: [cont.tipo],
            valor: [cont.valor],
            activo: [cont.activo]
        })
    }

    loadTelecom() {
        var cantidadTelecomActuales = this.organizacionHijo.telecom.length;
        const control = < FormArray > this.updateForm.controls['telecom'];

        if (cantidadTelecomActuales > 0) {
            for (var i = 0; i < cantidadTelecomActuales; i++) {
                var telecom: any = this.organizacionHijo.telecom[i];
                control.push(this.setTelecom(telecom))
            }
        }
    }
    
    addTelecom() {
        const control = <FormArray> this.updateForm.controls['telecom'];
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
    
    cambiarTipoEst(indiceSelected: number){
        this.myTipoEst = this.tipos[indiceSelected];
    }

    onCancel() {
        this.data.emit(null)
    }
    
    initContacto() {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            proposito: [''],
            nombre: [''],
            apellido: [''],
            tipo: [''],
            valor: [''],
            activo: ['']            
        });
    }

    addContacto() {
        const control = <FormArray> this.updateForm.controls['contacto'];
        control.push(this.initContacto());
    }

    removeContacto(indice: number){
        const control = <FormArray> this.updateForm.controls['contacto'];
        control.removeAt(indice);
    }
}