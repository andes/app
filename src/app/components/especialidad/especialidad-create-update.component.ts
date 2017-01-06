import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import { EspecialidadService } from './../../services/especialidad.service';
import { IEspecialidad } from './../../interfaces/IEspecialidad';

@Component({
    selector: 'especialidad-create-update',
    templateUrl: 'especialidad-create-update.html'
})
export class EspecialidadCreateUpdateComponent implements OnInit {
    
    @Input('seleccion') seleccion: IEspecialidad;
    @Output()
    data: EventEmitter<IEspecialidad> = new EventEmitter<IEspecialidad>();
    createForm: FormGroup;
    constructor(private formBuilder: FormBuilder, private especialidadService: EspecialidadService) { }

    ngOnInit() {

        //consultamos si es que hay datos cargados en seleccion ... entonces hacemos un update y no un insert
        let nombre = this.seleccion? this.seleccion.nombre: '';
        let codigo = this.seleccion? this.seleccion.codigo.sisa: '';
        let complejidad = this.seleccion? this.seleccion.complejidad: '';
        let descripcion = this.seleccion? this.seleccion.descripcion: '';
        let fechaAlta = this.seleccion? this.seleccion.fechaAlta: '';
        let fechaBaja = this.seleccion? this.seleccion.fechaBaja: '';
        let habilitado = this.seleccion? this.seleccion.habilitado: '';
        let disciplina = this.seleccion? this.seleccion.disciplina: '';
        

       this.createForm = this.formBuilder.group({
            nombre: [nombre, Validators.required],
            descripcion: [descripcion],
            disciplina: [disciplina],
            complejidad: [complejidad],
            codigo: this.formBuilder.group({
                sisa: [codigo, Validators.required]  
            }),
            
        });
    }

    onSave(model: any, isvalid: boolean) {
        if (isvalid) {
            let espOperation: Observable<IEspecialidad>;
            model.habilitado = true;
            model.fechaAlta = Date();

            if (this.seleccion){
                model.fechaAlta = this.seleccion.fechaAlta;
                model.fechaBaja = this.seleccion.fechaBaja;
                model.id = this.seleccion.id;
                debugger
                espOperation = this.especialidadService.put(model);
            }
            else{
                espOperation = this.especialidadService.post(model);
            }

            espOperation.subscribe(resultado => this.data.emit(resultado));
        } 
        else {
            alert("Complete datos obligatorios");
        }

    }

    onCancel() {
            this.data.emit(null)
            return false;
    }

}
