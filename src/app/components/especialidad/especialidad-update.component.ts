import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { EspecialidadService } from './../../services/especialidad.service';
import { IEspecialidad } from './../../interfaces/IEspecialidad';


@Component({
    selector: 'especialidad-update',
    templateUrl: 'especialidad-update.html'
})
export class EspecialidadUpdateComponent implements OnInit {

    @Input('selectedEsp') especialidadHija: IEspecialidad;

    @Output()
    data: EventEmitter<IEspecialidad> = new EventEmitter<IEspecialidad>();

    updateForm: FormGroup;
    myTipoEsp: IEspecialidad;
    
    constructor(private formBuilder: FormBuilder, private especialidadService: EspecialidadService) { }

    ngOnInit() {
        debugger
        this.updateForm = this.formBuilder.group({
            nombre: [this.especialidadHija.nombre, Validators.required],
            descripcion: [this.especialidadHija.descripcion, Validators.required],
            disciplina: [this.especialidadHija.disciplina],
            complejidad: [this.especialidadHija.complejidad],
            habilitado: [this.especialidadHija.habilitado],
            codigo: this.formBuilder.group({
                sisa: [this.especialidadHija.codigo.sisa, Validators.required],    
            }),
            
        });
    }

    onSave(model: any, isvalid: boolean) {
        if (isvalid) {
            let espOperation: Observable<IEspecialidad>;
            model.fechaAlta = this.especialidadHija.fechaAlta;
            model.fechaBaja = this.especialidadHija.fechaBaja;
            model._id = this.especialidadHija.id;
            
            espOperation = this.especialidadService.put(model);
            espOperation.subscribe(resultado => this.data.emit(resultado));
            
        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
            this.data.emit(null)
    }




}
