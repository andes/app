import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';


@Component({
    selector: 'tipoPrestacion-create-update',
    templateUrl: 'tipoPrestacion-create-update.html'
}) // @Component

export class TipoPrestacionCreateUpdateComponent implements OnInit {

    public modelo: any = {};
    public SelectTipo: Array<Object> = [{ id: 'atomos', nombre: 'Atomos' }, { id: 'moleculas', nombre: 'Moleculas' }]; // tipoPisos:Array
    public granularidad = {
        id: '',
        nombre: ''
    };
    public titulo: String = '';
    // Parámetros In/Out
    @Input('seleccion') seleccion: ITipoPrestacion;
    @Output() data: EventEmitter<ITipoPrestacion> = new EventEmitter<ITipoPrestacion>();

    constructor(private formBuilder: FormBuilder, private tipoPrestacionService: TipoPrestacionService) { };

    // ****************************************** //
    ngOnInit() {

        Object.assign(this.modelo, this.seleccion);
        if (!this.seleccion) {

            this.titulo = 'Alta tipo de prestación';

            this.modelo = {
                key: '',
                nombre: '',
                id: '',
                autonoma: false,
                activo: true,
                granularidad: String,
                ejecucion: [],
                turneable: false,
                componente: {
                    ruta: '',
                    nombre: ''
                },

            }; // this.modelo
        } else{
            this.granularidad.id = this.modelo.granularidad;
            this.titulo = 'Modificación tipo de prestación';
         }
    } // ngOnInit

    // ****************************************** //
    camelcase() {
        if (this.modelo.nombre) {
            let nombre = this.modelo.nombre.toLowerCase()

                .replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); }) // Mayúscula en las primeras letras(a partir de la segunda palabra)
                .replace(/^(.)/, function ($1) { return $1.toUpperCase(); });  // Mayúscula en la primer letra

            let key = this.modelo.nombre
                .replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); }) // Mayúscula en las primeras letras(a partir de la segunda palabra)
                .replace(/\s/g, '') // Quita espacios en blanco
                .replace(/^(.)/, function ($1) { return $1.toLowerCase(); }) // Minúscula en la primer letra
                .replace(/(á|Á)/gi, 'a') // Quito asentos
                .replace(/(é|É)/gi, 'e')
                .replace(/(í|Í)/gi, 'i')
                .replace(/(ó|Ó)/gi, 'o')
                .replace(/(ú|Ú)/gi, 'u')
                .replace(/(ñ|Ñ)/gi, 'n');

            this.modelo.nombre = nombre;
            this.modelo.key = key;
            this.modelo.componente.nombre = key.charAt(0).toUpperCase() + key.slice(1) + 'Component';

            if (this.granularidad) {
                this.ruta();
            } // (this.modelo.granularidad)

        } // if(this.modelo.nombre)
    } // camelcase()

    // ****************************************** //
    ruta() {
        let granularidadString;

        if (this.seleccion) {
            granularidadString = this.modelo.granularidad;
        } else {
            granularidadString = this.granularidad.id;
        }

        if (granularidadString === 'atomos') {
            this.modelo.componente.ruta = 'rup/' + granularidadString + '/' + this.modelo.key + '.component.ts';
            this.modelo.ejecucion = []; // Limpio el Select
        } else {
            let nombreCarpeta = this.modelo.nombre
                .replace(/\s(.)/g, function ($1) { return $1.toLowerCase(); }) // Mayúscula en las primeras letras(a partir de la segunda palabra)
                .replace(/^(.)/, function ($1) { return $1.toLowerCase(); }) // Minúscula en la primer letra
                .replace(/\s/g, '-');
            this.modelo.componente.ruta = 'rup/' + granularidadString + '/' + nombreCarpeta + '/' + this.modelo.key + '.component.ts';
        } // else
    }; // ruta()


    // ****************************************** //
    // listado de tipos de prestaciones a utilizar
    utilizarTipoPrestaciones(event) {
        this.tipoPrestacionService.get({}).subscribe(event.callback);
    }; // utilizarTipoPrestacion(event)


    // ****************************************** //
    onSave() {
        //debugger;

        this.modelo.granularidad = this.granularidad.id;
        // Modo Update
        if (this.seleccion) {
            this.tipoPrestacionService.put(this.modelo).subscribe(tipoPrestacion => {
                // if (tipoPrestacion) {
                //     this.data.emit(tipoPrestacion);
                // } // if (tipoPrestacion)
            }); // post
        

        // Modo Insert
        } else {
            this.tipoPrestacionService.post(this.modelo).subscribe(tipoPrestacion => {
                if (tipoPrestacion) {
                    this.data.emit(tipoPrestacion);
                } // if (tipoPrestacion)
            }); // post
        }; // else
    }; // onSave()


    // ****************************************** //
    onCancel() {
        this.data.emit(null);
        return false;
    }; // onCancel()

} // export class TipoPrestacionCreateUpdateComponent
