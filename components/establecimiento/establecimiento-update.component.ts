import { Observable } from 'rxjs/Rx';
import { EstablecimientoService } from './../../services/establecimiento.service';
import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

@Component({
    selector: 'establecimiento-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimientoCreate.html'
})
export class EstablecimientoUpdateComponent implements OnInit {

@Input() 
selectedEst:IEstablecimiento;

@Output() 
data: EventEmitter<IEstablecimiento> = new EventEmitter<IEstablecimiento>();


    /*Datos externos que deberían venir de algún servicio*/
    tipos = [{nombre: 'Hospital', descripcion: 'Hospital desc', clasificacion:'C1'}, {nombre:'Centro de Salud', descripcion:'Centro de Salud',clasificacion:'C2'}, 
         {nombre:'Posta Sanitaria',descripcion:'Posta Sanitaria',clasificacion:'C3'}];
    provincias = [{nombre: 'Neuquen', localidades: [{nombre:'Confluencia', codigoPostal:8300}, {nombre:'Plottier', codigoPostal:8389}]},
          {nombre: 'Rio Negro', localidades: [{nombre:'Cipolletti', codigoPostal:830890}, {nombre:'Cinco Saltos', codigoPostal:8303}]}];
    createForm: FormGroup;
    localidades: any[]=[];
    myTipoEst:any; 

    constructor(private formBuilder: FormBuilder, private establecimientoService: EstablecimientoService) {}

    ngOnInit() {
        debugger;
        this.myTipoEst = this.selectedEst.tipoEstablecimiento;
        this.createForm = this.formBuilder.group({
            nombre: [this.selectedEst.nombre, Validators.required],
            nivelComplejidad:[this.selectedEst.nivelComplejidad],
            descripcion:[this.selectedEst.descripcion, Validators.required],
            codigo: this.formBuilder.group({
                sisa: [this.selectedEst.codigo.sisa, Validators.required],
                cuie:[this.selectedEst.codigo.cuie],
                remediar:[this.selectedEst.codigo.remediar],
            }),
            domicilio: this.formBuilder.group({
                calle: [this.selectedEst.domicilio.calle, Validators.required],
                numero:[this.selectedEst.domicilio.numero]
            //    provincia: this.formBuilder.group({
            //         nombre: ['', Validators.required],
            //         codigoPostal:[''],
            //         provincia:['']
            //     })
            }),
            tipoEstablecimiento:[],
            provincia:[''],
            localidad:['']
        });

    //this.createForm.value = this.selectedEst;
        
    }
    
    onSave(model: IEstablecimiento, isvalid: boolean){
        if(isvalid){
            let estOperation:Observable<IEstablecimiento>;
            model.habilitado = true;
            estOperation = this.establecimientoService.post(model);
            estOperation.subscribe(resultado => this.data.emit(resultado) );

        }else{
            alert("Complete datos obligatorios");
        }
    }

    getLocalidades(index) {
        this.localidades= this.provincias[index].localidades;
    }

    onCancel(){
        this.data.emit(null)
    }

}