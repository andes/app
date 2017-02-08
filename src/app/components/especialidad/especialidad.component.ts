import { EspecialidadCreateUpdateComponent } from './especialidad-create-update.component';
import { IEspecialidad } from './../../interfaces/IEspecialidad';
import { EspecialidadService } from './../../services/especialidad.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

const limit = 25;

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
    skip: number = 0;
    loader: boolean = false;
    finScroll: boolean = false;
    value: any;
    tengoDatos: boolean = true;

    constructor(private formBuilder: FormBuilder, public plex: Plex, private especialidadService: EspecialidadService) { }

    ngOnInit() {
        // Crea el formulario reactivo
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: [''],
            activo: ['']
        });
        // Genera la busqueda con el evento change.
        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            this.value = value;
            this.skip = 0;
            this.loadDatos(false);

        })
        this.loadDatos();
    }

    loadDatos(concatenar: boolean = false) {
        let parametros = {
            'codigoSisa': this.value && this.value.codigoSisa,
            'nombre': this.value && this.value.nombre, 'skip': this.skip, 'limit': limit
        };

        this.especialidadService.get(parametros).subscribe(
            datos => {
                if (concatenar) {
                    if (datos.length > 0) {
                        this.datos = this.datos.concat(datos);
                    } else {
                        this.finScroll = true;
                        this.tengoDatos = false;
                    }
                } else {
                    this.datos = datos;
                    this.finScroll = false;
                }

                this.loader = false;
            }); // Bind to view
    }

    onReturn(objEspecialidad: IEspecialidad): void {
        this.showcreate = false;
        this.showupdate = false;
        this.loadDatos();
    }

    onEdit(objEspecialidad: IEspecialidad) {
        this.showcreate = false;
        this.showupdate = true;
        this.seleccion = objEspecialidad;
    }


    activate(objEspecialidad: IEspecialidad) {

        if (objEspecialidad.activo) {

            this.especialidadService.disable(objEspecialidad)
                .subscribe(datos => this.loadDatos());  // Bind to view
        } else {
            this.especialidadService.enable(objEspecialidad)
                .subscribe(datos => this.loadDatos());  // Bind to view
        }
    }

    nextPage() {
        if (this.tengoDatos) {
            this.skip += limit;
            this.loadDatos(true);
            this.loader = true;
        }
    }

}