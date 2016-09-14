import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

import { EspecialidadService } from './../../services/especialidad.service';
import { IEspecialidad } from './../../interfaces/IEspecialidad';

@Component({
    selector: 'especialidad-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/especialidad/especialidad-create.html'
})
export class EspecialidadCreateComponent implements OnInit {
    
    @Output()
    data: EventEmitter<IEspecialidad> = new EventEmitter<IEspecialidad>();
    createForm: FormGroup;
  
    constructor(private formBuilder: FormBuilder, private especialidadService: EspecialidadService) { }

    ngOnInit() {
        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            disciplina: [''],
            complejidad: [''],
            codigo: this.formBuilder.group({
                sisa: ['', Validators.required]  
            }),
            
        });
    }

    onSave(model: any, isvalid: boolean) {
        if (isvalid) {
            let espOperation: Observable<IEspecialidad>;
            model.habilitado = true;
            model.fechaAlta = Date();
            
            espOperation = this.especialidadService.post(model);
            espOperation.subscribe(resultado => this.data.emit(resultado));
        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
            this.data.emit(null)
    }

}
