import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { Auth } from '@andes/auth';
import { PrestacionPacienteService } from './../../services/rup/prestacionPaciente.service';
import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { PrestacionEjecucionComponent } from './ejecucion/prestacionEjecucion.component';
import { ITipoPrestacion } from './../../interfaces/ITipoPrestacion';
import { IPaciente } from './../../interfaces/IPaciente';
import { ElementosRupService } from './../../services/rup/elementosRUP.service';
import { PacienteService } from './../../services/paciente.service';
import { ObservarDatosService } from './../../services/rup/observarDatos.service';
import { SnomedService } from './../../services/term/snomed.service';

// [Andrrr] 2107-02-07: Hay que esperar a un nuevo release de Angular para poder cargarlos dinámicamente
import { RUP_ELEMENTS } from '../../app.module';

import {
    Component, ViewContainerRef, ComponentFactoryResolver,
    Output, Input,
    OnInit, OnDestroy,
    EventEmitter
} from '@angular/core';
import { ProfesionalService } from '../../services/profesional.service';

@Component({
    selector: 'rup',
    template: ''
})

export class RupComponent implements OnInit, OnDestroy {

    @Input() paciente: IPaciente;
    // TODO:renombrar tipoPrestacion a elementosRUP
    @Input() elementoRUP: any;
    @Input() datosIngreso: any;
    @Input() soloValores: Boolean = null;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // array de prestaciones que se estan ejecutando actualmente en el proceso
    // TODO: revisar uso de prestacionesEJecucion
    // @Input() prestacionesEjecucion: ITipoPrestacion;

    // array de valores de las prestaciones que se estan ejecutando actualmente
    // se utiliza para enviarle a las formulas
    @Input() valoresPrestacionEjecucion: any = [];
    @Input() prestacion: IPrestacionPaciente;

    @Input() snomedConcept: any;

    // pacientePrestacion: any = {};
    // resultados a devolver
    data: any = {};
    mensaje: any = {};

    // Componente a cargar
    private componentContainer: any;

    elementosRUP: Object[] = [];

    // Referencia al componente para poder manejarlo
    private componentReference: any;

    // Asegurar que el View está inicializado
    private isViewInitialized = false;

    // viewContainerRef es una referencia al padre del componente que queremos cargar
    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef,
        private pacienteService: PacienteService,
        public servicioElementosRUP: ElementosRupService, // Publico por que lo usa la molecula
        public servicioObservarDatos: ObservarDatosService,
        public serviceProfesional: ProfesionalService,
        public servicioPrestacion: PrestacionPacienteService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public auth: Auth,
        public SNOMED: SnomedService) {
    }

    ngOnInit() {
        // console.log('RUP', this.elementosRUP.tipo);
        // El View ya está inicializado
        this.isViewInitialized = true;

        // Inicializamos la lista de Componentes RUP
        for (let element of RUP_ELEMENTS) {
            this.elementosRUP.push({
                'nombre': element.key,
                'component': element.component
            });
        }

        // Cargamos o actualizamos el componente 'Signos Vitales'
        this.loadComponent();
    }

    ngOnDestroy() { }

    getMensajes() { }

    // Método para cargar Components
    loadComponent() {
        // La creación dinámica de un Component tiene que darse después que se inicialize el View
        if (!this.isViewInitialized) {
            return;
        }

        // No se puede cargar un componente pasando un string, buscamos en el 'diccionario' de tipos de prestaciones
        this.componentContainer = this.elementosRUP.find(prestacion => {
            let p;
            p = prestacion;
            return p.nombre === this.elementoRUP.componente.nombre;
        });

        // Cargamos el componente
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.componentContainer.component);

        // Creamos el componente
        this.componentReference = this.viewContainerRef.createComponent(componentFactory);

        // Agarramos la instancia
        let datosComponente = this.componentReference.instance;

        // Generamos valores de la ejecución
        // TODO: debe ser un array?
        this.componentReference.instance.prestacion = this.prestacion;
        this.componentReference.instance.valoresPrestacionEjecucion = this.valoresPrestacionEjecucion;
        // this.componentReference.instance.prestacionesEjecucion = this.prestacionesEjecucion;
        this.componentReference.instance.soloValores = this.soloValores;
        this.componentReference.instance.elementoRUP = this.elementoRUP;
        this.componentReference.instance.paciente = this.paciente;
        this.componentReference.instance.datosIngreso = this.datosIngreso;
        this.componentReference.instance.snomedConcept = this.snomedConcept;

        // En caso de haber valores cargados en los datos de ingreso
        // ejecutamos el evento para devolverlos y armar los valores
        // de cada átomo
        /*
        if (this.datosIngreso) {
            this.evtData.emit(this.componentReference.instance.data);
        }
        */

        // devolvemos los datos
        datosComponente.evtData.subscribe(e => {
            this.evtData.emit(this.componentReference.instance.data);
        });

        if (this.elementoRUP.tipo === 'formula') {
            this.evtData.emit(this.componentReference.instance.data);
        }

        this.componentReference.changeDetectorRef.detectChanges();
    }

    devolverValores(obj?: any, elementoRUPactual?: any) {
        // Átomo
        if (this.elementoRUP.tipo === 'atomo' || this.elementoRUP.tipo === 'formula') {
            // console.log('--> Átomo <--');
            if (this.data[this.elementoRUP.key] === null) {
                this.data = {};
            }

        } else {
            // Molécula
            // valor: variable con el resultado qeu viene del input del formulario
            let valor = (typeof obj !== 'undefined' && obj && obj[elementoRUPactual.key]) ? obj[elementoRUPactual.key] : null;
            if (valor) {
                if (!this.data[this.elementoRUP.key]) {
                    this.data[this.elementoRUP.key] = {};
                }
                if (!this.data[this.elementoRUP.key][elementoRUPactual.key]) {
                    this.data[this.elementoRUP.key][elementoRUPactual.key] = {};
                }
                this.data[this.elementoRUP.key][elementoRUPactual.key] = valor;
            } else {
                if (this.data[this.elementoRUP.key] && this.data[this.elementoRUP.key][elementoRUPactual.key] && valor == null) {
                    delete this.data[this.elementoRUP.key][elementoRUPactual.key];
                }
            }
            if (!Object.keys(this.data[this.elementoRUP.key]).length) {
                this.data = {};
            }
        }

        this.mensaje = this.getMensajes();

        this.evtData.emit(this.data);
    }

}
