import { Observable } from 'rxjs/Rx';
import { OrganizacionService } from './../../services/organizacion.service';
import { IOrganizacion, tipoCom } from './../../interfaces/IOrganizacion';
import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { ProvinciaService } from './../../services/provincia.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';


@Component({
    selector: 'organizacion-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/organizacion/organizacion-create.html'
})
export class OrganizacionCreateComponent implements OnInit {
@Output() data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();


    tipos: ITipoEstablecimiento[];
    provincias: IProvincia[];
    createForm: FormGroup;
    localidades: any[]=[];
    tiposcom = tipoCom;
    keys: any[];
    

    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService,
    private provinciaService: ProvinciaService, private tipoEstablecimientoService: TipoEstablecimientoService) {}
        
    ngOnInit() {
        //this.tiposcom = tipoCom;
        this.keys = Object.keys(this.tiposcom);
        this.keys = this.keys.slice(this.keys.length / 2);
        this.provinciaService.get()
            .subscribe(resultado => {this.provincias = resultado;
                //this.localidades = this.provincias[0].localidades;
            });

        this.tipoEstablecimientoService.get()
            .subscribe(resultado => {this.tipos = resultado;});

        
        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            nivelComplejidad:[''],
            descripcion:['', Validators.required],
            codigo: this.formBuilder.group({
                sisa: ['', Validators.required],
                cuie:[''],
                remediar:[''],
            }),
            domicilio: this.formBuilder.group({
                calle: ['', Validators.required],
                numero:[''],
                provincia: [''],
                localidad: ['']
            }),


            telecom: this.formBuilder.group({
               tipo: [''],
               valor:[''],
               ranking:[''],
               activo:[''] 
            }),

            tipoEstablecimiento:[''],
        });
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

    getLocalidades(index) {
       // this.localidades= this.provincias[index].localidades;
    }


    onCancel(){
        this.data.emit(null)
    }

}