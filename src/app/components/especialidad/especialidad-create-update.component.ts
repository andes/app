import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EspecialidadService } from './../../services/especialidad.service';
import { IEspecialidad } from './../../interfaces/IEspecialidad';

@Component({
    selector: 'especialidad-create-update',
    templateUrl: 'especialidad-create-update.html'
})
export class EspecialidadCreateUpdateComponent implements OnInit {
    public modelo: any = {};
    @Input('seleccion') seleccion: IEspecialidad;
    @Output() data: EventEmitter<IEspecialidad> = new EventEmitter<IEspecialidad>();
    // createForm: FormGroup;
    constructor(private formBuilder: FormBuilder, private especialidadService: EspecialidadService) { }

    ngOnInit() {
        Object.assign(this.modelo, this.seleccion);
        if (!this.seleccion) {
            this.modelo = {
                nombre: '',
                descripcion: '',
                disciplina: '',
                complejidad: '',
                codigo: {
                    sisa: '',
                },
                activo: true,
            };
        }
        // console.log(this.modelo.codigo.sisa);
        // this.modelo.codigo.sisa = " ";
    }

    onSave() {
        // TODO: chequear si el formulario es válido
        let espOperation: Observable<IEspecialidad>;
        this.modelo.activo = true;
        this.modelo.fechaAlta = Date();

        if (this.seleccion) {
            this.modelo.fechaAlta = this.seleccion.fechaAlta;
            this.modelo.fechaBaja = this.seleccion.fechaBaja;
            this.modelo.id = this.seleccion.id;
            espOperation = this.especialidadService.put(this.modelo);
        } else {
            espOperation = this.especialidadService.post(this.modelo);
        }

        espOperation.subscribe(resultado => this.data.emit(resultado));
    }

    onCancel() {
        this.data.emit(null);
        return false;
    }

}
