import { EspecialidadCreateUpdateComponent } from './especialidad-create-update.component';
import { IEspecialidad } from './../../interfaces/IEspecialidad';
import { EspecialidadService } from './../../services/especialidad.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'especialidades',
    templateUrl: 'especialidad.html'
})
export class EspecialidadComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    datos: IEspecialidad[];
    searchForm: FormGroup;
    seleccion: IEspecialidad;

    constructor(private formBuilder: FormBuilder, public plex: Plex, private especialidadService: EspecialidadService) { }

    ngOnInit() {
        // Crea el formulario reactivo
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });
        //Genera la busqueda con el evento change.
        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            let codSisa = value.codigoSisa ? value.codigoSisa : ""
            this.loadDatos({"codigoSisa": codSisa, "nombre": value.nombre});
        })

        this.loadDatos();
    }

    loadDatos(parametros = {}){
        this.especialidadService.get(parametros).subscribe(
            datos => this.datos = datos) //Bind to view
    }

    onReturn(objEspecialidad: IEspecialidad): void {
        this.showcreate = false;
        this.showupdate = false;
        this.loadDatos();
    }

    onDisable(objEspecialidad: IEspecialidad) {
        this.especialidadService.disable(objEspecialidad)
            .subscribe(datos => this.loadDatos()) //Bind to view
    }

    onEnable(objEspecialidad: IEspecialidad) {
        this.especialidadService.enable(objEspecialidad)
            .subscribe(datos => this.loadDatos()) //Bind to view
    }

    onEdit(objEspecialidad: IEspecialidad) {
        this.showcreate = false;
        this.showupdate = true;
        this.seleccion = objEspecialidad;
    }

}