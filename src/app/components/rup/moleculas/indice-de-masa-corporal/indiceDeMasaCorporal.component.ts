import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PrestacionEjecucionComponent } from './../../ejecucion/prestacionEjecucion.component';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { IPrestacionPaciente } from './../../../../interfaces/rup/IPrestacionPaciente';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { ObservarDatosService } from '../../../../services/rup/observarDatos.service';

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
  // array de valores de las prestaciones que se estan ejecutando actualmente
  @Input('valoresPrestacionEjecucion') valoresPrestacionEjecucion: any = [];
  @Input() prestacion: IPrestacionPaciente;

  // resultados a devolver
  data: any = {};
  prestacionesEnEjecucion: any = []; // Array de prestaciones en ejecucion
  showMoleculas: boolean = false;
  showIMC: boolean = false;
  prestacionesPaciente;
  showAlertas: boolean = false; // div de las alertas
  prestacionTalla: IPrestacionPaciente = null;
  changeLog: string[] = [];

  constructor(private servicioTipoPrestacion: TipoPrestacionService,
    private servicioObservarDatos: ObservarDatosService) {
    // Nos suscribimos a los cambios de los átomo necesario para realizar el cálculo
    servicioObservarDatos.getDato$('peso').subscribe(
      peso => {
        this.calculoIMC();
      });
    servicioObservarDatos.getDato$('talla').subscribe(
      talla => {
        this.calculoIMC();
      });
  }


  ngOnInit() {
    this.servicioTipoPrestacion.getById(this.tipoPrestacion.id).subscribe(tipoPrestacion => {
      this.tipoPrestacion = tipoPrestacion;
    });

    // Recorremos todas las prestaciones en ejecucion y capturamos sus key
    // let ejecucionKey;
    // for (var elemento in this.prestacionesEjecucion) {
    //   ejecucionKey = this.prestacionesEjecucion[elemento].solicitud.tipoPrestacion.id;
    //   // vamos a capturar los componentes de las prestaciones activas con la key que recuperamos arriba.
    //   this.servicioTipoPrestacion.getById(ejecucionKey).subscribe(prestacionesEjecucion => {
    //     this.prestacionesEjecucion = prestacionesEjecucion;
    //     prestacionesEjecucion.ejecucion.forEach(element => {
    //       this.prestacionesEnEjecucion.push(element);
    //     });
    //   });
    //
    // }
    // si vienen datos por input, los asignamos a nuestro objeto data
    this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : {};
    this.calculoIMC();


  }

  onReturnComponent(obj: any, tipoPrestacion: any) {
    if (obj[tipoPrestacion.key]) {
      this.data[this.tipoPrestacion.key][tipoPrestacion.key] = obj[tipoPrestacion.key];

    } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && obj[tipoPrestacion.key] == null) {
      delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
    }
    this.evtData.emit(this.data);

  }

  findValues(obj, key) { // funcion para buscar una key y recupera un array con sus valores.
    return this.findValuesHelper(obj, key, []);
  }

  findValuesHelper(obj, key, list) {
    let i;
    let children;
    if (!obj) {
      return list;
    }
    if (obj instanceof Array) {
      for (i in obj) {
        list = list.concat(this.findValuesHelper(obj[i], key, []));
      }
      return list;
    }
    if (obj[key]) {
      list.push(obj[key]);
    }

    if ((typeof obj === 'object') && (obj !== null)) {
      children = Object.keys(obj);
      if (children.length > 0) {
        for (i = 0; i < children.length; i++) {
          list = list.concat(this.findValuesHelper(obj[children[i]], key, []));
        }
      }
    }
    return list;
  }


  calculoIMC() { // Evalua las instancias en las que se pueden capturar los valores
    // calcula el imc y/o devuelve alertas al usuario.
    let peso = null;
    let talla = null;
    let imc = null;
    let key;
    let prestacionPeso = false;
    let prestacionTalla = false;
    // let busquedaKey: String;
    this.showIMC = false;
    this.showAlertas = false;

    // Busca las prestaciones en ejecucion de peso y de talla
    // for (var elemento in this.prestacionesEnEjecucion) {
    //   console.log(this.prestacionesEnEjecucion[elemento].key);
    //   if (this.prestacionesEnEjecucion[elemento].key == 'peso') {
    //     console.log('Tengo el peso');
    //     prestacionPeso = true;
    //   }
    //   if (this.prestacionesEnEjecucion[elemento].key == 'talla') {
    //     console.log('Tengo la talla');
    //     prestacionTalla = true;
    //   }
    //
    // }

    let arrayDePeso: any;
    let arrayDeTalla: any;
    // Aca va el valor del peso si es que esta en ejecucion..
    arrayDePeso = this.findValues(this.valoresPrestacionEjecucion, 'peso');
    if (arrayDePeso.length > 0) {
      peso = arrayDePeso[0];
      prestacionPeso = true;
      // console.log('PESO usado para IMC', peso);
    }
    // Aca va el valor de la talla si es que esta en ejecucion..
    arrayDeTalla = this.findValues(this.valoresPrestacionEjecucion, 'talla');
    if (arrayDeTalla.length > 0) {
      talla = arrayDeTalla[0];
      prestacionTalla = true;
      // console.log('TALLA usada para IMC', talla);
    }

    // Si encuentro las prestaciones que necesito. peso-talla
    if (prestacionPeso && prestacionTalla) {
      // Buscamos si las prestaciones en ejecucion tienen datos como para calcular el imc
      switch (true) {
        // Tengo ambos valores calculo y muestro el IMC
        case (peso != null && talla != null):
          talla = talla / 100; // Paso a metros;
          imc = peso / Math.pow(talla, 2);
          this.data.imc = imc;
          this.showIMC = true;
          break;
        // Mostramos el  Alerta de talla
        case (peso != null && talla == null):
          this.data.alerta = 'Falta completar el campo talla';
          this.showAlertas = true;
          break;
        // Mostramos alerta de peso.
        case (talla != null && peso == null):
          this.data.alerta = 'Falta completar el campo peso';
          this.showAlertas = true;
          break;
        // Se muestra alerta de talla y de peso
        default:
          this.data.alerta = 'Falta completar el campo talla y el campo peso';
          this.showAlertas = true;
          break;
      }
    } else {
      switch (true) {
        case (prestacionTalla && !prestacionPeso):
          this.data.alerta = 'Agregar la prestacion de peso';
          this.showAlertas = true;
          break;
        case (prestacionPeso && !prestacionTalla):
          this.data.alerta = 'Agregar la prestacion de talla';
          this.showAlertas = true;
          break;
        default:
          this.data.alerta = 'Agregar valores a la prestacion de talla  y valores a la prestacion de peso';
          this.showAlertas = true;
          break;
      }
    }

  }
}
