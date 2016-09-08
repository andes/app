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
    createForm: FormGroup;
    

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
                numero:[''],
                localidad: this.formBuilder.group({
                    nombre: ['', Validators.required],
                    codigoPostal:[''],
                    provincia:['']
                })
            }),
            tipoEstablecimiento:['']
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

    onCancel(){
        alert('Hizo Clic en cancelar')
    }

}