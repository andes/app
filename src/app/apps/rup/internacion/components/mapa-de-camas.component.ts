import { estados } from './../../../../utils/enumerados';
import { Component, OnInit, ViewEncapsulation, HostBinding, ɵConsole } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { InternacionService } from '../services/internacion.service';
import { IOrganizacion } from '../../../../interfaces/IOrganizacion';
import { IPacienteMatch } from '../../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { CamasService } from '../services/camas.service';
import { PacienteBuscarResultado } from '../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { ElementosRUPService } from '../../../../modules/rup/services/elementosRUP.service';
import * as enumerados from './../../../../utils/enumerados';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
// ../../../../services/internacion.service
@Component({
    selector: 'app-mapa-de-camas',
    templateUrl: './mapa-de-camas.component.html',
    styleUrls: ['./mapa-de-camas.component.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class MapaDeCamasComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    // listado de camas de la organizacion
    public camas: any[] = [];
    // copia de las camas
    public camasCopy = [];
    // estado de las camas de la organizacion
    public estadoServicio: any = {};
    // tipo de vista del mapa de camas
    // public layout: String = 'grid';
    public organizacion: IOrganizacion;
    public prestacion: any;
    public fecha = new Date;
    public hoy = new Date;
    public fechaDesde = new Date;
    public listaUnidadesOrganizativas = [];
    public copiaListaUnidadesOrganizativas = [];
    public listadoCamas = [];
    public fechaHasta = new Date;
    public loader = true;
    public showMenu = true;
    public historicoMode = false;
    public estadosMode = true;
    public filtroActive;
    public cantidadXEstado;
    public inactive = false;
    public camaSeleccionada;
    // Muestra el componente egreso en el sidebar
    public showEgreso = false;
    // Muesta/oculta el loader del sidebar
    public showLoaderSidebar = false;
    public isWorkflowCompleto = false;
    public showResumen = false;
    public prestacionPorInternacion;
    public enEspera;

    // Muestra el componente ingreso en el sidebar
    public showIngreso = false;
    public buscandoPaciente = false;
    public pacienteSelected;
    public camaSelected;
    public camaInternacion;
    public loadCountFiltros = false;
    public editarIngreso;
    public accion;
    public conceptosInternacion;
    public showEstados = true;
    public mostrarArbol = false;
    public accordionActive = 0;
    // filtros para el mapa de cama
    public filtros: any = {
        camas: null,
        habitacion: null,
        oxigeno: false,
        desinfectada: null,
        tipoCama: false,
        nombre: null,
        estado: null,
        servicio: null,
        sector: null,
        censable: null,
        opciones: {
            sectores: [],
            habitaciones: [],
            estados: [],
            servicios: [],
            tiposCamas: [],
            censo: []
        }
    };
    public arbol: any[] = [];
    public altaBajaCama = false;
    public panelIndex = 0;
    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;
    public historial: any[] = [];
    public inicioBusqueda = false;
    public createTemporal = false;
    public modoFlat = false;
    constructor(
        public servicioPrestacion: PrestacionesService,
        private auth: Auth,
        private plex: Plex,
        private router: Router,
        private servicioPaciente: PacienteService,

        public organizacionService: OrganizacionService,
        private internacionService: InternacionService,
        public camasService: CamasService,
        private elementoRupService: ElementosRUPService) {
    }

    ngOnInit() {
        if (!this.auth.check('internacion:mapaDeCamas')) {
            this.router.navigate(['./inicio' ]);
        }

        this.refresh();
        this.elementoRupService.ready.subscribe(() => {
            this.conceptosInternacion = this.elementoRupService.getConceptosInternacion();
        });
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/internacion/camas',
            name: 'Mapa de camas'
        }]);

        this.filtros.opciones.censo = enumerados.getObjCenso();
        this.isWorkflowCompleto = this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id);
        this.altaBajaCama = this.auth.getPermissions('internacion:cama:create?').length > 0 && this.auth.getPermissions('internacion:cama:baja?').length > 0;

    }
    refresh(event = null) {
        // Se setea ruta actual
        this.servicioPrestacion.notificaRuta({ nombre: 'Mapa de Camas', ruta: 'internacion/camas' });

        // verificar permisos
        // buscar camas para la organización
        this.limpiarFiltros();
        this.filtros.opciones.censo = enumerados.getObjCenso();
        this.loader = true;
        this.camasService.getCamasXFecha(this.auth.organizacion._id, this.fecha).subscribe(camas => {
            this.camas = camas;
            this.countFiltros();
            this.loader = false;
            if (camas) {
                this.camasService.getEstadoServicio(camas).subscribe(estado => {
                    this.estadoServicio = estado;
                });
                // creamos copia para reestablecer luego de los filtros
                this.camasCopy = JSON.parse(JSON.stringify(this.camas));
                // seteamos las opciones para los filtros del mapa de camas
                this.setOpcionesFiltros(camas);

            }

        }, (err) => {
            if (err) {
                let error = err.message ? err.message : err;
                this.plex.info('danger', error, 'Error');
                this.router.navigate(['/']);
            }
        });
    }

    public accordionSeleccionado(i) {
        if (this.accordionActive === i) {
            this.accordionActive = -1;
        } else {
            this.accordionActive = i;
        }
    }
    /**
     * Limpiamos los filtros del mapa de camas
     *
 * @memberof MapaDeCamasComponent
 */
    public limpiarFiltros() {
        this.arbol = [];
        this.filtroActive = '';
        this.filtros.habitacion = null;
        this.filtros.oxigeno = false;
        this.filtros.desinfectada = false;
        this.filtros.tipoCama = false;
        this.filtros.nombre = null;
        this.filtros.estado = null;
        this.filtros.servicio = null;
        this.filtros.sector = null;
        this.filtros.censable = null,
            this.filtros.opciones = {
                sectores: [],
                habitaciones: [],
                estados: [],
                servicios: [],
                tiposCamas: [],
                censo: []
            };


        this.camas = this.camasCopy;
    }

    /**
     * Creamos las opciones de los filtros en base a las características
     * que traigan las camas para armar el mapa de camas
     * @param {any} camas
     * @returns
     * @memberof MapaDeCamasComponent
     */
    public setOpcionesFiltros(camas: any) {
        if (!camas) {
            return;
        }

        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            // Filtros por sector
            this.filtros.opciones.sectores = this.organizacionService.getFlatTree(this.organizacion, false);

        });

        let existe;
        // asignamos los sectores para los filtros
        camas.forEach(cama => {

            existe = this.filtros.opciones.estados.find(estado => estado.id === cama.ultimoEstado.estado);
            if (cama.ultimoEstado && !existe) {
                this.filtros.opciones.estados.push({ 'id': cama.ultimoEstado.estado, 'nombre': cama.ultimoEstado.estado });
            }
            existe = this.filtros.opciones.servicios.find(servicio => servicio.id === cama.ultimoEstado.unidadOrganizativa.conceptId);
            if (cama.ultimoEstado.unidadOrganizativa && !existe) {
                this.filtros.opciones.servicios.push({ 'id': cama.ultimoEstado.unidadOrganizativa.conceptId, 'nombre': cama.ultimoEstado.unidadOrganizativa.term });
            }


            existe = this.filtros.opciones.tiposCamas.find(tipoCama => tipoCama.id === cama.tipoCama.conceptId);
            if (cama.tipoCama && !existe) {
                this.filtros.opciones.tiposCamas.push({ 'id': cama.tipoCama.conceptId, 'nombre': cama.tipoCama.term });
            }


            // TODO: Definir filtros para , oxigeno, etc.

            // ordenamos las opciones utilizando el desaconsejado metodo sort() :D
            if (this.filtros.opciones.estados) { this.filtros.opciones.estados.sort((a, b) => a.id - b.id); }
            if (this.filtros.opciones.servicios) { this.filtros.opciones.servicios.sort((a, b) => a.term - b.term); }
            if (this.filtros.opciones.tiposCamas) { this.filtros.opciones.tiposCamas.sort((a, b) => a.term - b.term); }
        });
        this.filtros.opciones.servicios.forEach(UO => {

            this.arbol.push({
                nombre: UO.nombre,
                hijos: this.camas.filter(c => c.ultimoEstado.unidadOrganizativa.conceptId === UO.id),

            });
        });
        if (this.arbol.length > 1) {
            this.mostrarArbol = true;
            this.arbol.sort(function (a, b) {
                let nombre1 = a.nombre;
                let nombre2 = b.nombre;
                return nombre1 > nombre2 ? 1 : -1;
            });
        }

    }
    /**
     * Aplicar filtros al mapa de camas
     *
     * @memberof MapaDeCamasComponent
     */
    public filtrar() {
        this.mostrarArbol = false;
        const regex_nombre = new RegExp('.*' + this.filtros.nombre + '.*', 'ig');
        let censable = this.filtros.censable ? this.filtros.censable.nombre === 'Censable' ? true : false : null;
        this.camas = this.camasCopy.filter((i) => {
            return (
                (!this.filtros.sector || (this.filtros.sector && i.sectores[0]._id === this.filtros.sector.id)) &&
                (!this.filtros.tipoCama || (this.filtros.tipoCama && i.tipoCama.conceptId === this.filtros.tipoCama.id)) &&
                (!this.filtros.estado || (this.filtros.estado && i.ultimoEstado.estado === this.filtros.estado.id)) &&
                (!this.filtros.servicio || !this.filtros.servicio || (this.filtros.servicio.id && i.ultimoEstado.unidadOrganizativa && i.ultimoEstado.unidadOrganizativa.conceptId === this.filtros.servicio.id)) &&
                (!this.filtros.censable || (this.filtros.censable && i.ultimoEstado.esCensable === censable)) &&
                (!this.filtros.nombre || (this.filtros.nombre && i.ultimoEstado && i.ultimoEstado.paciente && (regex_nombre.test(i.ultimoEstado.paciente.nombre) || (regex_nombre.test(i.ultimoEstado.paciente.apellido)) || (regex_nombre.test(i.ultimoEstado.paciente.documento)))))

            );
        });

        if (this.arbol.length > 1 && !this.filtros.nombre && !this.filtros.sector && !this.filtros.servicio && !this.filtros.tipoCama && !this.filtros.censable) {
            this.mostrarArbol = true;
        }


    }

    /**
     * Actualizar cama del array a mostrar en el mapa de camas
     * Metodo que se ejecuta luego que el EventEmitter de CamasComponent
     * devuelve la cama modificada
     * @param {any} e EventEmmiter result
     * @memberof MapaDeCamasComponent
     */
    public updateCama(e: any) {
        if (e) {
            if (e.iniciarInternacion) {
                this.cambiaTap(1);
                if (e.cama) {
                    let i = this.camas.findIndex(c => c.id === e.cama.id);
                    this.camas[i] = e.cama;
                    this.camaSeleccionada = e.cama;
                    this.prestacionDelPaciente(e.cama);
                }
                // Muestro el resumen de la internacion si viene de iniciarInternacion
            }
            if (e.desocupaCama) {
                // vamos a liberar la cama
                // this.prestacionDelPaciente(e.cama);
                let dto = {
                    fecha: e.egresoExiste.valor.InformeEgreso.fechaEgreso,
                    estado: this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id) ? 'desocupada' : 'disponible',
                    unidadOrganizativa: e.cama.ultimoEstado.unidadOrganizativa ? e.cama.ultimoEstado.unidadOrganizativa : null,
                    especialidades: e.cama.ultimoEstado.especialidades ? e.cama.ultimoEstado.especialidades : null,
                    esCensable: e.cama.ultimoEstado.esCensable,
                    genero: e.cama.ultimoEstado.genero ? e.cama.ultimoEstado.genero : null,
                    paciente: null,
                    idInternacion: null
                };
                this.camasService.cambiaEstado(e.cama.id, dto).subscribe(camaActualizada => {
                    e.cama.ultimoEstado = camaActualizada.ultimoEstado;
                    this.fecha = new Date();
                    this.refresh();
                    this.onCamaSelected(e);
                }, (err1) => {
                    this.plex.info('danger', 'Error al intentar desocupar la cama');
                });

                this.showIngreso = false;
                this.showEgreso = false;

            }

            if (e.movimientoCama) {
                if (e.camaDesocupada && e.camaOcupada) {
                    //  let copiaCamas = JSON.parse(JSON.stringify(this.camas));
                    let i = this.camas.findIndex(c => c.id === e.camaDesocupada.id);
                    let indexCambio = this.camas.findIndex(c => c.id === e.camaOcupada.id);
                    this.camas[i] = JSON.parse(JSON.stringify(e.camaDesocupada));
                    this.camas[indexCambio] = JSON.parse(JSON.stringify(e.camaOcupada));
                    this.camaSeleccionada = null;
                    this.camas = [...this.camas];
                }
            }
        } else {
            this.refresh();
        }
    }

    /**
     * Actualizar cama del array a mostrar en el mapa de camas
     * Metodo que se ejecuta luego que el EventEmitter de CamasComponent
     * devuelve la cama modificada
     * @param {any} dtoAccion EventEmmiter result
     * @memberof MapaDeCamasComponent
     */
    actualizarMapaDeCamas(dtoAccion) {
        switch (dtoAccion.accion) {
            case 'internarPaciente':
                if (dtoAccion.cama) {
                    if (dtoAccion.otroPaciente) {
                        this.accion = dtoAccion.accion;
                        this.pacientes = null;
                        this.showIngreso = false;
                    } else {
                        let i = this.camas.findIndex(c => c.id === dtoAccion.cama.id);
                        this.camas[i] = dtoAccion.cama;
                        this.camaSeleccionada = dtoAccion.cama;
                        this.showIngreso = false;
                        this.showEgreso = false;
                        this.pacienteSelected = null;
                        this.prestacionDelPaciente(dtoAccion.cama);
                        this.accion = null;
                    }
                }
                break;
            case 'movimientoCama':
                if (dtoAccion.cama) {
                    if (dtoAccion.camaOcupada) {
                        //  let copiaCamas = JSON.parse(JSON.stringify(this.camas));
                        let i = this.camas.findIndex(c => c.id === dtoAccion.cama.id);
                        let indexCambio = this.camas.findIndex(c => c.id === dtoAccion.camaOcupada.id);
                        this.camas[i] = JSON.parse(JSON.stringify(dtoAccion.cama));
                        this.camas[indexCambio] = JSON.parse(JSON.stringify(dtoAccion.camaOcupada));
                        this.camaSeleccionada = dtoAccion.camaOcupada;
                        this.camas = [...this.camas];
                        this.accion = null;
                        this.pacienteSelected = null;

                    } else {
                        let i = this.camas.findIndex(c => c.id === dtoAccion.cama.id);
                        this.camas[i] = JSON.parse(JSON.stringify(dtoAccion.cama));
                        this.camas = [...this.camas];
                        this.accion = null;
                        this.pacienteSelected = null;
                    }
                }
                break;
            case 'egresarPaciente':
                this.camaSeleccionada = dtoAccion.cama;
                // Busca una prestacion (internacion) asociada a la cama
                this.prestacionDelPaciente(dtoAccion.cama);
                // this.accion = null;
                //  this.pacienteSelected = null;
                this.showEgreso = true;
                this.showIngreso = false;
                this.buscandoPaciente = false;
                break;
            case 'bloquearCama':
                this.camaSeleccionada = dtoAccion.cama;
                this.accion = null;
                this.pacienteSelected = null;
                break;
            case 'cancelaAccion':
                this.camaSeleccionada = null;
                this.accion = null;
                this.pacienteSelected = false;
                break;
            case 'desbloqueoCama':
                this.camaSeleccionada = dtoAccion.cama;
                this.accion = null;
                this.pacienteSelected = null;
                break;
            case 'PrepararCama':
                this.camaSeleccionada = dtoAccion.cama;
                this.accion = null;
                this.pacienteSelected = false;
                break;

            case 'mostrarResumen':

                this.camaSeleccionada = dtoAccion.cama;
                this.showEgreso = true;
                this.accion = null;
                this.showIngreso = true;
                this.buscandoPaciente = false;
                this.pacienteSelected = true;
                this.prestacionDelPaciente(dtoAccion.cama);
                break;

        }
        this.fecha = new Date();
        if (!dtoAccion.otroPaciente) {
            this.refresh();
        }
        // this.countFiltros();


    }

    /**
     * Ir al ABM de camas
     */
    onGestionCamaClick() {
        this.router.navigate(['tm/organizacion/cama']);
    }

    verLI() {
        this.router.navigate(['rup/internacion/listado']);
    }

    verLE() {
        this.camasService.showListaEspera = true;
    }
    public ingresarPaciente() {
        this.camaSeleccionada = null;
        this.pacientes = null;
        this.accion = 'internarPaciente';
    }

    public censoDiario() {
        this.router.navigate(['rup/internacion/censo']);
    }

    public censoMensual() {
        this.router.navigate(['rup/internacion/censo/mensual']);
    }

    public verHistorico() {
        this.historicoMode = true;
    }

    /**
     * Check de los permisos para mostrar botones o datos.
     */

    checkAuth(permiso) {
        return this.auth.check('internacion:' + permiso);
    }

    onDarCama($event) {
        this.enEspera = $event;
        if ($event && $event.prestacion) {
            this.prestacion = $event.prestacion;
            this.prestacionPorInternacion = this.prestacion;
        } else {
            this.prestacion = $event;
            this.prestacionPorInternacion = this.prestacion;
        }
        if (this.prestacionPorInternacion) {
            this.servicioPaciente.getById(this.prestacionPorInternacion.paciente.id).subscribe(paciente => {
                this.pacienteSelected = paciente;
                this.accion = 'ocupar';
                this.showIngreso = false;
                // this.onPacienteSelected(this.pacienteSelected);
            });
        }
    }

    mapaDeCamaXFecha(reset) {
        if (reset) {
            this.historicoMode = false;
            this.fecha = new Date();
        }
        // this.showEstadosMet();
        this.refresh();
    }

    /**
     * filtra los estados de las camas
     * @param estado String del estado de la cama
     * @param darCama boolean para ver si viene de lista de espera.
     */
    filtroEstados(estado, darCama = false) {
        if (!darCama) {
            if (this.filtroActive === estado) {
                this.filtroActive = '';
                this.camas = this.camasCopy;
            } else {
                this.filtroActive = estado;
                if (estado === 'oxigeno') {
                    this.camas = this.camasCopy.filter(c => c.equipamiento.find(e => e.conceptId === '261746005'));
                } else {
                    let objEstado = {
                        nombre: estado,
                        id: estado
                    };
                    this.filtros.estado = objEstado;
                    this.filtrar();
                }
            }
        }
    }

    countFiltros() {
        if ((this.camas && this.camas.length > 0)) {
            this.cantidadXEstado = {
                ocupada: this.camas.filter(c => c.ultimoEstado.estado === 'ocupada'),
                desocupada: this.camas.filter(c => c.ultimoEstado.estado === 'desocupada'),
                reparacion: this.camas.filter(c => c.ultimoEstado.estado === 'reparacion'),
                bloqueada: this.camas.filter(c => c.ultimoEstado.estado === 'bloqueada'),
                oxigeno: this.camas.filter(c => c.equipamiento && c.equipamiento.find(e => e.conceptId === '261746005')),
                disponible: this.camas.filter(c => c.ultimoEstado.estado === 'disponible')
            };
        } else {
            this.cantidadXEstado = {
                ocupada: 0,
                desocupada: 0,
                reparacion: 0,
                bloqueada: 0,
                oxigeno: 0,
                disponible: 0
            };
        }
        this.loadCountFiltros = true;



    }

    /**
     * Captura el evento que emite el componente y cierra/oculta los mismos
     * @param event
     * @param param
     */
    cerrar(event, param) {
        switch (param) {
            case 'ingreso':
                this.showIngreso = event;
                break;
            case 'egreso':
                this.showEgreso = event;
                break;
            case 'resumen':
                this.showResumen = event;
                break;
            default:
                break;
        }
    }

    onPacienteCancel() {
        this.accion = null;
        this.camaSeleccionada = null;

        this.pacienteSelected = false;
    }

    onPacienteSelected(event) {
        this.accion = null;
        this.pacienteSelected = event;
        this.showIngreso = true;
        this.editarIngreso = false;
        this.prestacionPorInternacion = null; // BORRAR


    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    onCamaSelected(event) {
        if (!this.camaSeleccionada || this.camaSeleccionada !== event.cama) { // Es la primera vez o selecciono una cama diferente a la que estaba
            this.showEgreso = false;
            this.showIngreso = false;
            this.accion = event.accion;
            this.camaSelected = event.cama;
            this.camaSeleccionada = this.camaSelected;
            this.prestacionPorInternacion = null;
            this.prestacionDelPaciente(this.camaSeleccionada);
            this.pacientes = null;
            this.buscandoPaciente = false;
            this.pacienteSelected = true;

        } else { // Ya hay camas seleccionadas
            this.camaSeleccionada = null;
            this.accion = null;
            this.pacienteSelected = false;
            this.pacientes = null;
            this.showIngreso = false;
            this.showEgreso = false;
            if (event.accion !== 'mostrarResumen') {
                this.camaSelected = event.cama;
                this.camaSeleccionada = this.camaSelected;
                this.accion = event.accion;
            }
        }
        this.reseteaBusqueda();

    }


    prestacionDelPaciente(cama) {

        if (cama.ultimoEstado && cama.ultimoEstado.paciente) {
            this.servicioPrestacion.getById(cama.ultimoEstado.idInternacion).subscribe(prestacion => {
                this.prestacionPorInternacion = prestacion;

            });
        } else {
            this.prestacionPorInternacion = null;
        }
    }

    editar(event) {
        switch (event) {
            case 'ingreso':
                this.editarIngreso = true;
                break;
            case 'egreso':
                this.showEgreso = true;
                break;
            default:
                break;
        }
    }

    /**
     * Pasamos el numero del tap que queremos mostrar por defecto
     * @param value
     */
    public cambiaTap(value) {
        this.panelIndex = value;
    }


    /**
       * Crea la prestacion de epicrisis, si existe recupera la epicrisis
       * creada anteriormente.
       * Nos rutea a la ejecucion de RUP.
       */
    generaEpicrisis() {
        this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacionPorInternacion.id }).subscribe(prestacionExiste => {
            if (prestacionExiste.length === 0) {
                let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.prestacionPorInternacion.paciente, this.conceptosInternacion.epicrisis, 'ejecucion', 'internacion');
                nuevaPrestacion.solicitud.prestacionOrigen = this.prestacionPorInternacion.id;
                this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                    this.router.navigate(['rup/ejecucion', prestacion.id]);
                });
            } else {
                this.router.navigate(['rup/ejecucion', prestacionExiste[0].id]);
            }
        });
    }


    /**
     * Cambia a false la variable para ocultar el componente cuando se clickea boton cancelar
     * @public
     */
    cancelarInternacion() {
        this.buscandoPaciente = false;
    }

    verInternacion(event) {
        this.camaSelected = event;
        this.prestacionDelPaciente(this.camaSelected);
        this.panelIndex = 1;
        this.showMenu = true;
        this.showEgreso = true;
        this.camaSeleccionada = this.camaSelected;
    }

    buscarHistorial() {
        this.camasService.getHistorialCama(this.auth.organizacion._id, moment(this.fechaDesde).startOf('day').toDate(), moment(this.fechaHasta).endOf('day').toDate(), this.camaSeleccionada.id).subscribe(historial => {
            this.inicioBusqueda = true;
            if (historial.length > 0) {
                this.historial = historial;
            } else {
                this.historial = [];
            }
        });


    }

    reseteaBusqueda() {
        this.inicioBusqueda = false;
        this.historial = [];
    }

    // showEstadosMet() {
    //     if (moment(this.fecha).format('DD/MM/YYYY') !== moment(this.hoy).format('DD/MM/YYYY')) {
    //         this.estadosMode = false;
    //     } else {
    //         this.estadosMode = true;
    //     }
    // }

    checkOxigeno(cama) {
        return cama.equipamiento.find(e => e.conceptId === '261746005') ? true : false;
    }
    volver() {
        this.router.navigate(['/internacion/inicio']);
    }


    pacienteTemporal() {
        this.createTemporal = true;
    }

    afterPacienteTemp(paciente) {
        this.pacienteSelected = paciente;
        this.createTemporal = false;
        this.accion = null;
        this.showIngreso = true;
        this.editarIngreso = false;
        this.prestacionPorInternacion = null; // BORRAR
    }
}
