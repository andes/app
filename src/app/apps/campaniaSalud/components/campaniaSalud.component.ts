import { CampaniaSaludService } from '../services/campaniaSalud.service';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import moment from 'moment';
@Component({
    selector: 'campaniaSalud',
    templateUrl: 'campaniaSalud.html'
})
export class CampaniaSaludComponent implements OnInit {

    /**
     * Para saber si se debe mostrar la visualización o el formulario de edición/creación
     * @type {Boolean}
     * @memberof CampaniaSaludComponent
     */
    mostrarVisualizacionCampania: boolean;


    /**
     * Campaña de Salud que se selecciona de la lista de campañas. Se utiliza para obtener los datos en la visualización y el formulario.
     * También sirve como variable para mostrar en la pantalla solo este componente o agregar como sidebar a la visualización/formulario.
     * @type {ICampaniaSalud}
     * @memberof CampaniaSaludComponent
     */
    public seleccionada: ICampaniaSalud;

    /**
     * Resultado de la búsqueda de campañas
     *
     * @type {ICampaniaSalud[]}
     * @memberof CampaniaSaludComponent
     */
    campanias: ICampaniaSalud[];

    /**
     * Filtro para la vigencia de las campañas de salud
     * @type {Date}
     * @memberof CampaniaSaludComponent
     */
    fechaDesde: Date;

    /**
     * Filtro para la vigencia de las campañas de salud
     *
     * @type {Date}
     * @memberof CampaniaSaludComponent
     */
    fechaHasta: Date;

    /**
     * Indica si el usuario tiene el permiso para crear. Habilita el botón Crear
     * @type {boolean}
     * @memberof CampaniaSaludComponent
     */
    puedeCrear: boolean;

    constructor(public campaniaSaludService: CampaniaSaludService, private auth: Auth, private router: Router) { }

    /**
     * Inicializa la pantalla de campañas. Carga los valores por defecto de los filtros y realiza la búsqueda
     *
     * @memberof CampaniaSaludComponent
     */
    public columns = [
        {
            'key': 'asunto',
            'label': 'Asunto'
        }, {
            'key': 'desde',
            'label': 'Desde'

        }, {
            'key': 'hasta',
            'label': 'Hasta'
        }, {
            'key': 'estado',
            'label': 'Estado'
        }
    ];
    ngOnInit() {
        if (!this.auth.getPermissions('campania:?').length) {
            this.router.navigate(['inicio']);
        }
        this.puedeCrear = this.auth.check('campania:crear');
        this.campanias = [];
        this.fechaDesde = moment().startOf('month').toDate();
        this.fechaHasta = moment().endOf('month').toDate();
        this.recuperarCampanias();
    }

    /**
     * Realiza la búsqueda de las campañas según los filtros ingresados
     *
     * @memberof CampaniaSaludComponent
     */
    recuperarCampanias() {
        this.campaniaSaludService.get({
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta
        }).subscribe(res => {
            this.campanias = res;
        });
    }

    /**
     * Quita la selección de la campaña para que se muestre de nuevo el listado
     * de campañas a pantalla completa después de ejecutar la consulta a base de datos
     *
     * @memberof CampaniaSaludComponent
     */
    aplicarFiltrosBusqueda() {
        this.seleccionCampania(null);
        this.recuperarCampanias();
    }

    /**
     * Guarda la selección de la campaña
     *
     * @param {ICampaniaSalud} campania
     * @memberof CampaniaSaludComponent
     */
    seleccionCampania(campania: ICampaniaSalud) {
        this.seleccionada = campania;
        this.mostrarVisualizacionCampania = true;
    }

    /**
     * Crea una campaña vacía
     *
     * @memberof CampaniaSaludComponent
     */
    crearCampania() {
        this.seleccionada = {
            asunto: null,
            cuerpo: null,
            link: null,
            imagen: null,
            target: {
                sexo: null,
                grupoEtario: {
                    desde: null,
                    hasta: null
                }
            },
            vigencia: {
                desde: null,
                hasta: null
            },
            fechaPublicacion: null,
            activo: true,
            textoAccion: null
        };
        this.mostrarVisualizacionCampania = false;
    }

    /**
     * Habilita formulario para editar una campaña
     *
     * @memberof CampaniaSaludComponent
     */
    editarCampania() {
        this.mostrarVisualizacionCampania = false;
    }

    /**
     * Se prepara la interfaz para mostrar la visualización de la campaña editada
     * y se actualiza el listado de campañas para reflejar las modificaciones realizadas.
     *
     * @param {ICampaniaSalud} $event ICampaniaSalud que se editó y guardó
     * @memberof CampaniaSaludComponent
     */
    guardarCampania($event: ICampaniaSalud) {
        this.recuperarCampanias();
        this.seleccionCampania($event);
        this.mostrarVisualizacionCampania = true;
    }

    /**
     * Habilita panel de visualización de una campaña
     *
     * @memberof CampaniaSaludComponent
     */
    cancelarEdicionCampania(cancelaCreacion: boolean) {
        this.mostrarVisualizacionCampania = true;
        if (!cancelaCreacion) {
            this.seleccionada = null;
        }
    }

    cerrarCampania() {
        this.mostrarVisualizacionCampania = false;
        this.seleccionada = null;
    }
}
