import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';
import { IOrganizacion } from '../../../../../../interfaces/IOrganizacion';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { CamasService } from '../../../../services/camas.service';
import { PrestacionesService } from '../../../../services/prestaciones.service';
import { IPacienteMatch } from '../../../../../mpi/interfaces/IPacienteMatch.inteface';
import { PacienteBuscarResultado } from '../../../../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { IPaciente } from '../../../../../../interfaces/IPaciente';
@Component({
    selector: 'app-mapa-de-camas',
    templateUrl: './mapa-de-camas.component.html',
    styleUrls: ['./mapa-de-camas.component.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class MapaDeCamasComponent implements OnInit {


    public epicrisis = {
        'conceptId': '721919000',
        'term': 'epicrisis de enfermería',
        'fsn': 'epicrisis de enfermería (elemento de registro)',
        'semanticTag': 'elemento de registro'
    };

    // listado de camas de la organizacion
    public camas: any[] = [];
    // copia de las camas
    public camasCopy = [];
    // estado de las camas de la organizacion
    public estadoServicio: any = {};
    // tipo de vista del mapa de camas
    public layout: String = 'grid';
    public organizacion: IOrganizacion;
    public prestacion: any;
    public fecha = new Date;
    public loader = true;
    public showMenu = true;
    public historicoMode = false;
    public filtroActive;
    public cantidadXEstado;
    public inactive = false;
    public camaSeleccionada;
    // Muestra el componente egreso en el sidebar
    public showEgreso = false;
    // Muesta/oculta el loader del sidebar
    public showLoaderSidebar = false;

    public showResumen = false;

    public prestacionPorInternacion;

    // Muestra el componente ingreso en el sidebar
    public showIngreso = false;
    public buscandoPaciente = false;
    public pacienteSelected;
    public camaSelected;
    public camaInternacion;
    public loadCountFiltros = false;
    public editarIngreso;

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
        opciones: {
            sectores: [],
            habitaciones: [],
            estados: [],
            servicios: [],
            tiposCamas: []
        }
    };

    public activo = 0;
    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;

    constructor(
        public servicioPrestacion: PrestacionesService,
        private auth: Auth,
        private plex: Plex,
        private router: Router,
        public organizacionService: OrganizacionService,
        public camasService: CamasService) { }

    ngOnInit() {
        this.refresh();
    }


    refresh(event = null) {
        // verificar permisos
        // buscar camas para la organización
        this.limpiarFiltros();
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
                this.plex.info('danger', err, 'Error');
                this.router.navigate(['/']);
            }
        });
    }

    /**
     * Limpiamos los filtros del mapa de camas
     *
 * @memberof MapaDeCamasComponent
 */
    public limpiarFiltros() {
        this.filtroActive = '';
        this.filtros.habitacion = null;
        this.filtros.oxigeno = false;
        this.filtros.desinfectada = false;
        this.filtros.tipoCama = false;
        this.filtros.nombre = null;
        this.filtros.estado = null;
        this.filtros.servicio = null;
        this.filtros.sector = null;
        this.filtros.opciones = {
            sectores: [],
            habitaciones: [],
            estados: [],
            servicios: [],
            tiposCamas: []
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
    }

    /**
     * Aplicar filtros al mapa de camas
     *
     * @memberof MapaDeCamasComponent
     */
    public filtrar() {
        const regex_nombre = new RegExp('.*' + this.filtros.nombre + '.*', 'ig');
        this.camas = this.camasCopy.filter((i) => {
            return (
                (!this.filtros.sector || i.sectores.findIndex((_s) => _s.id === this.filtros.sector.id) >= 0) &&
                (!this.filtros.tipoCama || (this.filtros.tipoCama && i.tipoCama.conceptId === this.filtros.tipoCama.id)) &&
                (!this.filtros.estado || (this.filtros.estado && i.ultimoEstado.estado === this.filtros.estado.id)) &&
                (!this.filtros.servicio || !this.filtros.servicio || (this.filtros.servicio.id && i.ultimoEstado.unidadOrganizativa && i.ultimoEstado.unidadOrganizativa.conceptId === this.filtros.servicio.id)) &&
                (!this.filtros.nombre || (this.filtros.nombre && i.ultimoEstado && i.ultimoEstado.paciente && (regex_nombre.test(i.ultimoEstado.paciente.nombre) || (regex_nombre.test(i.ultimoEstado.paciente.apellido)) || (regex_nombre.test(i.ultimoEstado.paciente.documento)))))
            );
        });
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
            this.countFiltros();
            // se busca el indice porque ya no se corresponde el cambio de estado con el indice del componente.
            let i = this.camas.findIndex(c => c.id === e.cama.id);
            if (e.cama) {
                this.camas[i] = e.cama;
                this.camaSeleccionada = e.cama;
                this.prestacionDelPaciente(e.cama);
            } else {
                this.refresh();
            }
            if (e.iniciarInternacion) {
                this.cambiaTap(1);
                // Muestro el resumen de la internacion si viene de iniciarInternacion
            }
        }
    }

    /**
     * Ir al ABM de camas
     */
    onGestionCamaClick() {
        this.router.navigate(['tm/organizacion/cama']);
    }

    public ingresarPaciente() {
        this.buscandoPaciente = true;
        this.pacienteSelected = null;
        this.pacientes = null;
        // this.router.navigate(['rup/internacion/crear']);
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
        this.prestacion = $event;
        if ($event) {
            this.inactive = true;
            this.filtroEstados('disponible');
        } else {
            this.limpiarFiltros();
            this.refresh();
        }
        this.filtrar();
    }

    mapaDeCamaXFecha(reset) {
        if (reset) {
            this.historicoMode = false;
            this.fecha = new Date();
        }
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
                oxigeno: this.camas.filter(c => c.equipamiento.find(e => e.conceptId === '261746005')),
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

    // selecionarCama(cama) {
    //     if (cama.ultimoEstado.paciente) {
    //         this.showLoaderSidebar = true;
    //         this.servicioPrestacion.getById(cama.ultimoEstado.idInternacion).subscribe(prestacion => {
    //             this.prestacionPorInternacion = prestacion;
    //             this.showLoaderSidebar = false;
    //         });
    //     }
    //     if (this.camaSeleccionada === cama) {
    //         this.camaSeleccionada = null;
    //     } else {
    //         this.showMenu = true;
    //         this.showIngreso = false;
    //         this.showResumen = false;
    //         this.camaSeleccionada = cama;
    //         this.prestacionPorInternacion = null;
    //     }
    // }

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
        this.buscandoPaciente = false;
    }

    onPacienteSelected(event) {
        this.pacienteSelected = event;
        this.buscandoPaciente = false;
        this.showIngreso = true;
        this.showMenu = true;
        this.prestacionPorInternacion = null;
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
        this.camaSelected = event;
        let cama = event;
        this.prestacionDelPaciente(cama);
        if (this.camaSeleccionada === cama) {
            this.camaSeleccionada = null;
        } else {
            this.showMenu = true;
            this.showIngreso = false;
            this.showResumen = false;
            this.camaSeleccionada = cama;
            this.prestacionPorInternacion = null;
        }
    }

    prestacionDelPaciente(cama) {
        if (cama.ultimoEstado && cama.ultimoEstado.paciente) {
            this.showLoaderSidebar = true;
            this.servicioPrestacion.getById(cama.ultimoEstado.idInternacion).subscribe(prestacion => {
                this.prestacionPorInternacion = prestacion;
                this.showLoaderSidebar = false;
            });
        }
    }

    editar(event) {
        switch (event) {
            case 'ingreso':
                this.editarIngreso = true;
                break;
            case 'egreso':
                // this.showEgreso = event;
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
        this.activo = value;
    }


    /**
       * Crea la prestacion de epicrisis, si existe recupera la epicrisis
       * creada anteriormente.
       * Nos rutea a la ejecucion de RUP.
       */
    generaEpicrisis() {
        this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacionPorInternacion.id }).subscribe(prestacionExiste => {
            if (prestacionExiste.length === 0) {
                let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.prestacionPorInternacion.paciente, this.epicrisis, 'ejecucion', 'internacion');
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
        this.onCamaSelected(event);
        this.cambiaTap(1);
    }


    actualizarCama($event) {
    }

}
