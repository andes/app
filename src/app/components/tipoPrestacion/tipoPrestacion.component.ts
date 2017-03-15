import { TipoPrestacionCreateUpdateComponent } from './tipoPrestacion-create-update.component';
import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const limit = 25;

@Component({
    selector: 'tipoPrestacion',
    templateUrl: 'tipoPrestacion.html'
}) // @Component


export class TipoPrestacionComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    datos: ITipoPrestacion[];
    searchForm: FormGroup;
    seleccion: ITipoPrestacion;
    skip: number = 0;
    loader: boolean = false;
    finScroll: boolean = false;
    value: any;
    tengoDatos: boolean = true;
    nombre: String= '';
    granularidad:  {
                    id: '',
                    nombre: ''
                };

    public graanularidad_Filtro: Array<Object> = [{ id: 'atomos', nombre: 'Atomos' },
    { id: 'moleculas', nombre: 'Moleculas' },
    ]; // tipoPisos:Array

    constructor(private tipoPrestacionService: TipoPrestacionService) { }


    ngOnInit() {
        this.loadDatos();
    }// ngOnInit

    // listado de tipos de prestaciones a utilizar
    utilizarTipoPrestacion(event) {
        this.tipoPrestacionService.get({}).subscribe(event.callback);
    }// utilizarTipoPrestacion


    loadDatos() {
            let parametros = {
            // Filtros
            'nombre': this.nombre && this.nombre,
            'granularidad': this.granularidad && this.granularidad.id,
            'skip': this.skip,
            'limit': limit,
        };

        this.tipoPrestacionService.get(parametros).subscribe(
                    datos => {
                    this.datos = datos;
                    this.finScroll = false;
                             }); // Bind to view
    }// loadDatos



    onReturn(objTipoPrestacion: ITipoPrestacion): void {
        this.showcreate = false;
        this.showupdate = false;
        this.loadDatos();
    }// onReturn



    onEdit(objTipoPrestacion: ITipoPrestacion) {
        this.showcreate = false;
        this.showupdate = true;
        this.seleccion = objTipoPrestacion;
    }// onEdit




    activate(objTipoPrestacion: ITipoPrestacion) {

        if (objTipoPrestacion.activo) {
            this.tipoPrestacionService.disable(objTipoPrestacion)
                .subscribe(datos => this.loadDatos());  // Bind to view
        } else {
            this.tipoPrestacionService.enable(objTipoPrestacion)
                .subscribe(datos => this.loadDatos());  // Bind to view
        }
    }// activate


}// export class TipoPrestacionComponent