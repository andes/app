import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { Establecimiento } from './establecimiento';

@Component({
    selector: 'establecimiento-alta',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimientoAlta.html'
})
export class EstablecimientoAltaComponent implements OnInit {

    /*Datos externos que deberían venir de algún servicio*/
    tipos = [{nombre: 'Hospital', descripcion: 'Hospital desc', clasificacion:'C1'}, {nombre:'Centro de Salud', descripcion:'Centro de Salud',clasificacion:'C2'}, {nombre:'Posta Sanitaria',descripcion:'Posta Sanitaria',clasificacion:'C3'}];
    zonas = ['Zona I', 'Zona II', 'Zona III'];
    /*****************************************************/
    
    createForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit() {
        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
             nivelComplejidad:[''],
            descripcion:[''],
            codigo: this.formBuilder.group({
                sisa: ['', Validators.required],
                cuie:[''],
                remediar:[''],
            })
        });

        this.createForm.valueChanges.subscribe(value => {
            console.log(value.nombre);        

        });
    }
    
    onSave(){
        alert('Hizo clic en guardar')
    }

    onCancel(){
        alert('Hizo Clic en cancelar')
    }

}