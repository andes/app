import { EspecialidadUpdateComponent } from './especialidad-update.component';
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
    especialidades: IEspecialidad[];
    searchForm: FormGroup;
    selectedEsp: IEspecialidad;

    constructor(private formBuilder: FormBuilder, public plex: Plex, private especialidadService: EspecialidadService) { }


    ngOnInit() {
        
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            let codSisa = value.codigoSisa ? value.codigoSisa : ""
            this.loadEspecialidadesFiltradas(codSisa, value.nombre);
        })

        this.loadEspecialidades();
    }

    loadEspecialidades() {

        this.especialidadService.get()
            .subscribe(
            especialidades => this.especialidades = especialidades, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadEspecialidadesFiltradas(codigoSisa: string, nombre: String) {
        this.especialidadService.getByTerm(codigoSisa, nombre)
            .subscribe(
            especialidades => this.especialidades = especialidades, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onReturn(objEspecialidad: IEspecialidad): void {
        this.showcreate = false;
        this.showupdate = false;
        this.loadEspecialidades();
    }

    onDisable(objEspecialidad: IEspecialidad) {
        this.especialidadService.disable(objEspecialidad)
            .subscribe(dato => this.loadEspecialidades(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEnable(objEspecialidad: IEspecialidad) {
        this.especialidadService.enable(objEspecialidad)
            .subscribe(dato => this.loadEspecialidades(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEdit(objEspecialidad: IEspecialidad) {
        this.showcreate = false;
        this.showupdate = true;
        this.selectedEsp = objEspecialidad;

    }

}