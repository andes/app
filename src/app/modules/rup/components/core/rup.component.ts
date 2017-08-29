import { Component, ViewContainerRef, ComponentFactoryResolver, Output, Input, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ComponentRegistry } from './component-registry.class';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IElementoRUP } from './../../interfaces/elemento-rup.interface';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';

// [Andrrr] 2107-02-07: Hay que esperar a un nuevo release de Angular para poder cargarlos dinámicamente
// import { RUP_ELEMENTS } from '../../../app.module';

@Component({
    selector: 'rup',
    templateUrl: 'rup.html'
})
export class RUPComponent implements OnInit {
    // Propiedades
    @Input() elementoRUP: IElementoRUP;
    @Input() prestacion: IPrestacion;
    @Input() registro: IPrestacionRegistro;

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
        const component = ComponentRegistry.get(this.elementoRUP.componente);
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component as any);
        const componentReference = this.viewContainerRef.createComponent(componentFactory);
        // Copia todas las propiedades
        componentReference.instance['prestacion'] = this.prestacion;
        componentReference.instance['registro'] = this.registro;
        componentReference.instance['elementoRUP'] = this.elementoRUP;
        // Event bubbling
        componentReference.instance['change'].subscribe(e => {
            this.emitChange();
        });
        // Inicia el detector de cambios
        componentReference.changeDetectorRef.detectChanges();
    }

    /**
     * Emite el evento change con los nuevos datos de registro
     *
     * @protected
     * @memberof RUPComponent
     */
    protected emitChange(notifyObservers = true) {
        // Notifica a todos los components que estén suscriptos con este concepto
        if (notifyObservers) {
            this.conceptObserverService.notify(this.registro.concepto, this.registro);
        }
        // Notifica al componente padre del cambio
        this.change.emit(this.registro);
    }

    // Constructor
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef, // Referencia al padre del componente que queremos cargar
        protected conceptObserverService: ConceptObserverService,
        public elementosRUPService: ElementosRUPService,
    ) { }

    ngOnInit() {
        this.loadComponent();
    }
}
