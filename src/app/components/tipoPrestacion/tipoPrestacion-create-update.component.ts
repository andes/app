import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { Observable } from 'rxjs/Observable';
import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';


@Component({
    selector: 'tipoPrestacion-create-update',
    templateUrl: 'tipoPrestacion-create-update.html'
}) // @Component

export class TipoPrestacionCreateUpdateComponent implements OnInit {

    public modelo: any = {};
    public SelectTipo: Array<Object> = [{ id: 'atomos', nombre: 'Atomos' }, { id: 'moleculas', nombre: 'Moleculas' }]; // tipoPisos:Array
    public SelectTipoAtomo: Array<Object> = [{ id: 'entidadObservable', nombre: 'Entidad observable' }, { id: 'problema', nombre: 'Lista de problemas' }]; // tipoPisos:Array
    public granularidad = {
        id: '',
        nombre: ''
    };
    public tipo = {
        id: '',
        nombre: ''
    };
    public titulo: String = '';
    // public seleccionado: any = null;
    // public reglas: any = {};
    // private showRegla: boolean = false;
    // private arrayReglas: any = [];
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
                 ejecucion: [// {
                //     idTipoPrestacion: String,
                //     reglas: [{
                //         nombre: String,
                //         valor: Number,
                //         condicion: String
                //     }]
                // }
                ],
                turneable: false,
                componente: {
                    ruta: '',
                    nombre: ''
                },
                tipo: String

            }; // this.modelo
            // console.log("this.modelo");
            // console.log(this.modelo);
        } else {
            this.granularidad.id = this.modelo.granularidad;
            this.tipo.id = this.modelo.tipo;
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


    getTiposProblemas(event) {
    }

    // ****************************************** //
    onSave() {
        // if (this.reglas.nombre && this.reglas.valor && this.reglas.condicion) {
        //     this.arrayReglas.push(this.reglas);
        //     console.log(this.arrayReglas);
        // }
        // this.modelo.ejecucion[0].reglas = this.arrayReglas;




        this.modelo.granularidad = this.granularidad.id;
        this.modelo.tipo = this.tipo.id;
        // Modo Update
        // console.log(this.modelo);
        // //delete this.modelo.ejecucion //.$order;
        // for (var i in this.modelo.ejecucion) {
        //     delete this.modelo.ejecucion[i].$order;
        // }
        // console.log('----------------------');
        // console.log(this.modelo);
        // console.log('----------------------');
        //  this.modelo.ejecucion[0].idTipoPrestacion = "2222";
        // this.modelo.ejecucion[0].reglas[0].nombre = "prueba22";
        // this.modelo.ejecucion[0].reglas[0].valor = 33;
        // this.modelo.ejecucion[0].reglas[0].condicion = "condicion22";
        // console.log(this.modelo);
        let method = (this.seleccion) ? this.tipoPrestacionService.put(this.modelo) : this.tipoPrestacionService.post(this.modelo);

        method.subscribe(tipoPrestacion => {
            if (tipoPrestacion) {
                this.data.emit(tipoPrestacion);
            } // if (tipoPrestacion)
        }); // post
    }; // onSave()


    // ****************************************** //
    onCancel() {
        this.data.emit(null);
        return false;
    }; // onCancel()



    // Ejecucion() {
    //     this.showRegla = true;
    //     this.modelo.ejecucion[0].idTipoPrestacion = this.seleccionado.id;
    //     console.log(this.modelo.ejecucion[0].idTipoPrestacion);
    //     console.log("###modelo");
    //     console.log(this.modelo);
    //     // console.log(this.modelo.ejecucion.idTipoPrestacion);
    //     // console.log(this.reglas);

    // }

    // AgregarReglas() {
    //     if (this.reglas.nombre && this.reglas.valor && this.reglas.condicion) {
    //         this.arrayReglas.push(this.reglas);
    //         console.log(this.arrayReglas);
    //     }
    //     this.modelo.ejecucion[0].reglas = this.arrayReglas;
    //     // console.log(this.reglas);
    //     console.log("###modelo");
    //     console.log(this.modelo);
    // }
    // QuitaReglas(id) {
    //     this.arrayReglas.splice(id,1);
    // }



} // export class TipoPrestacionCreateUpdateComponent
