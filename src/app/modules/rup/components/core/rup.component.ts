import { Auth } from '@andes/auth';
import { Plex, PlexVisualizadorService } from '@andes/plex';
import { calcularEdad } from '@andes/shared';
import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Optional, Output, QueryList, SimpleChanges, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Engine } from 'json-rules-engine';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { DriveService } from 'src/app/services/drive.service';
import { SnomedService } from '../../../../apps/mitos';
import { Cie10Service } from '../../../../apps/mitos/services/cie10.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { FinanciadorService } from '../../../../services/financiador.service';
import { OcupacionService } from '../../../../services/ocupacion/ocupacion.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { ProcedimientosQuirurgicosService } from '../../../../services/procedimientosQuirurgicos.service';
import { ReglaService } from '../../../../services/top/reglas.service';
import { VacunasService } from '../../../../services/vacunas.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { AdjuntosService } from '../../services/adjuntos.service';
import { RupEjecucionService } from '../../services/ejecucion.service';
import { PlantillasService } from '../../services/plantillas.service';
import { ElementosRUPRegister } from '../elementos';
import { ConstantesService } from './../../../../services/constantes.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { IElementoRUP, IElementoRUPRequeridos } from './../../interfaces/elementoRUP.interface';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { PrestacionesService } from './../../services/prestaciones.service';

@Component({
    selector: 'rup',
    encapsulation: ViewEncapsulation.None,
    template: ''
})
export class RUPComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
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
    @Input() style: any;
    @Input() habilitado: any;
    @Input() public conceptosAsociados: any = [];

    public mensaje: any = {};

    private rulesEngine: Engine;
    private rulesEvent = new Subject<{ type: string; params: any }>();
    private rulesEvent$ = this.rulesEvent.asObservable();

    /**
     * Determina si un elemento RUP es valido. Se setea apartir de reglas.
     */

    public _isValid = true;

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

        if (this.registro && !this.registro?.privacy) {
            setTimeout(() => {
                if (this.params?.privacy) {
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
        componentReference.instance['style'] = this.style;
        componentReference.instance['habilitado'] = this.habilitado;
        componentReference.instance['conceptosAsociados'] = this.conceptosAsociados || [];

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

        componentReference.instance['createEngine']();

        this.rupInstance = componentReference.instance;
    }

    // Constructor
    constructor(
        private elemento: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef, // Referencia al padre del componente que queremos cargar
        protected conceptObserverService: ConceptObserverService,
        public elementosRUPService: ElementosRUPService,
        public prestacionesService: PrestacionesService,
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
        public plantillasService: PlantillasService,
        public vacunasService: VacunasService,
        public driveService: DriveService,
        public pacienteService: PacienteService,
        public plexVisualizador: PlexVisualizadorService,
        public constantesService: ConstantesService,
        @Optional() public ejecucionService: RupEjecucionService
    ) {
    }

    ngOnInit() {
        this.loadComponent();
    }

    ngOnDestroy() {
        this.onDestroy();
        this.onDestroy$.next(null);
        this.onDestroy$.complete();

        if (this.rulesEngine) {
            (this.rulesEngine as any).removeAllListeners();
            this.rulesEngine.stop();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.rupInstance) {
            this.rupInstance['conceptosAsociados'] = changes.conceptosAsociados.currentValue[0] || [];
        }
    }

    ngAfterViewInit() {
        if (!this.soloValores) {
            const seccionElement = document.querySelectorAll('rup-seccionnado-component plex-panel div.collapse.show div.relacionado');
            if (seccionElement.length) {
                if (seccionElement.length > 1) {
                    seccionElement[seccionElement.length - 1].scrollIntoView();
                }
            } else {
                this.elemento.nativeElement.scrollIntoView();
            }
        }
    }


    /**
     * Emite el evento change con los nuevos datos de registro
     */
    public emitChange(notifyObservers = true) {
        this.mensaje = this.getMensajes();
        // Notifica a todos los components que estén suscriptos con este concepto
        if (notifyObservers) {
            this.conceptObserverService.notify(this.registro.concepto, this.registro);
        }

        // Notifica al componente padre del cambio
        this.change.emit(this.registro);
    }

    public emitEjecutarAccion(evento, datos) {
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
    * Si existe un formulario en el elementoRUP, lo valida automaticamente, y si la misma tiene más elementosRUP
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
        return validChild && validForm && validateMain && this._isValid;
    }

    /**
     * Reemplazar en los elementosRUP propios para ejecutar codigo al destruir el elemento
     */
    public onDestroy() { }

    public onValidate() {
        return true;
    }

    /**
     * Busca una referencia al formulario, y lo valida.
    */
    public validateForm(onlyRequired = false) {
        if (this.formulario) {
            for (const key in this.formulario.controls) {
                const frm = this.formulario.controls[key];
                if (frm.errors?.required || !onlyRequired) {
                    frm.markAsTouched();
                    if (frm.validator) {
                        frm.validator({ value: frm.value });
                    }
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
            return (!this.rupInstance.formulario || !this.rupInstance.formulario.touched || (!this.rupInstance.formulario.invalid)) && this.rupInstance.onValidate();
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

    /**
     * Costrasta los requeridos contra los registros para determinar exactamente sobre que iterar.
     */
    get requeridos() {
        const response = [];
        const requeridos = [...this.elementoRUP.requeridos].filter(r => this.checkSexRule(this.prestacion, r));
        for (let i = 0; i < this.registro.registros.length; i++) {
            const concepto = this.registro.registros[i].concepto;
            const requerido = requeridos[i];
            const elementoRUP = this.registro.registros[i].elementoRUP ? this.elementosRUPService.getById(this.registro.registros[i].elementoRUP) : null;
            if (requerido && requerido.concepto.conceptId === concepto.conceptId) {
                requerido.elementoRUP = elementoRUP || requerido.elementoRUP;
                response.push(requerido);
            }
        }
        return response;
    }

    private checkSexRule(prestacion: IPrestacion, requerido: IElementoRUPRequeridos) {
        const sexo = prestacion && prestacion.paciente && prestacion.paciente.sexo;
        const sexoFilter = requerido && requerido.sexo;
        return !sexo || !sexoFilter || sexo === sexoFilter;
    }



    createEngine() {
        if (this.elementoRUP.rules && this.paciente) {
            this.rulesEngine = new Engine([], { allowUndefinedFacts: true });

            this.rulesEngine.addFact('edad', calcularEdad(this.paciente.fechaNacimiento, 'y'));
            this.rulesEngine.addFact('meses', calcularEdad(this.paciente.fechaNacimiento, 'm'));
            this.rulesEngine.addFact('sexo', this.paciente.sexo);

            this.elementoRUP.rules.forEach(rule => {
                this.rulesEngine.addRule(rule);
            });

            this.rulesEngine.on('success', (event: any) => {
                if (event.type === 'validation') {
                    const valid = !!event.params?.value;
                    this._isValid = valid;
                }
                this.rulesEvent.next(event);
            });

            if (this.registro?.valor) {
                this.addFact('value', this.registro.valor);
            }
        }
    }

    public onDestroy$ = new Subject();

    addFact(name: string, valor: any) {
        if (this.rulesEngine) {
            this._isValid = true;
            this.rulesEngine.addFact(name, valor);
            this.runRules();
        }
    }

    runRules() {
        this.rulesEngine.run();
    }

    onRule(name?: string) {
        const pipes = this.rulesEvent$.pipe(
            takeUntil(this.onDestroy$)
        );
        if (name) {
            return pipes.pipe(
                filter(event => event.type === name)
            );
        }
        return pipes;
    }
}
