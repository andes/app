import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { Plex } from '@andes/plex';
import { DropdownItem } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IProfesional } from './../../../interfaces/IProfesional';
import { fromNowPipe } from './../../../utils/date';
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';

const limit = 10;
const skip = 0;

@Component({
  selector: 'rup-prestacionEjecucion',
  templateUrl: 'prestacionEjecucion.html',
  styles: [`
  div.scroll-list {
        overflow: auto;
        max-height: 70vh;
    }
    
    .drag-over-border {
        border: #ff525b dashed 2px;
    }
    
    .droppable.drag-target-border,
    .list-group>.list-group-item.drag-target-border,
    .drag-target-border {
        border: #00bfff dashed 2px;
    }
    
    .drag-handle {
        cursor: move;
    }
    
    .droppable {
        width: 100%;
        height: auto;
        border: 2px dashed #eee;
        padding: 10px 0;
        margin: 20px 0;
        text-align: center;
        text-transform: uppercase;
        color: #999999;
    }
    
    .msg-problema {
        border: 1px solid #ff9900;
        color: #ff9900;
        margin-bottom: 10px;
        padding: 10px;
    }
    
    small {
        color: grey;
        font-weight: 400;
        font-size: 0.85rem;
    }
    
    .linea-sup {
        border-top: 1px solid #ccc;
    }
    
    .gris {
        color: #999999;
    }
    
    .msg-problema i {
        color: #ff9900;
    }
    
    h5.box-title-principal {
        color: #00A8E0;
        font-weight: 350;
        padding-bottom: 5px;
    }
    
    h5.box-title-secundario {
        color: #00A8E0;
        font-weight: 350;
        padding-bottom: 5px;
        border-bottom: solid black 1px;
    }
    
    .btn-contextual {
        font-size: 1.5em;
        color: #AAAAAA;
        background-color: white;
        border-color: none;
        box-shadow: none;
        border: none;
    }
    
    .btn-group {
        margin: 10px 0;
    }
    
    .btn.btn-primary {
        margin-top: 0px;
    }
    
    .btn.btn-primary:hover {
        background-color: #002738;
    }
    
    .btn-primary.active {
        background-color: #002738;
    }
    
    .btn-evolucionartodos {
        margin-bottom: 5px;
    }
    
    .list-inline>.list-inline-item {
        margin-bottom: 10px;
    }
    
    .list-group>.list-group-item {
        border-color: #AAAAAA;
        border-radius: 0px;
    }
    
    .list-group-item:hover {
        background-color: #f9f9f9;
        border: solid 1px #00A8E0;
    }
    
    .list-group-item:active {
        background-color: #f5f5f5;
        border: solid 1px #AAAAAA;
    }
    
    .list-group-top {
        /*margin-top: 5px;*/
    }
    
    .dropdown-inline {
        display: inline-block;
    }
    /*Etiquetas*/
    
    .badge {
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 500;
        display: inline-block;
        margin-right: 15px;
    }
    
    .badge-danger {
        border: 1.5px solid #dd4b39;
        border-radius: 0px;
        background: transparent;
        color: #dd4b39;
    }
    
    .badge-success {
        border: 1.5px solid #8CC63F;
        border-radius: 0px;
        background: transparent;
        color: #8CC63F;
    }
    
    .badge-warning {
        border: 1.5px solid #ff8d22;
        border-radius: 0px;
        background: transparent;
        color: #ff8d22;
    }
    
    .badge-info {
        border: 1.5px solid #00A8E0;
        border-radius: 0px;
        background: transparent;
        color: #00A8E0;
    }
    
    .transparencia {
        opacity: 0.4;
    }
    
    .fieldsetMargin-top {
        margin-top: 1px;
    }
    
    .results {
        margin-top: 0;
    }
    
    .results.list-group>.list-group-item {
        padding: 5px;
        cursor: -webkit-grab;
    }`
    ]
})

export class PrestacionEjecucionComponent implements OnInit {

  @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
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
  isDraggingProblem: Boolean = false;
  isDraggingPrestacion: Boolean = false;
  isDraggingProblemList: Boolean = false;
  isDraggingPlan: Boolean = false;

  // Filtro Prestaciones
  filtrosPrestacion: String = '';
  nombrePrestacion: String = '';
  finScroll: boolean = false;
  tiposPrestaciones: ITipoPrestacion[] = [];
  searchPrestacion: String;

  // Busqueda planes
  searchPlanes: String;
  planes: ITipoPrestacion[] = []; // Todos los planes que encuentra en el metodo de busqueda..!
  PlanesSeleccionados: ITipoPrestacion[] = []; // Lista de planes que quedan seleccionados y listos para dragearse a los Problemas.
  // Se le va a poder agregar un texto en esta seccion.. Ver eso.
  isDraggingPlanSeleccion: Boolean = false;

  items = [
    { label: 'Evolucionar Problema', handler: () => { this.evolucionarProblema(this.problemaItem); } },
    { label: 'Transformar Problema', handler: (() => { this.transformarProblema(this.problemaItem); }) },
    { label: 'Enmendar Problema', handler: (() => { this.enmendarProblema(this.problemaItem); }) },
    // { label: 'Ver Detalles', handler: (() => { this.verDetalles(this.problemaItem); }) },
  ];
  problemaItem: any;
  data: Object = {};

  showEvolucionar = false;
  showTransformar = false;
  showEnmendar = false;
  showEvolTodo = false;
  showNuevo = false;


  // PRESTACIONES EN EJECUCION
  // tipos de prestaciones posibles a ejecutar durante la prestacion
  // este tipo de prestaciones se le van quitando opciones a medida que ejecuto una nueva
  tiposPrestacionesPosibles: ITipoPrestacion[] = [];
  // prestaciones que se ejecutan por defecto con la prestacion de origen
  prestacionesEjecucion: IPrestacionPaciente[] = [];  // tambien almacenamos las que vamos agregando en la ejecucion de la prestacion de origen
  listaProblemaPrestacion = []; // lista de problemas posibles en la ejecucion/evolucion de las prestaciones
  idPrestacionesEjecutadas = []; // id que se van ejecutando
  nuevoTipoPrestacion: ITipoPrestacion;   // PRESTACIONES FUTURAS // utilizado para el select de tipos de prestaciones a ejecutar en un plan
  nuevaPrestacion: any;  // prestacion a pedir a futuro
  listaProblemasPlan: any = [];  // array de opcioens seleccionadas
  valoresPrestaciones: {}[] = []; // listado de prestaciones futuras a pedir en el plan
  // listado de problemas del paciente
  listaProblemasPaciente: any[] = [];


  constructor(private servicioPrestacion: PrestacionPacienteService,
    private serviceTipoPrestacion: TipoPrestacionService,
    private servicioTipoProblema: TipoProblemaService,
    private servicioProblemaPac: ProblemaPacienteService,
    public plex: Plex, public auth: Auth,
    private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder) {
  }

  mostrarOpciones(problema) {
    this.problemaItem = problema;
  }

  ngOnInit() {
    //  this.breadcrumbs = this.route.routeConfig.path;
    //     console.log('pantalla:', this.breadcrumbs);

    this.route.params.subscribe(params => {
      let id = params['id'];
      // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
      this.servicioPrestacion.getById(id).subscribe(prestacion => {
        this.prestacion = prestacion;
        this.cargarDatosPrestacion();
        this.cargarProblemasPaciente();
      });
      // obtenemos tipos de prestaciones posibles a ejecutarse
      this.serviceTipoPrestacion.get({}).subscribe(tiposPrestaciones => {
        this.tiposPrestacionesPosibles = tiposPrestaciones;
      });
    });
  }

  dropeado(e, string) {
    alert(string);
    console.log(e);
  }

  arrastrandoProblema(dragging) {
    this.isDraggingProblem = dragging;
  }

  arrastrandoProblemaLista(dragging) {
    this.isDraggingProblemList = dragging;

  }
  // Para planes
  arrastrandoPlan(dragging) {
    this.isDraggingPlan = dragging;
  }

  arrastrandoPrestacion(dragging) {
    this.isDraggingPrestacion = dragging;
  }

  arrastrandoPlanSeleccion(dragging) {
    this.isDraggingPlanSeleccion = dragging;
  }
  onPlanSelecionDrop(e: any) {
    this.PlanesSeleccionados.push(e.dragData);

  }

  buscarPrestacion(e) {
    if (e.value) {
      this.nombrePrestacion = e.value;
      this.loadPrestacion(this.filtrosPrestacion);
    } else {
      let parametros;
      parametros = {
        'granularidad': this.filtrosPrestacion,
        'autonoma': false,
        'skip': skip,
        'limit': limit,
      };
      this.serviceTipoPrestacion.get(parametros).subscribe(
        datos => {
          this.tiposPrestaciones = datos;
          this.finScroll = false;
        });
    }
  }

  // Inicio - Filtro en Maestro de Problemas del Paciente
  buscarProblemas(e) {
    this.habilitaTransparencia = 'inhabilitar';

    if (e.value) {
      this.habilitaTransparencia = 'habilitar';
      this.servicioTipoProblema.get({ nombre: e.value }).debounceTime(1000).subscribe(listaTipoProblemas => {
        this.listaproblemasMaestro = listaTipoProblemas;
      });

    } else {

      this.listaproblemasMaestro = [];
    }

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

  limpiarBusqueda() {
    this.searchProblema = '';
    this.listaproblemasMaestro = [];
  }
  // Fin- Filtro en Maestro de Problemas del Paciente



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


  onHallazgoDrop(e: any) {
    let nuevoProblema;
    // Verifica si es un problema o un tipo Problema
    if ((e.dragData.nombre || e.dragData.tipoProblema)) {
        nuevoProblema = e.dragData;

        if (e.dragData.nombre) {
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


  // agregamos prestacion en todos los problemas
  onTodosProblemasDrop(e: any) {
    if (this.prestacion && this.prestacion.solicitud && this.prestacion.ejecucion.listaProblemas) {
      this.prestacion.ejecucion.listaProblemas.forEach(problema => {
        this.onPrestacionDrop(e, problema.id);
      });
    }
  }

  onPrestacionDrop(e: any, idProblema) {

    // Se verifica que sea un tipo de prestacion
    // Se crea la nueva prestacion
    this.agregarPrestacionEjecucion(e.dragData);

    // listaProblemaPrestacion[_prestacion.solicitud.tipoPrestacion.key]
    // Se busca el problema y se vincula
    let problema = this.listaProblemasPaciente.find(elem => elem.id === idProblema);
    // Se vincula al problema
    let pos = this.prestacionesEjecucion.length;
    if (this.prestacionesEjecucion[pos - 1]) {
      this.prestacionesEjecucion[pos - 1].ejecucion.listaProblemas.push(problema);
    }

    // Se verifica si se cargaron datos en la prestacion, para cargar una nueva evoluciones
    this.prestacionesEjecucion[pos - 1].ejecucion.evoluciones.push({ valores: { [e.dragData.key]: this.data[e.dragData.key] } });

    // Se asocia la prestacion y el problema
    this.listaProblemaPrestacion[e.dragData.key].push(problema);
    this.plex.toast('success', 'Prestación vinculada al problema', 'Prestacion agregada', 5000);

  }

  onPlanDrop(e: any, idProblema) {
    console.log(e.dragData);
    console.log(idProblema);
  }

  //Mover la funcion luego!! 
  // agregamos la prestacion al plan
  agregarPlanDePrestacionFutura() {

    if (this.nuevoTipoPrestacion) {
      // asignamos valores a la nueva prestacion
      this.nuevaPrestacion = {
        idPrestacionOrigen: this.prestacion.id,
        paciente: this.prestacion.paciente,
        solicitud: {
          tipoPrestacion: this.nuevoTipoPrestacion,
          fecha: new Date(),
          listaProblemas: []
        },
        estado: {
          timestamp: Date(),
          tipo: 'pendiente'
        },
        ejecucion: {
          evoluciones: []
        }
      };
    }
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
  // FILTROS MAESTRO DE PROBLEMAS


  // Inicio - FILTRO DE PRESTACIONES

  loadPrestacion(prestacionFiltros) {
    let parametros;
    this.filtrosPrestacion = prestacionFiltros; // Se setea como activo el filtro en pantalla - [ngClass]="{active}"

    this.filtrosPrestacion = '';


    if (prestacionFiltros === 'todos') {
      parametros = {
        'nombre': this.nombrePrestacion,
        'autonoma': false,
        'skip': skip,
        'limit': limit,
      };
    } else {
      parametros = {
        'nombre': this.nombrePrestacion,
        'granularidad': prestacionFiltros,
        'autonoma': false,
        'skip': skip,
        'limit': limit,
      };
    }

    this.serviceTipoPrestacion.get(parametros).subscribe(
      datos => {
        this.tiposPrestaciones = datos;
        this.finScroll = false;
      });

  }
  // Fin - FILTRO DE PRESTACIONES


  loadTiposProblemas(event) {
    this.servicioTipoProblema.get({}).subscribe(event.callback);
  }

  // lista de problemas
  existeProblema(tipoProblema: ITipoProblema) {    
    return this.listaProblemasPaciente.find(elem => elem.tipoProblema && elem.tipoProblema.nombre === tipoProblema.nombre);
  }

  existeProblemaConsulta(problema: IProblemaPaciente) {
    return this.prestacion.ejecucion.listaProblemas.find(elem => elem.id === problema.id);
  }

  // guardarProblema(nuevoProblema, actualizarPrestacion?: boolean) {

  //   delete nuevoProblema.tipoProblema.$order; // Se debe comentar luego de que funcione el plex select (Error de Plex - $order)
  //   this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
  //     if (resultado) { // asignamos el problema a la prestacion de origen
  //       this.listaProblemasPaciente.push(resultado);
  //       //this.listaProblemas.push(resultado);
  //       if (actualizarPrestacion) {
  //         this.updateListaProblemas(resultado.id);
  //       }
  //       this.plex.toast('success', 'El problema fue asociado correctamente', 'Problema asociado', 4000);
  //     } else {
  //       this.plex.alert('Error al intentar asociar el problema a la consulta');
  //     }
  //   });
  // }

  eliminarProblema(problema: IProblemaPaciente) {
    this.plex.confirm('Está seguro que desea eliminar el problema: ' + problema.tipoProblema.nombre + ' de la consulta actual?').then(resultado => {
      if (resultado) {
      }
    });
  }

  // nuevoProblema(problema) {
  //   this.showNuevo = true;
  //   delete problema.$order; // Se debe comentar luego de que funcione el plex select
  //   this.problemaTratar = problema;

  // }

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

  // verDetalles(problema) {
  //   delete problema.$order; // Se debe comentar luego de que funcione el plex select
  //   this.problemaTratar = problema;
  // }

  evolucionarTodo() {
    this.showEvolucionar = false;
    this.showEvolTodo = true;
  }
  // Fin lista de problemas

  onReturn(dato: IProblemaPaciente) {
    this.showEvolucionar = false;
    this.showEnmendar = false;
  }

  onReturnNvoProblema(dato: any) {

     this.showEvolucionar = false;
     this.showEnmendar = false;
     this.showNuevo = false;

     if (dato) {
       if (this.cargarEnconsulta) {
          this.updateListaProblemas(dato);
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

  onReturnTodos(dato: IProblemaPaciente[]) {
    this.showEvolucionar = false;
    this.showEvolTodo = false;
  }

  cargarDatosPrestacion() {
    this.listaProblemas = this.prestacion.ejecucion.listaProblemas;
    this.listaProblemasPaciente = this.prestacion.ejecucion.listaProblemas;
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

    // recorremos todas las que se han ejecutado y si no esta
    // dentro de las que cargamos anteriormente las agregamos
    this.prestacion.ejecucion.prestaciones.forEach(_prestacion => {
      let find = this.prestacionesEjecucion.find(pe => {
        return _prestacion.solicitud.tipoPrestacion.id === pe.solicitud.tipoPrestacion.id;
      });

      if (!find) {
        // this.idTiposPrestacionesEjecucion.push(_prestacion.solicitud.tipoPrestacion.id);
        this.prestacionesEjecucion.push(_prestacion);
        let key; key = _prestacion.solicitud.tipoPrestacion.key;
        this.listaProblemaPrestacion[key] = _prestacion.ejecucion.listaProblemas;

        // let evolucion; evolucion = (_prestacion.ejecucion.evoluciones.length) ? _prestacion.ejecucion.evoluciones[find.ejecucion.evoluciones.length - 1].valores[key] : null;
      }
    });
  }

  crearPrestacionVacia(tipoPrestacion) {
    // asignamos valores a la nueva prestacion
    let nuevaPrestacion = {
      idPrestacionOrigen: this.prestacion.id,
      paciente: this.prestacion.paciente,
      solicitud: {
        tipoPrestacion: tipoPrestacion,
        fecha: new Date(),
        listaProblemas: []
      },
      estado: {
        timestamp: new Date(),
        tipo: 'ejecucion'
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

  cargarProblemasPaciente() {
    this.servicioProblemaPac.get({ idPaciente: this.prestacion.paciente.id }
    ).subscribe(lista => {
      if (lista) {
        this.listaProblemasPaciente = lista;
      }

    });
  }

  agregarPrestacionEjecucion(tipoPrestacion) {

    let nuevaPrestacion;
    nuevaPrestacion = this.crearPrestacionVacia(tipoPrestacion);

    // buscamos la posicion del array de la prestacion que acabamos
    // de agregar para luego quitarla / deshabilitarla del array de opciones
    let posicion = this.tiposPrestacionesPosibles.findIndex(tp => {
      return tipoPrestacion.id === tp.id;
    });

    // quitamos del array de opciones
    this.tiposPrestacionesPosibles.splice(posicion, 1);
    this.prestacionesEjecucion.push(nuevaPrestacion);
  }

  evolucionarPrestacion() {

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
          debugger;
          let prestacion; prestacion = _prestacion;
          let tp; tp = _prestacion.solicitud.tipoPrestacion;
          // Cargo el arreglo de prestaciones evoluciones
          prestacion.ejecucion.evoluciones.push({ valores: { [tp.key]: this.data[tp.key] } });

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

          let method = (_prestacion.id) ? this.servicioPrestacion.put(_prestacion) : this.servicioPrestacion.post(_prestacion);

          if (_prestacion.ejecucion.evoluciones.length < 1) {
            alert('No hay evoluciones');
          }
          debugger;
          // guardamos la nueva prestacion
          method.subscribe(prestacionEjecutada => {
            // asignamos la prestacion nueva al array de prestaciones ejecutadas
            let find;
            if (this.prestacion.ejecucion.prestaciones && this.prestacion.ejecucion.prestaciones.length) {
              find = this.prestacion.ejecucion.prestaciones.find(p => {
                return p.id === prestacionEjecutada.id;
              });
            }
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

  // listado de prestaciones a solicitar y ejecutar durante el transcurso de la prestacion
  getPosiblesPrestaciones() {
    //     this.serviceTipoPrestacion.get({ excluir: this.idTiposPrestacionesEjecucion }).subscribe(event.callback);
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
  agregarPrestacionFutura() {

    if (this.nuevoTipoPrestacion) {
      // asignamos valores a la nueva prestacion
      this.nuevaPrestacion = {
        idPrestacionOrigen: this.prestacion.id,
        paciente: this.prestacion.paciente,
        solicitud: {
          tipoPrestacion: this.nuevoTipoPrestacion,
          fecha: new Date(),
          listaProblemas: []
        },
        estado: {
          timestamp: Date(),
          tipo: 'pendiente'
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
  // Fin prestaciones futuras / Plan

  updatePrestacion() {
    // actualizamos la prestacion de origen
    this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {
      // buscamos la prestacion actualizada con los datos populados
      this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
        this.prestacion = prestacion;
      });
    });
  }

  updateListaProblemas(problemaid) {

      let cambios = {
        'op': 'listaProblemas',
        'problema': problemaid
      };

      this.servicioPrestacion.patch(this.prestacion, cambios).subscribe(prestacionActualizada => {
      //No devuelve la prestacion actualizada pero si la graba en mongo el patch
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                this.prestacion = prestacion;
          });
     });
  }

  validarPrestacion() {
    this.router.navigate(['rup/validacion', this.prestacion.id]);
  }

  onReturnComponent(datos, tipoPrestacionActual) {


    if (this.data[tipoPrestacionActual.key] && !Object.keys(datos).length) {
      delete this.data[tipoPrestacionActual.key];
    } else {
      if (!this.data[tipoPrestacionActual.key]) {
        this.data[tipoPrestacionActual.key] = {};
      }
      this.data[tipoPrestacionActual.key] = datos[tipoPrestacionActual.key];
    }
  }

  volver(ruta) {
    this.router.navigate(['rup/resumen', this.prestacion.id]);
  }
} // PrestacionEjecucionComponent
