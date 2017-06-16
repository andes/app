import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { element } from 'protractor';

import { DropdownItem } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

// servicios
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

// interfaces
import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { IProfesional } from './../../../interfaces/IProfesional';

const limit = 10;
const skip = 0;

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    // styleUrls: ['prestacionEjecucion.css']

})

export class PrestacionEjecucionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    prestacion: IPrestacionPaciente;
    public listaProblemas: IProblemaPaciente[] = [];
    public problemaBuscar: String = '';
    public error: String = '';
    public tiposProblemas = [];
    public tipoProblema = null;
    public problemaTratar: any;
    public breadcrumbs: any;
    public cargarEnconsulta = false;


    // Filtro Problemas
    filtroEstado: String = '';
    filtros: String = 'filtroTodos';
    habilitaTransparencia: String = '';
    listaproblemasMaestro: any = [];
    search: String = '';

    searchProblema: String;
    buscarSnomed: Boolean = false;
    buscarProblema: String;
    isDraggingProblem = false;
    isDraggingPrestacion = false;
    isDraggingProblemList = false;
    isDraggingPlan = false;

    // Filtro Prestaciones
    filtrosPrestacion: String = '';
    nombrePrestacion: String = '';
    finScroll = false;
    tiposPrestaciones: ITipoPrestacion[] = [];
    searchPrestacion: String;

    // Busqueda planes
    searchPlanes: String;
    planes: ITipoPrestacion[] = []; // Todos los planes que encuentra en el metodo de busqueda..!
    PlanesSeleccionados: ITipoPrestacion[] = []; // Lista de planes que quedan seleccionados y listos para dragearse a los Problemas.
    // Se le va a poder agregar un texto en esta seccion.. Ver eso.
    isDraggingPlanSeleccion = false;

    items = [
        { label: 'Evolucionar Problema', handler: () => { this.evolucionarProblema(this.problemaItem); } },
        { label: 'Transformar Problema', handler: (() => { this.transformarProblema(this.problemaItem); }) },
        { label: 'Enmendar Problema', handler: (() => { this.enmendarProblema(this.problemaItem); }) },
    ];

    itemsEjecucion = [
        { label: 'Evolucionar Problema', handler: () => { this.evolucionarProblema(this.problemaItem); } },
        { label: 'Transformar Problema', handler: (() => { this.transformarProblema(this.problemaItem); }) },
        { label: 'Enmendar Problema', handler: (() => { this.enmendarProblema(this.problemaItem); }) },
    ];

    // problema principal (panel izquierdo)
    problemaItem: any;

    // problema en ejecución (panel central)
    problemaEjecucion: any;

    data: Object = {};

    showEvolucionar = false;
    showTransformar = false;
    showEnmendar = false;
    showEvolTodo = false;
    showNuevo = false;

    // variable que utilizamos para 'refrescar' el panel central de problemas
    // cuando tenemos algun cambio de evoluciones de prestaciones
    updateGeneral: Boolean = false;


    // PRESTACIONES EN EJECUCION
    // tipos de prestaciones posibles a ejecutar durante la prestacion
    // este tipo de prestaciones se le van quitando opciones a medida que ejecuto una nueva
    tiposPrestacionesPosibles: ITipoPrestacion[] = [];
    // prestaciones que se ejecutan por defecto con la prestacion de origen
    prestacionesEjecucion = [];  // tambien almacenamos las que vamos agregando en la ejecucion de la prestacion de origen
    listaProblemaPrestacion = []; // lista de problemas posibles en la ejecucion/evolucion de las prestaciones
    idPrestacionesEjecutadas = []; // id que se van ejecutando
    nuevoTipoPrestacion: ITipoPrestacion;   // PRESTACIONES FUTURAS // utilizado para el select de tipos de prestaciones a ejecutar en un plan
    nuevaPrestacion: any;  // prestacion a pedir a futuro
    listaProblemasPlan: any = [];  // array de opcioens seleccionadas
    valoresPrestaciones: {}[] = []; // listado de prestaciones futuras a pedir en el plan
    // listado de problemas del paciente
    listaProblemasPaciente: any[] = [];
    listaProblemasPacienteCopy: any[] = [];

    // Funciones de planes
    motivoSolicitud: String;
    showMotivoSolicitud: boolean = false;
    planSelecionado: any;
    listaPlanesProblemas: any = []; // array de todos los planes que se van a mostrar vinculados a los problemas..


    todas: any[] = [];
    paraTodas = false;

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder) {
    }

    /**
     * Inicializamos prestacion a traves del id que viene como parametro de la url
     * Cargamos tipos de prestaciones posibles
     * Inicializamos los datos de la prestacion en caso que se hayan registardo
     * Cargamos los problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {

        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;

                // buscamos las prestaciones posibles a realizar
                this.serviceTipoPrestacion.getById(prestacion.solicitud.tipoPrestacion.id).subscribe(
                    tiposPrestaciones => {
                        if (!tiposPrestaciones) {
                            // TODO: definir que hacer en caso que no hayan
                            // prestaciones asignadas para registrar en la consulta
                        }

                        this.tiposPrestacionesPosibles = tiposPrestaciones.ejecucion;
                    },
                    err => {

                    }
                );

                this.listaPlanesProblemas.push(prestacion);

                this.cargarDatosPrestacion();
                this.cargarProblemasPaciente();
            }, (err) => {
                if (err) {
                    this.plex.info('danger', err, 'Error');
                    this.router.navigate(['/rup']);
                }
            });

        });
    }

    /**
     * Asignamos valores precargados de la prestacion
     * Asignamos problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    cargarDatosPrestacion() {
        this.listaProblemas = this.prestacion.ejecucion.listaProblemas;
        this.listaProblemasPaciente = this.prestacion.ejecucion.listaProblemas;

        /*
        // loopeamos las prestaciones que se deben cargar por defecto
        // y las inicializamos como una prestacion nueva a ejecutarse
        if (this.prestacion.solicitud) {
            this.prestacion.solicitud.tipoPrestacion.ejecucion.forEach(element => {
                // Verificamos si el tipo de prestacion no está dentro de las prestaciones
                // que se han ejecutado, y de ser así las creo vacias
                let find;
                if (this.prestacion.ejecucion && this.prestacion.ejecucion.prestaciones.length) {
                    find = this.prestacion.ejecucion.prestaciones.find(p => {
                        return p.solicitud.tipoPrestacion.id === element.id;
                    });
                }
                // si no esta en las ejecutadas entonces asignamos para ejecutar las que son por defecto
                if (!find) {
                    // asignamos valores a la nueva prestacion
                    find = this.crearPrestacionVacia(element);
                    this.prestacionesEjecucion.push(find);
                    this.valoresPrestaciones[element.key.toString()] = {};
                } else {
                    this.prestacionesEjecucion.push(find);
                    let key; key = element.key;
                    this.listaProblemaPrestacion[key] = find.solicitud.listaProblemas;
                }
            });
        }
        */

        // recorremos todas las que se han ejecutado y si no esta
        // dentro de las que cargamos anteriormente las agregamos
        this.prestacion.ejecucion.prestaciones.forEach(_prestacion => {

            if (_prestacion.estado[_prestacion.estado.length - 1].tipo !== 'desvinculada') {

                let find = this.prestacionesEjecucion.find(pe => {
                    return (_prestacion.solicitud.tipoPrestacion.id === pe.solicitud.tipoPrestacion.id);
                });

                if (!find) {
                    // this.idTiposPrestacionesEjecucion.push(_prestacion.solicitud.tipoPrestacion.id);
                    this.prestacionesEjecucion.push(_prestacion);
                    let key; key = _prestacion.solicitud.tipoPrestacion.key;
                    this.listaProblemaPrestacion[key] = _prestacion.ejecucion.listaProblemas;

                    // agregamos los valores de las prestaciones al data
                    if (_prestacion.ejecucion.evoluciones.length) {
                        this.data[key] = _prestacion.ejecucion.evoluciones[_prestacion.ejecucion.evoluciones.length - 1].valores[key];
                    }
                }
            }
        });
    }

    /**
     * Llamada a la API para cargar los problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    cargarProblemasPaciente() {
        this.servicioProblemaPac.get({ idPaciente: this.prestacion.paciente.id }).subscribe(lista => {
            if (lista) {
                this.listaProblemasPaciente = lista;
                // guardamos una copia de los pacientes para luego usar filtros por strings y no perder el original
                this.listaProblemasPacienteCopy = lista;
            }

        });
    }

    /**
     * Mostrar opciones al hacer click sobre el menu de
     * problemas para poder evolucionar / transformar / etc
     * Opciones posibles en variable -items-
     *
     * @param {any} problema
     * @param {number} indexProblema
     *
     * @memberof PrestacionEjecucionComponent
     */
    mostrarOpciones(problema, indexProblema: number) {
        if (indexProblema >= 0) {
            this.agregarAMenuHambuguesa(problema.id, indexProblema);
        }
        this.problemaItem = problema;
    }

    /* Problemas del paciente */
    arrastrandoProblema(dragging) {
        this.isDraggingProblem = dragging;
    }

    arrastrandoProblemaLista(dragging) {
        this.isDraggingProblemList = dragging;

    }

    /* Evento que se ejecuta cuando realizo el drop de una
     * prestación o un plan sobre un problema
     */
    onDrop(e: any, idProblema) {
        if (this.isDraggingPrestacion) {
            this.onPrestacionDrop(e, idProblema);
        } else {
            this.onPlanDrop(e, idProblema);
        }
    }

    // Drag and drop ng2
    onProblemaDrop(e: any) {
        // debugger;
        this.tipoProblema = e.dragData;
        if (!this.existeProblema(this.tipoProblema)) {
            this.showNuevo = true;
            this.cargarEnconsulta = false;
            this.problemaTratar = this.tipoProblema;
        } else {
            this.plex.alert('El problema ya existe para el paciente');
        }
    }

    // Agregamos prestación en todos los problemas
    onTodosProblemasDrop(prestacionEvent: any) {

        if (this.prestacion && this.prestacion.solicitud && this.prestacion.ejecucion.listaProblemas) {

            this.prestacion.ejecucion.listaProblemas.forEach(problema => {
                this.onPrestacionDrop(prestacionEvent, problema.id);
            });

        }
    }

    // Inicio - Filtro en Maestro de Problemas del Paciente
    buscarProblemasPaciente() {
        let search = this.buscarProblema;

        let listaProblemasPaciente = this.listaProblemasPacienteCopy;

        // buscamos los parecidos en la lista de problemas del paciente
        this.listaProblemasPaciente = listaProblemasPaciente.filter(item => {
            return (item.tipoProblema.term.toLowerCase().indexOf(search.toLowerCase()) !== -1);
        });

        if (!search) {
            // restauramos originales
            this.listaProblemasPaciente = this.listaProblemasPacienteCopy;

            // desactivamos búsqueda mediante snomed
            this.buscarSnomed = false;

        }
    }

    buscarProblemaSnomed() {
        // habilitamos para que vaya a buscar los problemas
        // al componente snomed-search y no busque por los
        // problemas activos del paciente
        this.buscarSnomed = true;
    }

    /**
     * Funcion para el template
     * Devuelve la cantidad de problemas según el estado
     * Se está utilizando en los filtros de problemas por estado
     *
     * @param {string} estado Tipo de estado a filtrar la lista de problemas
     * @returns {number} Cantidad de problemas segun estado
     *
     * @memberof PrestacionEjecucionComponent
     */
    getCantidProblemasByEstado(estado: string) {
        return this.listaProblemasPaciente.filter(problema => {
            return (problema.evoluciones[problema.evoluciones.length - 1].estado === estado);
        }).length;
    }
    // FILTROS MAESTRO DE PROBLEMAS

    /* Limpiamos el string del buscador de problemas
     * Vaciamos el array de resultados
     */
    limpiarBusqueda() {
        this.searchProblema = '';
        this.listaproblemasMaestro = [];
    }


    agregarAMenuHambuguesa(idProblema, indiceProblema) {
        let itemNuevo = { label: 'Desvincular Problema', icon: 'link-variant-off', handler: (() => { this.desvincularProblema(idProblema, indiceProblema); }) };
        this.itemsEjecucion = this.items;
        this.itemsEjecucion = [... this.itemsEjecucion, itemNuevo];
    }


    // FILTROS MAESTRO DE PROBLEMAS
    FiltroestadoTodos() {
        this.filtroEstado = '';
        this.filtros = 'filtroTodos';
    }
    FiltroestadoActivo() {
        this.filtroEstado = 'activo';
        this.filtros = 'filtroActivo';
    }
    FiltroestadoInactivo() {
        this.filtroEstado = 'inactivo';
        this.filtros = 'filtroInactivo';
    }

    FiltroestadoResuelto() {
        this.filtroEstado = 'resuelto';
        this.filtros = 'filtroResuelto';
    }

    // FUNCIONES PARA PROBLEMAS
    evolucionarProblema(problema) {
        this.showEvolucionar = true;
        delete problema.$order; // Se debe comentar luego de que funcione el plex select
        this.problemaTratar = problema;
    }

    transformarProblema(problema) {
        this.showTransformar = true;
        delete problema.$order; // Se debe comentar luego de que funcione el plex select
        this.problemaTratar = problema;
        this.listaProblemas = this.listaProblemas.filter(item => item.id !== problema.id);

    }

    enmendarProblema(problema) {
        this.showEnmendar = true;
        delete problema.$order; // Se debe comentar luego de que funcione el plex select
        this.problemaTratar = problema;
    }

    evolucionarTodo() {
        this.showEvolucionar = false;
        this.showEvolTodo = true;
    }

    onReturn(dato: IProblemaPaciente) {
        this.showEvolucionar = false;
        this.showEnmendar = false;

        if (dato) {
            this.cargarProblemasPaciente();
            this.servicioPrestacion.getById(this.prestacion.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });

            this.plex.toast('success', 'El problema fue evolucionado correctamente.', 'Información', 4000);
        }

    }

    onReturnTodos(datos: IProblemaPaciente[]) {
        this.showEvolucionar = false;
        this.showEvolTodo = false;
        if (datos) {
            this.cargarProblemasPaciente();
            this.servicioPrestacion.getById(this.prestacion.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });
            this.plex.toast('success', 'Los problemas fueron evolucionados correctamente.', 'Información', 4000);
        }
    }

    onReturnNvoProblema(idProblema: any) {

        this.showEvolucionar = false;
        this.showEnmendar = false;
        this.showNuevo = false;

        if (idProblema) {
            // Se arrastró al medio?
            if (this.cargarEnconsulta) {
                this.updateListaProblemas(idProblema);
            }
            this.cargarProblemasPaciente();
            this.plex.toast('success', 'Problema asociado a la prestación', 'Problema asociado.', 4000);
        }

    }

    onReturnTransformar(datos: IProblemaPaciente[]) {
        this.showTransformar = false;
        if (datos) {
            // asignamos el problema a la prestacion de origen
            this.listaProblemas = datos;
            this.prestacion.ejecucion.listaProblemas = datos;
            this.updateListaProblemas(datos);
        }
    }

    onReturnEnmendar(datos: IProblemaPaciente) {
        this.showEnmendar = false;
        if (datos) {
            this.listaProblemas = this.listaProblemas.filter(p => {
                return p.id !== datos.id;
            });
            this.prestacion.ejecucion.listaProblemas = this.listaProblemas;
            this.updateListaProblemas(this.listaProblemas);
        }

    }

    // FILTROS MAESTRO DE PROBLEMAS

    // lista de problemas
    existeProblema(tipoProblema: ITipoProblema) {
        // return this.listaProblemasPaciente.find(elem => elem.tipoProblema && elem.tipoProblema.term === tipoProblema.term);
        return this.listaProblemasPaciente.find(elem => elem.tipoProblema && elem.tipoProblema.term === tipoProblema.term);
    }

    existeProblemaConsulta(problema: IProblemaPaciente) {
        return this.prestacion.ejecucion.listaProblemas.find(elem => elem.id === problema.id);
    }


    eliminarProblema(problema: IProblemaPaciente) {
        this.plex.confirm('Está seguro que desea eliminar el problema: ' + problema.tipoProblema.term + ' de la consulta actual?').then(resultado => {
            if (resultado) {
            }
        });

    }

    /**
     * Desvincular un problema de la consulta actual
     *
     * @param {any} idProblema
     * @param {any} index
     *
     * @memberof PrestacionEjecucionComponent
     */
    desvincularProblema(idProblema, index) {

        this.plex.confirm('', '¿Desvincular Problema?').then((confirmar) => {
            if (confirmar === true) {
                const patch = {
                    op: 'desvincularProblema',
                    idProblema: idProblema
                };
                if (typeof this.prestacion.ejecucion.listaProblemas[index].id !== 'undefined') {
                    this.servicioPrestacion.patch(this.prestacion, patch).subscribe((result) => {
                        this.prestacion.ejecucion.listaProblemas.splice(index, 1);
                        this.prestacion.ejecucion.listaProblemas = [...this.prestacion.ejecucion.listaProblemas];
                    });
                } else {
                    this.prestacion.ejecucion.listaProblemas.splice(index, 1);
                    this.prestacion.ejecucion.listaProblemas = [...this.prestacion.ejecucion.listaProblemas];
                }

            }
        });
    }


    // Fin- Filtro en Maestro de Problemas del Paciente

    /* Planes */
    // Para planes
    arrastrandoPlan(dragging) {
        this.isDraggingPlan = dragging;
    }

    arrastrandoPlanSeleccion(dragging) {
        this.isDraggingPlanSeleccion = dragging;
    }

    onPlanSelecionDrop(e: any) {
        this.PlanesSeleccionados.push(e.dragData);

    }

    // Buscador de planes del paciente..
    buscarPlanes(e) {
        if (e.value) {

            let query = {
                nombre: e.value,
                turneable: true
            };

            this.serviceTipoPrestacion.get(query).debounceTime(1000).subscribe(listaPlanes => {
                this.planes = listaPlanes;
            });
        } else {
            this.planes = [];
        }
    }

    setearMotivoPlan(plan) {
        this.showMotivoSolicitud = true;
        this.planSelecionado = plan;
    }


    //   // Se verifica si se cargaron datos en la prestacion, para cargar una nueva evoluciones
    //   this.prestacionesEjecucion[pos - 1].ejecucion.evoluciones.push({ valores: { [e.dragData.key]: this.data[e.dragData.key] } });

    guardarUnPlanConMotivo() { // Boton guardar
        this.agregarPlanDePrestacionFutura(this.planSelecionado, this.motivoSolicitud);
        this.PlanesSeleccionados.push(this.planSelecionado);
        this.showMotivoSolicitud = false;
        this.plex.toast('success', 'El plan se cargo correctamente', 'Plan Cargado', 4000);
        this.searchPlanes = '';
        this.planes = [];
        this.motivoSolicitud = '';
    }

    cancelarUnPlanConMotivo() {
        this.showMotivoSolicitud = false;
        this.motivoSolicitud = '';
    }

    onPlanDrop(e: any, idProblema) {
        let planExistente = false;
        let cambios = {
            'op': 'listaProblemasSolicitud',
            'problema': idProblema
        };
        let prestacion = e.dragData;
        // Traigo la prestacion actualizada..
        this.servicioPrestacion.getById(e.dragData.id).subscribe(prestacionActual => {
            prestacion = prestacionActual;
            // Recorre la prestacion actual y se fija si el id del problema ya existe
            prestacion.solicitud.listaProblemas.forEach(unProblema => {
                if (unProblema.id === idProblema) {
                    planExistente = true;
                }
            });
            // si plan existe entonces muestro un alerta
            if (planExistente) {
                this.plex.alert('El plan ya esta asociado al problema');
            } else {
                this.servicioPrestacion.patch(prestacion, cambios).subscribe(prestacionActualizada => {
                    // buscamos la prestacion principal actualizada con los datos populados
                    this.route.params.subscribe(params => {
                        let id = params['id'];
                        // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
                        this.servicioPrestacion.getById(id).subscribe(prestacion => {
                            this.listaPlanesProblemas = [];
                            this.listaPlanesProblemas.push(prestacion);
                        });
                    });
                });
            }
        });


    }

    onPlanTodosLosProblemasDrop($event) { // Carga plan en todos los problemas
        if (this.prestacion && this.prestacion.solicitud && this.prestacion.ejecucion.listaProblemas) {
            this.prestacion.ejecucion.listaProblemas.forEach(problema => {
                this.onPlanDrop($event, problema.id);
            });
        }
    }

    // Prestaciones futuras / Plan
    // Busca los tipos de prestaciones que pueda pedir a futuro como plan
    buscarTipoPrestacion(event) {
        let query = {
            query: event.query,
            turneable: true
        };
        this.serviceTipoPrestacion.get(query).subscribe(event.callback);
    }

    // agregamos la prestacion al plan
    agregarPlanDePrestacionFutura(prestacionFutura, textoMotivoSolicitud) {
        // asignamos valores a la nueva prestacion
        this.nuevaPrestacion = {
            idPrestacionOrigen: this.prestacion.id,
            paciente: this.prestacion.paciente,
            solicitud: {
                motivoSolicitud: textoMotivoSolicitud,
                tipoPrestacion: prestacionFutura,
                fecha: new Date(),
                listaProblemas: [],
                // datos del profesional logueado
                profesional: {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                }
            },
            estado: {
                timestamp: Date(),
                tipo: 'pendiente',
                // datos del profesional logueado
                profesional: {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                }
            },
            ejecucion: {
                evoluciones: []
            }
        };
        // guardamos la nueva prestacion
        this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {
            this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);
            this.updatePrestacion();
        });

    }
    // Desvincula los planes - borra el id del problema en la prestacion futura
    desvincularPlan(prestacionFutura, idProblema) {
        let prestacionNombre = prestacionFutura.solicitud.tipoPrestacion.nombre;
        let idPrestacionFutura = prestacionFutura;

        this.plex.confirm('Prestación: ' + prestacionNombre, '¿Desvincular Plan?').then((confirmar) => {
            if (confirmar === true) {
                let idDesvincular = null;
                prestacionFutura.solicitud.listaProblemas.forEach(element => {
                    if (element.id === idProblema) {
                        idDesvincular = idProblema;
                    };
                });
                if (idDesvincular) {
                    const patch = { op: 'desvincularPlan', idProblema: idDesvincular };
                    // hace el patch sobre la prestacionFutura sacando el id del problema.
                    this.servicioPrestacion.patch(prestacionFutura, patch).subscribe((result) => {
                        // buscamos la prestacion principal actualizada con los datos populados
                        this.route.params.subscribe(params => {
                            let id = params['id'];
                            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
                            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                                this.listaPlanesProblemas = [];
                                this.listaPlanesProblemas = [... this.listaPlanesProblemas, prestacion];
                                this.plex.toast('success', 'Prestación desvinculada del problema', 'Plan desvinculado', 2000);
                            });
                        });
                    });
                }
            }
        });
    }

    // agregamos la prestacion al plan
    agregarPrestacionFutura() {

        if (this.nuevoTipoPrestacion) {
            // asignamos valores a la nueva prestacion
            this.nuevaPrestacion = {
                idPrestacionOrigen: this.prestacion.id,
                paciente: this.prestacion.paciente,
                solicitud: {
                    tipoPrestacion: this.nuevoTipoPrestacion,
                    fecha: new Date(),
                    listaProblemas: [],
                    // datos del profesional logueado
                    profesional: {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    }
                },
                estado: {
                    timestamp: Date(),
                    tipo: 'pendiente',
                    // datos del profesional logueado
                    profesional: {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    }
                },
                ejecucion: {
                    evoluciones: []
                }
            };

            // si he agregado algun problema a la nueva prestacion
            // entonces asigno su id a la prestacion a guardar
            if (this.listaProblemasPlan && this.listaProblemasPlan.length > 0) {
                // recorremos array de problemas y asignamos a la nueva prestacion
                this.listaProblemasPlan.forEach(problema => {
                    this.nuevaPrestacion.solicitud.listaProblemas.push(problema.id);
                });
            } else {
                // si no agrego ningun problema, entonces por defecto se le agregan todos
                this.nuevaPrestacion.solicitud.listaProblemas = this.listaProblemas;
            }

            // guardamos la nueva prestacion
            this.servicioPrestacion.post(this.nuevaPrestacion).subscribe(prestacionFutura => {
                if (prestacionFutura) {
                    // asignamos la prestacion nueva al array de prestaciones futuras
                    this.prestacion.prestacionesSolicitadas.push(prestacionFutura.id);
                    this.updatePrestacion();
                }
            });

            this.nuevoTipoPrestacion = null;
            this.listaProblemasPlan = [];
        } else {
            this.plex.alert('Debe seleccionar una prestación');
        }
    }

    // borramos la prestacion del plan
    borrarPrestacionFutura(index) {
        alert('Implementar');
    }



    // Inicio - FILTRO DE PRESTACIONES

    loadPrestacion(tipo) {

        let search = this.searchPrestacion;
        console.log(search);
        // si escribimos algo
        if (search) {
            // buscamos los parecidos en la lista de problemas del paciente
            this.tiposPrestaciones = this.tiposPrestacionesPosibles.filter(item => {
                return (item.nombre.toLowerCase().indexOf(search.toLowerCase()) !== -1);
            });
        }

        // si escribimos algo y filtramos por tipo
        if (search && tipo) {
            this.tiposPrestaciones = this.tiposPrestaciones.filter(tp => tp.granularidad === tipo);
        }

        // si seleccionamos tipo pero no escribimos
        // if (tipo && !search) {
        //     this.tiposPrestaciones = this.tiposPrestacionesPosibles.filter(tp => tp.granularidad === tipo);
        // }

        // todos
        if (!search && !tipo) {
            // this.tiposPrestaciones = this.tiposPrestacionesPosibles;
            this.tiposPrestaciones = [];
        }
    }

    onHallazgoDrop(e: any) {
        let nuevoProblema;
        // Verifica si es un problema o un tipo Problema
        if ((e.dragData.tipoProblema || e.dragData.term)) {
            nuevoProblema = e.dragData;

            // si tiene -term- viene desde la lista de snomed
            // con lo cual no existe aun en la lista de problemas maestra del paciente
            if (e.dragData.term) {
                // Es un tipo de problema, se debe crear el problema y asociar a la prestacion
                this.tipoProblema = e.dragData;
                if (!this.existeProblema(this.tipoProblema)) {
                    // llama a la pantalla de nuevo problema
                    this.showNuevo = true;
                    this.cargarEnconsulta = true;
                    this.problemaTratar = this.tipoProblema;
                } else {
                    this.plex.alert('El problema ya existe para la consulta');

                }
            }
            // Se dropea desde la "lista de problemas del paciente" hacia los "hallazgos de la consulta"
            if (e.dragData.tipoProblema) {
                if (!this.existeProblemaConsulta(e.dragData)) {
                    this.updateListaProblemas(nuevoProblema);
                } else {
                    this.plex.alert('El problema ya existe para la consulta');
                }
            }
        }
    }

    arrastrandoPrestacion(dragging) {
        this.isDraggingPrestacion = dragging;
    }

    /**
     * Se ejecuta cuando hago el drop de un tipo de prestacion sobre un problema
     * @param e  Event que surje del drop. En e.dragData está la info de la prestacion
     * @param idProblema Problema al que vamos a vincular la prestacion creada
     * @returns Void
     */
    onPrestacionDrop(e: any, idProblema) {
        let showAlert: Boolean = false;
        //this.paraTodas = false;

        // Se verifica que sea un tipo de prestación
        // Se crea la nueva prestacion
        //this.agregarPrestacionEjecucion(e.dragData);

        let tipoPrestacion = e.dragData;

        //let prestacionCargada: IPrestacionPaciente;
        // verficiamos que no este previamente creada la prestacion
        let posicionPrestacion: any;

        // devolvemos la posicion del array en la que se encuentra
        posicionPrestacion = this.prestacionesEjecucion.findIndex(prestacion => (prestacion.solicitud.tipoPrestacion.id === tipoPrestacion.id));

        /*console.log(this.prestacionesEjecucion[posicionPrestacion].ejecucion.listaProblemas);
        alert(posicionPrestacion);*/
        if (posicionPrestacion < 0) {
            // asignamos valores a la nueva prestacion
            let nuevaPrestacion = {
                idPrestacionOrigen: this.prestacion.id,
                paciente: this.prestacion.paciente,
                solicitud: {
                    tipoPrestacion: tipoPrestacion,
                    fecha: new Date(),
                    listaProblemas: [],
                    profesional:
                    {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    }
                },
                estado: {
                    timestamp: new Date(),
                    tipo: 'ejecucion',
                    profesional:
                    {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    }
                },
                ejecucion: {
                    fecha: new Date(),
                    evoluciones: [],
                    listaProblemas: [
                        idProblema
                    ]
                }
            };

            // agregamos al array de prestaciones que se estan ejecutando
            this.prestacionesEjecucion = [...this.prestacionesEjecucion, nuevaPrestacion];

            showAlert = true;
        } else {

            // buscamos si existe el problema
            let posicionProblema = this.prestacionesEjecucion[posicionPrestacion].ejecucion.listaProblemas.findIndex(problema => (idProblema === problema || idProblema === problema.id));
            /*console.log(idProblema);
            console.log(this.prestacionesEjecucion[posicionPrestacion].ejecucion.listaProblemas);
            alert(idProblema + " / " + posicionProblema);*/

            if (posicionProblema === -1) {
                this.prestacionesEjecucion[posicionPrestacion].ejecucion.listaProblemas.push(idProblema);

                showAlert = true;
            } else {
                this.plex.toast('warning', 'La prestación ya esta asociada al problema');
            }

        }
        console.log(this.prestacionesEjecucion);
        if (showAlert) {
            this.plex.toast('success', 'Prestación vinculada al problema', 'Prestacion agregada', 4000);
        }
    }

    desvincularPrestacion(tipoPrestacion, problema, index, indexProblema) {
        alert(indexProblema);
        let prestacionNombre = tipoPrestacion.nombre;
        //console.log("pretacion:" , this.prestacionesEjecucion[index]);
        //console.log(this.data);
        this.plex.confirm('Prestación: ' + prestacionNombre, '¿Desvincular Prestación?').then((confirmar) => {
            /*
            if (confirmar === true) {
              const patch = {
                op: 'estadoPush',
                estado: 'desvinculada'
              };

              if (typeof this.prestacionesEjecucion[index].id !== 'undefined') {
                this.servicioPrestacion.patch(this.prestacionesEjecucion[index], patch).subscribe((result) => {
                  console.log('Prestación desvinculada, pasó a estado "desvinculada"', result);
                  this.prestacionesEjecucion.splice(index, 1);

                  console.log(this.data);
                  this.prestacionesEjecucion = [...this.prestacionesEjecucion];
                });
              } else {
                this.prestacionesEjecucion.splice(index, 1);
                this.prestacionesEjecucion = [...this.prestacionesEjecucion];
              }

            }
            */

            if (confirmar === true) {

                // buscamos el problema en la prestacion en el array ejecucion.listaProblemas
                //let indexProblema = this.prestacionesEjecucion[index].ejecucion.listaProblemas.findIndex(idProblema => (problema.id === idProblema));
                console.log("index problema", indexProblema);
                console.log("presta", this.prestacionesEjecucion[index].ejecucion.listaProblemas);

                // eliminamos el problema
                this.prestacionesEjecucion[index].ejecucion.listaProblemas.splice(indexProblema, 1);

                console.log("nueva prestacion", this.prestacionesEjecucion[index].ejecucion.listaProblemas);

                /*
                // verificamos en cuantos problemas esta la prestacion
                let cantidadProblemas = this.prestacionesEjecucion[index].ejecucion.listaProblemas.length;

                // si no hay ninguno, lo eliminamos del data para evitar valores raros
                if (cantidadProblemas === 0) {
                  //delete this.data[tipoPrestacion.key];
                }
                */

                // si existe la prestacion creada, y no está en ningun problema, realizamos patch
            }
        });
    }

    // Fin - FILTRO DE PRESTACIONES

    crearPrestacionVacia(tipoPrestacion) {
        // asignamos valores a la nueva prestacion
        let nuevaPrestacion = {
            idPrestacionOrigen: this.prestacion.id,
            paciente: this.prestacion.paciente,
            solicitud: {
                tipoPrestacion: tipoPrestacion,
                fecha: new Date(),
                listaProblemas: [],
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                }
            },
            estado: {
                timestamp: new Date(),
                tipo: 'ejecucion',
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                }
            },
            ejecucion: {
                fecha: new Date(),
                evoluciones: [],
                listaProblemas: []
            }
        };
        this.listaProblemaPrestacion[tipoPrestacion.key] = [];
        return nuevaPrestacion;
    }


    agregarPrestacionEjecucion(tipoPrestacion) {

        let nuevaPrestacion;
        nuevaPrestacion = this.crearPrestacionVacia(tipoPrestacion);
        /*
                // buscamos la posicion del array de la prestacion que acabamos
                // de agregar para luego quitarla / deshabilitarla del array de opciones
                let posicion = this.tiposPrestacionesPosibles.findIndex(tp => {
                    return tipoPrestacion.id === tp.id;
                });

                // quitamos del array de opciones
                this.tiposPrestacionesPosibles.splice(posicion, 1);
        */
        this.prestacionesEjecucion = [...this.prestacionesEjecucion, nuevaPrestacion];
    }

    /*
      * Event emmiter ejecutado cuando se devuelven valores
      * desde un átomo / molecula / fórmula desde RUP
      */
    getValoresRup(datos, tipoPrestacionActual) {
        // si esta seteado el valor en data, pero no tiene ninguna key con valores dentro
        // ej: data[signosVitales]: {}
        if (this.data[tipoPrestacionActual.key] && !Object.keys(datos).length) {
            // eliminamos la prestacion de data
            delete this.data[tipoPrestacionActual.key];
        } else {
            // si no está seteada la prestacion en data
            // entonces inicializamos el objeto vacío
            if (!this.data[tipoPrestacionActual.key]) {
                this.data[tipoPrestacionActual.key] = {};
            }

            // asignamos los valores que devuelve RUP en la variable datos
            // a nuestro array de valores data
            this.data[tipoPrestacionActual.key] = datos[tipoPrestacionActual.key];
        }

    }


    guardarPrestacion() {

        if (this.prestacion.ejecucion.listaProblemas.length > 0) {
            this.error = '';
            let i = 1;
            // obtenemos un array de la cantidad de prestaciones que se van a guardar
            let prestacionesGuardar = this.prestacionesEjecucion.filter(_p => {
                let tp; tp = _p.solicitud.tipoPrestacion;

                // verificamos si existe algun valor a devolver en data
                if (typeof this.data[tp.key] !== 'undefined') {
                    // si es un objeto, entonces verificamos que no este vacia ninguna
                    // de sus propiedades, y retornamos la prestacion
                    if (typeof this.data[tp.key] === 'object') {
                        return (Object.keys(this.data[tp.key]).length) ? _p : null;
                    } else {
                        // retornamos si es numero, texto, algo distinto de 'undefined'
                        return _p;
                    }
                }
                // no se cumple ninguna condicion retornamos null
                return null;
            });

            if (prestacionesGuardar.length === 0) {
                this.error = 'Debe registrar al menos un dato observable.';
            } else {
                this.error = '';
                // recorremos todas las prestaciones que hemos ejecutado
                prestacionesGuardar.forEach(_prestacion => {
                    let prestacion; prestacion = _prestacion;
                    let tp; tp = _prestacion.solicitud.tipoPrestacion;


                    // validamos que la evolucion tenga valores distintos y distintos problemas
                    // y asi determinamos que han habido cambios en la prestacion ejecutada
                    let push = true;

                    // hay evoluciones ?
                    if (prestacion.ejecucion.evoluciones.length) {
                        // agregamos el valor solo si no ha cambiado de la evolucion anterior
                        let ultimaEvolucion = prestacion.ejecucion.evoluciones[prestacion.ejecucion.evoluciones.length - 1].valores;

                        let valorActual = {};
                        valorActual[tp.key] = this.data[tp.key];

                        // comparamos, si da igual no agregamos
                        if (ultimaEvolucion && JSON.stringify(ultimaEvolucion) === JSON.stringify(valorActual)) {
                            push = false;
                        }
                    }

                    if (push) {
                        // agregamos
                        prestacion.ejecucion.evoluciones.push({ valores: { [tp.key]: this.data[tp.key] } });
                    }

                    /*
                    // si he agregado algun problema a la nueva prestacion, asigno su id a la prestacion a guardar
                    if (this.listaProblemaPrestacion[tp.key] && this.listaProblemaPrestacion[tp.key].length > 0) {
                        // recorremos array de problemas y los asignamos a la nueva prestacion
                        this.listaProblemaPrestacion[tp.key].forEach(problema => {
                            let find; // Verifico que no se repitan los problemas a vincular a la solicitud de la prestación
                            find = prestacion.solicitud.listaProblemas.find(p => {
                                return p.id === problema.id;
                            });
                            if (!find) {
                                prestacion.solicitud.listaProblemas.push(problema.id);
                            }
                        });
                    } else {
                        // si no agrego ningun problema, entonces por defecto se le agregan todos
                        // this.listaProblemas.forEach(idProblema => {
                        //   prestacion.solicitud.listaProblemas.push(idProblema);
                        // });
                    }
                    */

                    /*
                    if (_prestacion.ejecucion.evoluciones.length < 1) {
                        alert('No hay evoluciones');
                    }
                    */

                    // si la prestacion fué creada y no está vinculada a ningun problema
                    // entonces la guardamos como desvinculada
                    if (!_prestacion.ejecucion.listaProblemas.length) {
                        /*
                        const patch = {
                            op: 'estadoPush',
                            estado: {
                                tipo: 'desvinculada',
                                timestamp: new Date(),
                                profesional: { // TODO: Consultar si está ok!
                                    id: this.auth.profesional.id,
                                    nombre: this.auth.usuario.nombre,
                                    apellido: this.auth.usuario.apellido,
                                    documento: this.auth.usuario.documento
                                }
                            }
                        };

                        this.servicioPrestacion.patch(_prestacion, patch).subscribe((result) => {
                        });
                        */
                        _prestacion.estado.push({
                            tipo: 'desvinculada',
                            timestamp: new Date(),
                            profesional: { // TODO: Consultar si está ok!
                                id: this.auth.profesional.id,
                                nombre: this.auth.usuario.nombre,
                                apellido: this.auth.usuario.apellido,
                                documento: this.auth.usuario.documento
                            }
                        });
                    }


                    let method = (_prestacion.id) ? this.servicioPrestacion.put(_prestacion) : this.servicioPrestacion.post(_prestacion);

                    // guardamos la nueva prestacion
                    method.subscribe(prestacionEjecutada => {
                        // asignamos la prestacion nueva al array de prestaciones ejecutadas
                        let find;
                        if (this.prestacion.ejecucion.prestaciones && this.prestacion.ejecucion.prestaciones.length) {
                            find = this.prestacion.ejecucion.prestaciones.find(p => {
                                return p.id === prestacionEjecutada.id;
                            });
                        }

                        // si no esta, la agregamos
                        if (!find) {
                            let id; id = prestacionEjecutada.id;
                            this.prestacion.ejecucion.prestaciones.push(id);
                        }

                        // actualizamos la prestacion que estamos loopeando con los datos recien guardados
                        if (i === prestacionesGuardar.length) {
                            this.plex.alert('Prestacion confirmada');
                            this.updatePrestacion();
                            this.validarPrestacion();
                        }
                        i++;
                    }); // guardamos la nueva prestacion

                }); // prestacionesGuardar.forEach
            }; // else Datos observables
        } else {
            this.error = 'Debe seleccionar al menos un problema';
        }; // else problemas
    }


    // Fin prestaciones futuras / Plan

    /* Actualizamos la prestacion global y buscamos
     * los resultados nuevamente con toda la info populada
     */
    updatePrestacion() {
        // actualizamos la prestacion de origen
        this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {
            // buscamos la prestacion actualizada con los datos populados
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });
        });
    }

    /**
     * Agregamos un problema al array de ejecucion de la prestacion
     *
     * @param {any} problemaid Id del problemaa agregar
     *
     * @memberof PrestacionEjecucionComponent
     */
    updateListaProblemas(problemaid) {

        let cambios = {
            'op': 'listaProblemas',
            'problema': problemaid
        };

        this.servicioPrestacion.patch(this.prestacion, cambios).subscribe(prestacionActualizada => {
            // No devuelve la prestacion actualizada pero si la graba en mongo el patch
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });
        });
    }

    validarPrestacion() {
        this.router.navigate(['rup/validacion', this.prestacion.id]);
    }

    volver(ruta) {
        //valida si quedaron datos sin guardar..
        if (this.prestacionesEjecucion.length > 0 || this.tiposPrestaciones.length > 0) {
            this.plex.confirm('Se van a descartar los cambios sin guardar', 'Atención').then((confirmar) => {
                if (confirmar === true) {
                    this.router.navigate(['rup/resumen', this.prestacion.id]);
                }
            });
        } else {
            this.router.navigate(['rup/resumen', this.prestacion.id]);
        }
    }
}
