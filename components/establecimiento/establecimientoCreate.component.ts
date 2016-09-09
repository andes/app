import { Observable } from 'rxjs/Rx';
import { EstablecimientoService } from './../../services/establecimiento.service';
import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

@Component({
    selector: 'establecimiento-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimientoCreate.html'
})
export class EstablecimientoCreateComponent implements OnInit {
@Output() data: EventEmitter<IEstablecimiento> = new EventEmitter<IEstablecimiento>();


    /*Datos externos que deberían venir de algún servicio*/
    tipos = [{nombre: 'Hospital', descripcion: 'Hospital desc', clasificacion:'C1'}, {nombre:'Centro de Salud', descripcion:'Centro de Salud',clasificacion:'C2'}, 
         {nombre:'Posta Sanitaria',descripcion:'Posta Sanitaria',clasificacion:'C3'}];
    provincias = [{nombre: 'Neuquen', localidades: [{nombre:'Confluencia', codigoPostal:8300}, {nombre:'Plottier', codigoPostal:8389}]},
          {nombre: 'Rio Negro', localidades: [{nombre:'Cipolletti', codigoPostal:830890}, {nombre:'Cinco Saltos', codigoPostal:8303}]}];
    createForm: FormGroup;
    localidades: any[]=[];

    constructor(private formBuilder: FormBuilder, private establecimientoService: EstablecimientoService) {}

    ngOnInit() {
         
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
                numero:['']
            //    provincia: this.formBuilder.group({
            //         nombre: ['', Validators.required],
            //         codigoPostal:[''],
            //         provincia:['']
            //     })
            }),
            tipoEstablecimiento:[''],
            provincia:[''],
            localidad:['']
        });

        
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