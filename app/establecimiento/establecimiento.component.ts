import {
    Component,
    OnInit
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { Efector } from './establecimiento';

@Component({
    selector: 'establecimiento',
    templateUrl: 'app/establecimiento/establecimiento.component.html'
})
export class Establecimiento implements OnInit {

    /*Datos externos que deberían venir de algún servicio*/
    tipos = ['Hospital', 'Centro de Salud', 'Posta Sanitaria'];
    zonas = ['Zona I', 'Zona II', 'Zona III'];
    /*****************************************************/

    /* Terminar esta parte reemplazando todo por el objeto efector*/
    efector = new Efector();

    registerForm: FormGroup;
    constructor(private formBuilder: FormBuilder) {}
    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            codigoSisa: ['', Validators.required],
            nombre: ['', Validators.required],
            descripcion:[''],
            complejidad:[''],
            cuie:['', Validators.required],
            domicilio:['', Validators.required],
            tipoEstablecimiento:[''],
            zona:['']
        });

        this.registerForm.valueChanges.subscribe(value => {
            console.log(value.firstname);        

        });
    }
    
    onSave(){
        alert('Hizo clic en guardar')
    }

    onCancel(){
        alert('Hizo Clic en cancelar')
    }

}

