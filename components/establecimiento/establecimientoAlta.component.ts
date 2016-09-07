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

    constructor(private formBuilder: FormBuilder) {}

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
            tipoEstablecimiento:this.formBuilder.group({
                    nombre: [''],
                    descripcion:[''],
                    clasificacion:['']
                })
        });

        this.createForm.valueChanges.subscribe(value => {
            console.log(value.tipoEstablecimiento.nombre);        

        });
    }
    
    onSave(model: IEstablecimiento, isvalid: boolean){
        console.log(JSON.stringify(model));
        alert(model.tipoEstablecimiento);
        alert(isvalid);
    }

    onCancel(){
        alert('Hizo Clic en cancelar')
    }

}