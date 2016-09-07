import { Observable } from 'rxjs/Rx';
import { EstablecimientoService } from './../../services/establecimiento.service';
import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

@Component({
    selector: 'establecimiento-alta',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimientoAlta.html'
})
export class EstablecimientoAltaComponent implements OnInit {

    /*Datos externos que deberían venir de algún servicio*/
   
    zonas = ['Zona I', 'Zona II', 'Zona III'];
    /*****************************************************/
    tipos = [{nombre: 'Hospital', descripcion: 'Hospital desc', clasificacion:'C1'}, {nombre:'Centro de Salud', descripcion:'Centro de Salud',clasificacion:'C2'}, 
         {nombre:'Posta Sanitaria',descripcion:'Posta Sanitaria',clasificacion:'C3'}];
    createForm: FormGroup;

    constructor(private formBuilder: FormBuilder,private establecimientoService: EstablecimientoService) {}

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
            console.log(JSON.stringify(model));
             let estOperation:Observable<IEstablecimiento>;
            model.habilitado = true;
            estOperation = this.establecimientoService.postEstablecimiento(model);
            estOperation.subscribe(resultado =>  alert(resultado.nombre));
            

        }else{
            alert("Complete datos obligatorios");
        }
    }

    onCancel(){
        alert('Hizo Clic en cancelar')
    }

}