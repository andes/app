import { ProfesionalService } from './../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, ViewContainerRef, ComponentFactoryResolver, Output, Input, OnInit, OnDestroy, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { RUPRegistry } from '../../../../app.module';
import { AdjuntosService } from '../../services/adjuntos.service';

@Component({
    selector: 'rup',
    styleUrls: ['rup.scss'],
    encapsulation: ViewEncapsulation.None,
    template: '' // Debe quedar vacío, y cada atómo indicar que usa 'rup.html' o su propio template
})
export class RUPComponent implements OnInit {
    // Propiedades
    @Input() elementoRUP: IElementoRUP;
    @Input() prestacion: IPrestacion;
    @Input() registro: IPrestacionRegistro;
    @Input() paciente: IPaciente;
    @Input() soloValores: boolean;
    @Input() params: any;
    public mensaje: any = {};

    // Eventos
    @Output() change: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Carga un componente dinámicamente
     *
     * @private
     * @memberof RUPComponent
     */
    private loadComponent() {
        // Cargamos el componente
        const component = RUPRegistry[this.elementoRUP.componente];
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component as any);
        const componentReference = this.viewContainerRef.createComponent(componentFactory);
        // Copia todas las propiedades
        componentReference.instance['prestacion'] = this.prestacion;
        componentReference.instance['registro'] = this.registro;
        componentReference.instance['elementoRUP'] = this.elementoRUP;
        componentReference.instance['soloValores'] = this.soloValores;
        componentReference.instance['paciente'] = this.paciente;
        componentReference.instance['params'] = this.params;
        // Event bubbling
        componentReference.instance['change'].subscribe(value => {
            this.emitChange(false);
        });
        // Inicia el detector de cambios
        componentReference.changeDetectorRef.detectChanges();
    }

    // Constructor
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef, // Referencia al padre del componente que queremos cargar
        protected conceptObserverService: ConceptObserverService,
        public elementosRUPService: ElementosRUPService,
        public prestacionesService: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public auth: Auth,
        public serviceProfesional: ProfesionalService,
        public adjuntosService: AdjuntosService
    ) { }

    ngOnInit() {
        this.loadComponent();
    }

    /**
     * Emite el evento change con los nuevos datos de registro
     *
     * @protected
     * @memberof RUPComponent
     */
    public emitChange(notifyObservers = true) {
        /**
        llamas a la funcion getMensajes y setea el objeto mensaje
        para devolver el valor a los atomos,moleculas, formulas, etc
        */
        this.mensaje = this.getMensajes();
        // Notifica a todos los components que estén suscriptos con este concepto
        if (notifyObservers) {
            this.conceptObserverService.notify(this.registro.concepto, this.registro);
        }
        // Notifica al componente padre del cambio
        this.change.emit(this.registro);
    }

    /**
    * Devuelve los mensajes de los atomos, moleculas, formulas, etc.
    *
    * @protected
    * @memberof RUPComponent
    */
    public getMensajes() { }
}
