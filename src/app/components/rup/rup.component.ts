import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { PrestacionEjecucionComponent } from './ejecucion/prestacionEjecucion.component';
import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { IPaciente } from './../../interfaces/IPaciente';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { PacienteService } from './../../services/paciente.service';
import { ObservarDatosService } from './../../services/rup/observarDatos.service';

// [Andrrr] 2107-02-07: Hay que esperar a un nuevo release de Angular para poder cargarlos dinámicamente
import { RUP_COMPONENTS } from '../../app.module';

import {
  Component, ViewContainerRef, ComponentFactoryResolver,
  Output, Input,
  OnInit, OnChanges, OnDestroy,
  EventEmitter
} from '@angular/core';

@Component({
  moduleId: 'RupModule',
  selector: 'rup',
  template: ''

})

export class RupComponent implements OnInit, OnChanges, OnDestroy {

  @Input() paciente: IPaciente;
  @Input() tipoPrestacion: any; // Ver que sea de tipo IPrestacion..
  @Input() datosIngreso: Object;
  @Input() soloValores: Boolean = null;
  @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
  // array de prestaciones que se estan ejecutando actualmente en el proceso
  @Input('prestacionesEjecucion') prestacionesEjecucion: ITipoPrestacion;
  // array de valores de las prestaciones que se estan ejecutando actualmente
  @Input('valoresPrestacionEjecucion') valoresPrestacionEjecucion: any = [];
  @Input() prestacion: IPrestacionPaciente;

  pacientePrestacion: any = {};
  // resultados a devolver
  data: any = {};
  mensaje: any = {};


  // Componente a cargar
  private componentContainer: any;

  tiposPrestaciones: Object[] = [];

  // Referencia al componente para poder manejarlo
  private componentReference: any;

  // Asegurar que el View está inicializado
  private isViewInitialized: boolean = false;

  // viewContainerRef es una referencia al padre del componente que queremos cargar
  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private pacienteService: PacienteService,
    private tipoPrestacionService: TipoPrestacionService,
    public servicioTipoPrestacion: TipoPrestacionService, // Publico por que lo usa la molecula
    public servicioObservarDatos: ObservarDatosService
  ) {
  }

  ngOnInit() {
    console.log('RUP', this.tipoPrestacion.granularidad);
    // El View ya está inicializado
    this.isViewInitialized = true;

    // Inicializamos la lista de Componentes RUP
    for (let comp of RUP_COMPONENTS) {
      this.tiposPrestaciones.push({
        'nombre': comp.name,
        'component': comp
      });
    }

    // Cargamos o actualizamos el componente 'Signos Vitales'
    this.loadComponent();

  }

  // TODO: revisar si hace falta
  ngOnChanges(changes) {

  }

  ngOnDestroy() {

  }

  devolverValores(obj?: any, tipoPrestacion?: any) {
    console.log('devolverValores');
    //Es Atomo
    if (this.tipoPrestacion.granularidad == 'atomos') {
      console.log('atomo');
      if (this.data[this.tipoPrestacion.key] === null) {
        this.data = {};
      }
    }
    //Molecula
    else {
      console.log('=#=#=#==#=#=#=#==#=#=====##Molecula#=#==#=#=#=#=#=#==#=#=#');
      // valor: variable con el resultado qeu viene del input del formulario
      let valor = (typeof obj !== 'undefined' && obj && obj[tipoPrestacion.key]) ? obj[tipoPrestacion.key] : null;
      if (valor) {
        if (!this.data[this.tipoPrestacion.key]) {
          this.data[this.tipoPrestacion.key] = {};
        }
        if (!this.data[this.tipoPrestacion.key][tipoPrestacion.key]) {
          this.data[this.tipoPrestacion.key][tipoPrestacion.key] = {};
        }
        this.data[this.tipoPrestacion.key][tipoPrestacion.key] = valor;
      } else if (this.data[this.tipoPrestacion.key][tipoPrestacion.key] && valor == null) {
        delete this.data[this.tipoPrestacion.key][tipoPrestacion.key];
      }
      if (!Object.keys(this.data[this.tipoPrestacion.key]).length) {
        this.data = {};
      }
    }
    this.mensaje = this.getMensajes();
    this.evtData.emit(this.data);
    this.servicioObservarDatos.actualizarDatos(this.data, this.tipoPrestacion.key);
    
  }

  getMensajes() {


  }

  // Método para cargar Components
  loadComponent() {
    // La creación dinámica de un Component tiene que darse después que se inicialize el View
    if (!this.isViewInitialized) {
      return;
    }

    // tslint:disable-next-line:no-console
    // console.info('Cargando tipo de prestación: ', this.tipoPrestacion.key);

    // No se puede cargar un componente pasando un string, buscamos en el 'diccionario' de tipos de prestaciones
    this.componentContainer = this.tiposPrestaciones.find(prestacion => {
      let p;
      p = prestacion;
      return p.nombre === this.tipoPrestacion.componente.nombre;
    });


    // Cargamos el componente
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.componentContainer.component);

    // Creamos el componente
    this.componentReference = this.viewContainerRef.createComponent(componentFactory);
    // console.log('this.componentReference: ', this.componentReference);
    // Activamos la detección de cambios

    // Agarramos la instancia
    let datosComponente = this.componentReference.instance;

    // tslint:disable-next-line:no-console
    // console.info('datosComponente: ', datosComponente);

    // Generamos valores de la ejecución
    // TODO: debe ser un array
    this.componentReference.instance.prestacion = this.prestacion;
    this.componentReference.instance.valoresPrestacionEjecucion = this.valoresPrestacionEjecucion;
    this.componentReference.instance.prestacionesEjecucion = this.prestacionesEjecucion;
    this.componentReference.instance.soloValores = this.soloValores;
    this.componentReference.instance.tipoPrestacion = this.tipoPrestacion;
    this.componentReference.instance.paciente = this.paciente;
    this.componentReference.instance.datosIngreso = this.datosIngreso;

    this.componentReference.changeDetectorRef.detectChanges();

    // let key = String(this.tipoPrestacion.key);
    // { 'valor': {}, 'mensaje': { 'texto': '' } }
    // let valores = { valor: {}, mensaje: { 'texto': '' } }
    // valores = this.componentReference.instance.data;
    // let salida = {};
    // salida[key] = valores.valor;

    // console.info('datosComponente: ', datosComponente);

    // this.data.mensaje = this.componentReference.instance.data.mensaje;

    // En caso de haber valores cargados en los datos de ingreso
    // ejecutamos el evento para devolverlos y armar los valores
    // de cada atomo
    if (this.datosIngreso) {
      this.evtData.emit(this.componentReference.instance.data);
    }

    // devolvemos los datos
    datosComponente.evtData.subscribe(e => {
      this.evtData.emit(this.componentReference.instance.data);
    });
  }

}
