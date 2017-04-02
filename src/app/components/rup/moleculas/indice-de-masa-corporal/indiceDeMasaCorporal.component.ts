import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PrestacionEjecucionComponent } from './../../ejecucion/prestacionEjecucion.component';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { IPrestacionPaciente } from './../../../../interfaces/rup/IPrestacionPaciente';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from "../../../../services/rup/prestacionPaciente.service";

@Component({
    selector: 'rup-indice-de-masa-corporal',
    templateUrl: 'indiceDeMasaCorporal.html'
})
export class IndiceDeMasaCorporalComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any;
    // array de prestaciones que se estan ejecutando actualmente en el proceso
    @Input('prestacionesEjecucion') prestacionesEjecucion: ITipoPrestacion;
    //array de valores de las prestaciones que se estan ejecutando actualmente
    @Input('valoresPrestacionEjecucion') valoresPrestacionEjecucion: any = [];
    @Input() prestacion: IPrestacionPaciente;

    // resultados a devolver
    data: any = {};
    prestacionesEnEjecucion: any = []; // Array de prestaciones en ejecucion
    showMoleculas: boolean = false;
    showIMC: boolean = false;
    prestacionesPaciente;
    showAlertas: boolean = false;//div de las alertas
    prestacionTalla: IPrestacionPaciente = null;

    constructor(private servicioTipoPrestacion: TipoPrestacionService,
        private servicioPrestacion: PrestacionPacienteService,
        private servicioPrestacionPaciente: PrestacionPacienteService) {
    }

    ngOnInit() {
        this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
            this.tipoPrestacion = tipoPrestacion;
        });

        //Recorremos todas las prestaciones en ejecucion y capturamos sus key
        let ejecucionKey;
        for (var elemento in this.prestacionesEjecucion) {
            ejecucionKey = this.prestacionesEjecucion[elemento].solicitud.tipoPrestacion.id;
            //vamos a capturar los componentes de las prestaciones activas con la key que recuperamos arriba.
            this.servicioTipoPrestacion.getById(ejecucionKey).subscribe(prestacionesEjecucion => {
                this.prestacionesEjecucion = prestacionesEjecucion;
                console.log(this.prestacionesEjecucion);
                prestacionesEjecucion.ejecucion.forEach(element => {
                    this.prestacionesEnEjecucion.push(element);
                });

                console.log(this.prestacionesEnEjecucion);
            });

        }
        // si vienen datos por input, los asignamos a nuestro objeto data
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    }

    onReturnComponent(obj: any, tipoPrestacion: any) {

        if (obj[tipoPrestacion.key]) {
            this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];

        } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && obj[tipoPrestacion.key] == null) {
            delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
        }
        this.evtData.emit(this.data);
    }

    findValues(obj, key) { //funcion para buscar una key y recupera un array con sus valores.
        return this.findValuesHelper(obj, key, []);
    }

    findValuesHelper(obj, key, list) {
        let i;
        let children;
        if (!obj) return list;
        if (obj instanceof Array) {
            for (i in obj) {
                list = list.concat(this.findValuesHelper(obj[i], key, []));
            }
            return list;
        }
        if (obj[key]) list.push(obj[key]);

        if ((typeof obj == "object") && (obj !== null)) {
            children = Object.keys(obj);
            if (children.length > 0) {
                for (i = 0; i < children.length; i++) {
                    list = list.concat(this.findValuesHelper(obj[children[i]], key, []));
                }
            }
        }
        return list;
    }

    //Buscar si existe la key en jecuciones anteriores de la bd 

    buscarPorKey(key) {
        this.servicioPrestacionPaciente.getByKey({ key: key, idPaciente: this.prestacion.paciente.id })
            .subscribe(prestacion => {
                if (prestacion)
                    this.prestacionTalla = prestacion[0];
            });
        return this.prestacionTalla;
    }


    calculoIMC() { //Evalua las instancias en las que se pueden capturar los valores
        //calcula el imc y/o devuelve alertas al usuario.
        let peso = null;
        let talla = null;
        let imc = null;
        let key;
        let prestacionPeso = false;
        let prestacionTalla = false;
        let busquedaKey: String;

        //Busca las prestaciones en ejecucion de peso y de talla
        for (var elemento in this.prestacionesEnEjecucion) {
            console.log(this.prestacionesEnEjecucion[elemento].key);
            if (this.prestacionesEnEjecucion[elemento].key == 'peso') {
                console.log('Tengo el peso');
                prestacionPeso = true;
            }
            if (this.prestacionesEnEjecucion[elemento].key == 'peso') {
                console.log('Tengo la talla');
                prestacionTalla = true;
            }

        }

        let arrayDePeso: any;
        let arrayDeTalla: any;
        //Aca va el valor del peso si es que esta en ejecucion..
        arrayDePeso = this.findValues(this.valoresPrestacionEjecucion, 'peso');
        if (arrayDePeso.length > 0) {
            peso = arrayDePeso[0];
        }
        //Aca va el valor de la talla si es que esta en ejecucion..
        arrayDeTalla = this.findValues(this.valoresPrestacionEjecucion, 'talla');
        if (arrayDeTalla.length > 0) {
            talla = arrayDeTalla[0];
        }

        //VER::::::::::::::::::::
        talla = 167; //harcodeo hasta actualizar con cambios de lea..
        debugger;
        //Si encuentro una de las prestaciones que necesito. peso-talla
        if (prestacionPeso || prestacionTalla) {
            //Si tengo las dos prestaciones Veo cual de las dos tiene datos.
            if (prestacionPeso && prestacionTalla) {
                switch (true) {
                    //Mostramos el  Alerta de talla y de peso
                    case (peso == null && talla == null):
                        this.data.alerta = 'Falta completar el campo talla y el campo peso';
                        this.showAlertas = true;
                        break;
                    //Mostramos el  Alerta de talla
                    case (peso != null):
                        this.data.alerta = 'Falta completar el campo talla';
                        this.showAlertas = true;
                        break;
                    //Mostramos alerta de peso.
                    case (talla != null):
                        this.data.alerta = 'Falta completar el campo peso';
                        this.showAlertas = true;
                        break;
                    //Tengo ambos valores calculo y muestro el IMC
                    case (peso != null && talla != null):
                        talla = talla / 100; //Paso a metros;
                        imc = peso / Math.pow(talla, 2);
                        this.data.imc = imc;
                        this.showIMC = true;
                        break;


                }
                //si solo tenemos la prestacion peso
                if (prestacionPeso) {
                    //Mostramos el  Alerta de peso si peso esta en null
                    if (peso == null) {
                        this.data.alerta = 'Falta completar el campo peso';
                        this.showAlertas = true;
                    }
                    //Si peso no es null
                    else {
                        busquedaKey = 'talla';
                        switch (true) {
                            //Tenemos el peso en prestacion actual y la talla tomada en otro momento
                            case (this.buscarPorKey(busquedaKey) != null):
                                talla = this.buscarPorKey(busquedaKey);
                                talla = talla / 100; //Paso a metros;
                                imc = peso / Math.pow(talla, 2);
                                this.data.imc = imc;
                                this.showIMC = true;
                                break; //Fataria mostrar un mensaje con la fecha en que fue tomada la talla y probar si funciona.
                            //No encontramos la talla entonces vamos a mostrar en ejecucion la talla 
                            case (this.buscarPorKey(busquedaKey) == null):
                                //Falta poder agregar la prestacion talla en ejecucion.
                                this.data.alerta = 'Falta completar el campo talla';// tambien mostramos un cartel que le indique al usuario.
                                this.showAlertas = true;
                                break;
                        }
                    }

                }
                //Si solo tenemos la prestacion talla
                if (prestacionTalla) {
                    //Mostramos el  Alerta de talla
                    if (talla == null) {
                        this.data.alerta = 'Falta completar el campo talla';
                        this.showAlertas = true;
                    }
                    //Si tenemos el valor de talla 
                    else {
                        busquedaKey = 'peso';
                        switch (true) {
                            //Tenemos la talla en prestacion actual y la peso tomada en otro momento
                            case (this.buscarPorKey(busquedaKey) != null):
                                peso = this.buscarPorKey(busquedaKey);
                                talla = talla / 100; //Paso a metros;
                                imc = peso / Math.pow(talla, 2);
                                this.data.imc = imc;
                                this.showIMC = true;
                                break; //Fataria mostrar un mensaje con la fecha en que fue tomada la talla y probar si funciona.
                            //No encontramos el peso entonces vamos a mostrar en ejecucion el peso 
                            case (this.buscarPorKey(busquedaKey) == null):
                                //Falta poder agregar la prestacion peso en ejecucion.
                                this.data.alerta = 'Falta completar el campo peso';// tambien mostramos un cartel que le indique al usuario.
                                this.showAlertas = true;
                                break;
                        }
                    }

                }
            }
        }
        //Si no tenemos ninguna buscamos en la huds
        else {
            busquedaKey = 'talla';
            talla = this.buscarPorKey(busquedaKey);

            busquedaKey = 'peso';
            peso = this.buscarPorKey(busquedaKey);
            if (peso != null && talla != null) {
                //Calculo el imc con esos valores y muestro un mensaje con la fecha de los registros.
                talla = talla / 100; //Paso a metros;
                imc = peso / Math.pow(talla, 2);
                this.data.imc = imc;
                this.showIMC = true;
            }
            else {
                this.data.alerta = 'Por favor agregue la prestacion peso y la prestacion talla';
            }

        }

    }
}

