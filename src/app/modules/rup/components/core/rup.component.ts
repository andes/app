import { AgendaService } from './../../../../services/turnos/agenda.service';
import { TurnoService } from './../../../../services/turnos/turno.service';
import { ProfesionalService } from './../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, ViewContainerRef, ComponentFactoryResolver, Output, Input, OnInit, OnDestroy, EventEmitter, ViewEncapsulation, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { RUPRegistry } from '../../../../app.module';
import { AdjuntosService } from '../../services/adjuntos.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SnomedService } from '../../../../services/term/snomed.service';
import { OcupacionService } from '../../../../services/ocupacion/ocupacion.service';
import { FinanciadorService } from '../../../../services/financiador.service';
import { ProcedimientosQuirurgicosService } from '../../../../services/procedimientosQuirurgicos.service';
import { Cie10Service } from '../../../../services/term/cie10.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'rup',
    styleUrls: [
        'rup.scss',
        // TODO: Crear package NPM con las fonts
        // '../../assets/font.css'
    ],
    encapsulation: ViewEncapsulation.None,
    template: '' // Debe quedar vacío, y cada atómo indicar que usa 'rup.html' o su propio template
})
export class RUPComponent implements OnInit {
    @ViewChildren(RUPComponent) rupElements: QueryList<RUPComponent>;
    @ViewChild('form') formulario: any;
    public rupInstance: any;

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

        this.rupInstance = componentReference.instance;
    }

    // Constructor
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef, // Referencia al padre del componente que queremos cargar
        protected conceptObserverService: ConceptObserverService,
        public elementosRUPService: ElementosRUPService,
        public prestacionesService: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public auth: Auth, public ocupacionService: OcupacionService,
        public financiadorService: FinanciadorService,
        public serviceProfesional: ProfesionalService,
        public adjuntosService: AdjuntosService,
        public sanitazer: DomSanitizer,
        public snomedService: SnomedService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        public Cie10Service: Cie10Service,
        public servicioOrganizacion: OrganizacionService,
        public route: ActivatedRoute,
        public agendaService: AgendaService
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
    /**
* valida los atomos, moleculas, formulas, etc.
* Si existe un formulario en el elementoRIP, lo valida automaticamente, y si la misma tiene más elementosRUP
* adentro ejecuta el validate en cada uno de sus hijos.
*
* Cada elementoRUP puede sobreescribir esta funcionalidad, implementando el metodo 'validate'.
*
* @protected
* @memberof RUPComponent
*/
    public validate() {
        return this.validateChild() && this.validateForm();
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
            let instance = item.rupInstance;
            flag = flag && (instance.soloValores || instance.validate());
        });
        return flag;

    }
}
