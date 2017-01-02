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
    
    @Input('selectedEsp') especialidadHija: IEspecialidad;
    @Output()
    data: EventEmitter<IEspecialidad> = new EventEmitter<IEspecialidad>();
    createForm: FormGroup;
    constructor(private formBuilder: FormBuilder, private especialidadService: EspecialidadService) { }

    ngOnInit() {

        //consultamos si es que hay datos cargados en especialidadHija ... entonces hacemos un update y no un insert
        let nombre = this.especialidadHija? this.especialidadHija.nombre: '';
        let codigo = this.especialidadHija? this.especialidadHija.codigo.sisa: '';
        let complejidad = this.especialidadHija? this.especialidadHija.complejidad: '';
        let descripcion = this.especialidadHija? this.especialidadHija.descripcion: '';
        let fechaAlta = this.especialidadHija? this.especialidadHija.fechaAlta: '';
        let fechaBaja = this.especialidadHija? this.especialidadHija.fechaBaja: '';
        let habilitado = this.especialidadHija? this.especialidadHija.habilitado: '';
        let disciplina = this.especialidadHija? this.especialidadHija.disciplina: '';
        

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

            if (this.especialidadHija){
                model.fechaAlta = this.especialidadHija.fechaAlta;
                model.fechaBaja = this.especialidadHija.fechaBaja;
                model.id = this.especialidadHija.id;
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
