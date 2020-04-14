import { Component, OnInit, Output, EventEmitter, HostBinding, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { CamasService } from '../services/camas.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { FinanciadorService } from '../../../../services/financiador.service';
import { OcupacionService } from '../../../../services/ocupacion/ocupacion.service';
import { SnomedService } from '../../../mitos';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { ElementosRUPService } from '../../../../modules/rup/services/elementosRUP.service';
import { InternacionService } from '../services/internacion.service';
import { IPrestacionRegistro } from '../../../../modules/rup/interfaces/prestacion.registro.interface';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    templateUrl: 'ejecucionInternacion.html',
    styleUrls: [
        './../../../../modules/rup/components/ejecucion/prestacionValidacion.scss',
        './../../../../modules/rup/components/ejecucion/buscador.scss'
    ],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class EjecucionInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    @Output() evtCamaInternacion: EventEmitter<any> = new EventEmitter<any>();
    public mostrarValidacion = false;

    public ocupaciones = [];
    public obrasSociales = [];
    public situacionesLaborales = [];
    public nivelesInstruccion = [
        { id: 'primario completo', nombre: 'Primario completo' },
        { id: 'secundario completo', nombre: 'Secundario completo' },
        { id: 'terciario/universitario completo', nombre: 'Terciario/Universitario completo' }
    ];
    public origenHospitalizacion = [
        { id: 'ambulatorio', nombre: 'Ambulatorio' },
        { id: 'emergencia', nombre: 'Emergencia' },
        { id: 'consultorio externo', nombre: 'Consultorio externo' },
        { id: 'derivación', nombre: 'Derivación' }
    ];
    // Fecha seleccionada
    public fecha: Date = new Date();
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // prestacion actual en ejecucion
    public prestacion: any;
    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;
    public cama = null;

    public informeIngreso = {
        fechaIngreso: new Date(),
        horaIngreso: null,
        origen: null,
        ocupacionHabitual: null,
        obraSocial: null
    };
    public egreso = {
        conceptId: '58000006',
        term: 'alta del paciente',
        fsn: 'alta del paciente (procedimiento)',
        semanticTag: 'procedimiento'
    };

    public snomedPases = {
        'fsn': 'estadía de internación (hallazgo)',
        'semanticTag': 'procedimiento',
        'conceptId': '308540004',
        'term': 'estadía de internación',
        'refsetIds': []
    };

    public epicrisis = {
        'conceptId': '721919000',
        'term': 'epicrisis de enfermería',
        'fsn': 'epicrisis de enfermería (elemento de registro)',
        'semanticTag': 'elemento de registro'
    };

    public epicrisisEjecucion;

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private servicioPrestacion: PrestacionesService,
        public financiadorService: FinanciadorService,
        public ocupacionService: OcupacionService,
        public snomedService: SnomedService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService,
        public servicioInternacion: InternacionService,
        private location: Location) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.inicializar(id);
                }
            });

        });
    }

    inicializar(id) {
        // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
        this.servicioPrestacion.getById(id).subscribe(prestacion => {
            this.prestacion = prestacion;
            // Carga la información completa del paciente
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.paciente = paciente;
            });
            // recuperamos si tiene una epicrisis en ejecucion.
            this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id }).subscribe(prestacionExiste => {
                this.epicrisisEjecucion = prestacionExiste;
            });
            this.comprobarEgresoParaValidar();
        });
    }

    /**
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
        // this.router.navigate(['internacion/camas']);
    }

    comprobarEgresoParaValidar() {
        let registros = this.prestacion.ejecucion.registros;
        // nos fijamos si el concepto ya aparece en los registros
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.egreso.conceptId);

        if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada') {
            if (egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {
                this.mostrarValidacion = true;
            } else {
                this.mostrarValidacion = false;
            }
        } else {
            this.mostrarValidacion = false;
        }
    }


    desocuparCama() {
        let registros = this.prestacion.ejecucion.registros;
        // nos fijamos si el concepto ya aparece en los registros
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.egreso.conceptId);

        if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada' &&
            egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {

            this.servicioInternacion.liberarCama(this.prestacion.id, egresoExiste.valor.InformeEgreso.fechaEgreso).pipe(catchError(() => of(null))).subscribe(() => { });

        }
    }

    ejecutarConcepto(snomedConcept) {
        let registros = this.prestacion.ejecucion.registros;
        // nos fijamos si el concepto ya aparece en los registros
        let registoExiste = registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);
        // si estamos cargando un concepto para una transformación de hall
        if (registoExiste) {
            this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
            return false;
        }

    }

    cargarNuevoRegistro(snomedConcept, valor = null) {
        // Elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let esSolicitud = false;

        let elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept);
        nuevoRegistro['_id'] = nuevoRegistro.id;
        nuevoRegistro.valor = valor;
        // Agregamos al array de registros
        this.prestacion.ejecucion.registros.splice(this.prestacion.ejecucion.registros.length, 0, nuevoRegistro);
        // this.recuperaLosMasFrecuentes(snomedConcept, elementoRUP);
        return nuevoRegistro;
    }

    guardarPrestacion() {
        let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));

        let params: any = {
            op: 'registros',
            registros: registros
        };

        this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(() => {
            this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
            this.comprobarEgresoParaValidar();
            this.desocuparCama();
        });
    }

    validar() {

        this.plex.confirm('Luego de validar la prestación no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                let planes = [];
                this.servicioPrestacion.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.plex.toast('success', 'La prestación se validó correctamente', 'Información', 300);
                }, () => {
                    this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                });
            }
        });

    }

    romperValidacion() {
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                // guardamos una copia de la prestacion antes de romper la validacion.
                let prestacionCopia = JSON.parse(JSON.stringify(this.prestacion));
                // Agregamos el estado de la prestacion copiada.
                let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia.id };
                // Guardamos la prestacion copia
                this.servicioPrestacion.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {
                    let prestacionModificada = prestacionClonada;
                    // hacemos el patch y luego creamos los planes
                    let cambioEstado: any = {
                        op: 'romperValidacion',
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id }
                    };
                    // Vamos a cambiar el estado de la prestación a ejecucion
                    this.servicioPrestacion.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
                        this.prestacion = prestacion;

                        // this.router.navigate(['rup/ejecucion', this.prestacion.id]);
                    }, () => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                    });
                });
            }
        });
    }


    /**
     * Crea la prestacion de epicrisis, si existe recupera la epicrisis
     * creada anteriormente.
     * Nos rutea a la ejecucion de RUP.
     */
    generaEpicrisis() {
        if (!this.epicrisisEjecucion.length) {
            let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.prestacion.paciente, this.epicrisis, 'ejecucion', 'internacion');
            nuevaPrestacion.solicitud.prestacionOrigen = this.prestacion.id;
            this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                this.router.navigate(['rup/ejecucion', prestacion.id]);
            });
        } else {
            this.router.navigate(['rup/ejecucion', this.epicrisisEjecucion[0].id]);
        }
    }
}
