import { Auth } from '@andes/auth';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, ViewContainerRef, ComponentFactoryResolver, Output, Input, OnInit, OnDestroy, EventEmitter, ViewEncapsulation, QueryList, ViewChildren, ViewChild, ElementRef, Renderer, AfterViewInit } from '@angular/core';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { AdjuntosService } from '../../services/adjuntos.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SnomedService } from '../../../../apps/mitos';
import { OcupacionService } from '../../../../services/ocupacion/ocupacion.service';
import { FinanciadorService } from '../../../../services/financiador.service';
import { ProcedimientosQuirurgicosService } from '../../../../services/procedimientosQuirurgicos.service';
import { Cie10Service } from '../../../../apps/mitos/services/cie10.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { ElementosRUPRegister } from '../elementos';
import { ActivatedRoute } from '@angular/router';
import { ReglaService } from '../../../../services/top/reglas.service';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { PlantillasService } from '../../services/plantillas.service';

@Component({
    selector: 'rup',
    encapsulation: ViewEncapsulation.None,
    template: ''
})
export class RUPComponent implements OnInit, AfterViewInit {
    @ViewChildren(RUPComponent) rupElements: QueryList<RUPComponent>;
    @ViewChild('form', { static: false }) formulario: any;
    public rupInstance: any;

    // Propiedades
    @Input() elementoRUP: IElementoRUP;
    @Input() prestacion: IPrestacion;
    @Input() registro: IPrestacionRegistro;
    @Input() paciente: IPaciente;
    @Input() soloValores: boolean;
    @Input() vistaHUDS = false;
    @Input() params: any;
    @Input() opcionales: any;
    public mensaje: any = {};

    // Eventos
    @Output() change: EventEmitter<any> = new EventEmitter<any>();

    @Output() ejecutarAccion: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Carga un componente dinámicamente
     *
     * @private
     * @memberof RUPComponent
     */
    private loadComponent() {
        if (this.registro && !this.registro.privacy) {
            setTimeout(() => {
                if (this.params && this.params.privacy) {
                    this.registro.privacy = { scope: this.params.privacy };
                } else {
                    this.registro.privacy = { scope: 'public' };
                }
            }, 0);
        }

        // Cargamos el componente
        const component = ElementosRUPRegister.get(this.elementoRUP.componente).component;
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component as any);
        const componentReference = this.viewContainerRef.createComponent(componentFactory);

        // Copia todas las propiedades
        componentReference.instance['prestacion'] = this.prestacion;
        componentReference.instance['registro'] = this.registro;
        componentReference.instance['elementoRUP'] = this.elementoRUP;
        componentReference.instance['soloValores'] = this.soloValores;
        componentReference.instance['vistaHUDS'] = this.vistaHUDS;
        componentReference.instance['paciente'] = this.paciente;
        componentReference.instance['params'] = this.params;
        componentReference.instance['opcionales'] = this.opcionales;

        // Event bubbling
        componentReference.instance['change'].subscribe(value => {
            this.emitChange(false);
        });

        // Event bubbling
        componentReference.instance['ejecutarAccion'].subscribe((value, datos) => {
            this.emitEjecutarAccion(value, datos);
        });

        // Inicia el detector de cambios
        componentReference.changeDetectorRef.detectChanges();

        this.rupInstance = componentReference.instance;
    }

    // Constructor
    constructor(
        private elemento: ElementRef,
        private renderer: Renderer,
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef, // Referencia al padre del componente que queremos cargar
        protected conceptObserverService: ConceptObserverService,
        public elementosRUPService: ElementosRUPService,
        public prestacionesService: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public auth: Auth,
        public ocupacionService: OcupacionService,
        public financiadorService: FinanciadorService,
        public serviceProfesional: ProfesionalService,
        public adjuntosService: AdjuntosService,
        public sanitazer: DomSanitizer,
        public snomedService: SnomedService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        public cie10Service: Cie10Service,
        public servicioOrganizacion: OrganizacionService,
        public plex: Plex,
        public route: ActivatedRoute,
        public agendaService: AgendaService,
        public organizacionservice: OrganizacionService,
        public servicioReglas: ReglaService,
        public conceptosTurneablesService: ConceptosTurneablesService,
        public plantillasService: PlantillasService
    ) {
    }

    ngOnInit() {
        this.loadComponent();
    }

    ngAfterViewInit() {
        // Hack momentaneo
        if (!this.soloValores) {
            this.renderer.invokeElementMethod(this.elemento.nativeElement, 'scrollIntoView');
        }
    }

    /**
     * Emite el evento change con los nuevos datos de registro
     *
     * @protected
     * @memberof RUPComponent
     */
    prepareEmit(notifyObservers = true) {
        /**
        llamas a la funcion getMensajes y setea el objeto mensaje
        para devolver el valor a los átomos, moléculas, fórmulas, etc
        */
        this.mensaje = this.getMensajes();
        // Notifica a todos los components que estén suscriptos con este concepto
        if (notifyObservers) {
            this.conceptObserverService.notify(this.registro.concepto, this.registro);
        }
    }

    /**
     * Emite el evento change con los nuevos datos de registro
     *
     * @protected
     * @memberof RUPComponent
     */
    public emitChange(notifyObservers = true) {
        this.prepareEmit();

        // Notifica al componente padre del cambio
        this.change.emit(this.registro);
    }

    public emitEjecutarAccion(evento, datos) {
        // this.prepareEmit();

        // Notifica al componente padre del cambio
        this.ejecutarAccion.emit({ evento, datos });
    }


    /**
    * Devuelve los mensajes de los atomos, moleculas, formulas, etc.
    *
    * @protected
    * @memberof RUPComponent
    */
    public getMensajes() { }

    /**
     *
     * @param fragment
     *
     * Simple utilidad para hacer foco automático sobre un registro RUP
     * Por ejemplo: en un Odontograma, al hacer click en un diente que tiene un registro relacionado, se hace scroll automático hacia el registro.
     *
     */
    jumpToId(fragment) {

        // Se usa un hashtag en el navegador para setear la ubicación dentro de la página
        window.location.hash = fragment;

        // Luego se hace un scroll automático hacia donde está seteada un ancla con el mismo nombre que el hashtag
        if (fragment) {
            const element = document.querySelector('[name="' + fragment + '"]');
            if (element) {
                element.scrollIntoView();
            }
        }
    }
    /**
    * valida los atomos, moleculas, formulas, etc.
    * Si existe un formulario en el elementoRIP, lo valida automaticamente, y si la misma tiene más elementosRUP
    * adentro ejecuta el validate en cada uno de sus hijos.
    *
    * Cada elementoRUP puede sobreescribir el metodo OnValidate para agregar validaciones especiales.
    *
    * @protected
    * @memberof RUPComponent
    */
    public validate() {
        const validChild = this.validateChild();
        const validForm = this.validateForm();
        const validateMain = this.onValidate();
        return validChild && validForm && validateMain;
    }

    public onValidate() {
        return true;
    }

    /**
     * Busca una referencia al formulario, y lo valida.
    */
    public validateForm() {
        if (this.formulario) {
            for (let key in this.formulario.controls) {
                let frm = this.formulario.controls[key];
                frm.markAsTouched();
                if (frm.validator) {
                    frm.validator({ value: frm.value });
                }
            }
        }
        return !this.formulario || !this.formulario.invalid;
    }

    /**
     * Busca todos los elementosRUP hijos y los valida.
    */
    public validateChild() {
        let flag = true;
        this.rupElements.forEach((item) => {
            const instance = item.rupInstance;
            const childValid = instance.validate();
            flag = flag && (instance.soloValores || childValid);
        });
        return flag;

    }

    get isValid() {
        if (this.rupInstance) {
            return !this.rupInstance.formulario || !this.rupInstance.formulario.touched || (!this.rupInstance.formulario.invalid);
        }
        return true;
    }

    checkEmpty() {
        const isEmptyValue = this.isEmpty();
        const isEmptyChild = this.rupElements.toArray().every((item) => {
            const instance = item.rupInstance;
            return instance.checkEmpty();
            // return (instance.registro as IPrestacionRegistro).isEmpty as boolean;
        });
        this.registro.isEmpty = isEmptyValue && isEmptyChild;
        return this.registro.isEmpty;
    }

    /**
     * Esta función puede ser override por el elementoRUP
     */
    isEmpty() {
        const hasValue = !!this.registro.valor;
        return !hasValue;
    }
}
