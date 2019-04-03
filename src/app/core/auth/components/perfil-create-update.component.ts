import { Component, Input, OnInit, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ArbolPermisosComponent } from './arbolPermisos.component';
import { PermisosService } from '../../../services/permisos.service';
import { PerfilUsuarioService } from './../services/perfilUsuarioService';
import { IPerfilUsuario } from '../interfaces/IPerfilUsuario';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
@Component({
    selector: 'perfilForm',
    templateUrl: 'perfil-create-update.html'
})

export class PerfilFormComponent implements OnInit {
    /**
     * Perfil que se utiliza para crear o editar
     * @readonly
     * @type {IPerfilUsuario}
     * @memberof PerfilFormComponent
     */
    @Input()
    get perfil(): IPerfilUsuario {
        return this.perfilEdit;
    }
    set perfil(value: IPerfilUsuario) {
        this.perfilEdit = {} as any;
        Object.assign(this.perfilEdit, value);
        this.esGlobal = !this.perfilEdit.organizacion ? true : false;

        this.puedeModificarAlcance = (!this.perfilEdit.id && this.auth.check('usuarios:perfil:crear:global') && this.auth.check('usuarios:perfil:crear:local')) ||
            (this.perfilEdit.id && this.auth.check('usuarios:perfil:modificar:global') && this.auth.check('usuarios:perfil:modificar:local'));
        this.puedeModificar = (!this.perfilEdit.id && this.auth.check('usuarios:perfil:modificar:global')) ||
            (this.perfilEdit.id && this.auth.check('usuarios:perfil:modificar:local'));
    }
    /**
   * Todas las prestaciones turneables. De este arreglo se obtienen los nombres de las prestaciones dado un id. Es necesario que sea diferente de null
   * @type {ITipoPrestacion[]}
   * @memberof ArbolPermisosComponent
   */
    @Input() prestacionesTurneables: ITipoPrestacion[];
    @Input() perfilesGlobLocOrg: IPerfilUsuario[];
    @Output() perfilGuardado = new EventEmitter<IPerfilUsuario>();

    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    /**
     * Clon del perfil pasado por parámetro sobre el que se realizan las modificaciones.
     * Si se guarda, es este el objeto que pisa el documento de la base de datos.
     * @type { IPerfilUsuario }
     * @memberof PerfilFormComponent
     */
    public perfilEdit: IPerfilUsuario;
    /**
     * Booleano que indica si el perfil a crear/editar tiene alcance Global o solo Local. Sirve para saber
     * si la organización donde está logueado el usuario debe guardarse en el perfil
     * @type {boolean}
     * @memberof PerfilFormComponent
     */
    public esGlobal: boolean;
    /**
     * Indica si se debe mostrar el bool que permite modificar el alcance del perfil
     * @type {boolean}
     * @memberof PerfilFormComponent
     */
    public puedeModificarAlcance: boolean;
    /**
     * Indica si se debe mostrar los datos del perfil para poder modificarlos o no
     * @type {boolean}
     * @memberof PerfilFormComponent
     */
    public puedeModificar: boolean;

    public permisos$: any;
    public permisos: any[] = [];

    constructor(public auth: Auth, private permisosService: PermisosService, private perfilUsuarioService: PerfilUsuarioService, private plex: Plex) { }

    ngOnInit() {
        this.permisos$ = this.permisosService.get();
    }

    /**
     * Guarda el perfil nuevo o edito si era viejo. Notifica también al componente padre que contenga a este
     * @param {*} event
     * @memberof PerfilFormComponent
     */
    public guardar(event) {
        if (!event.formValid) {
            this.plex.info('danger', 'Completar datos requeridos');
        } else {
            this.cargarPermisosDelArbol();
            if (this.perfilEdit.permisos.length < 1) {
                this.plex.info('danger', 'Debe ingresar por lo menos un permiso');
            } else {
                let perfilMismoPermisos = this.perfilesGlobLocOrg.find((perfil: IPerfilUsuario) => {
                    return perfil.permisos.toString() === this.perfilEdit.permisos.toString();
                });
                if (perfilMismoPermisos) {
                    this.plex.info('warning', 'La agrupación ' + perfilMismoPermisos.nombre + ' tiene los mismos permisos.');
                } else {
                    this.perfilEdit.organizacion = !this.esGlobal ? this.auth.organizacion.id : null;
                    (this.perfilEdit.id ? this.perfilUsuarioService.putPerfil(this.perfilEdit) : this.perfilUsuarioService.postPerfil(this.perfilEdit)).subscribe(res => {
                        this.plex.toast('success', this.perfilEdit.id ? 'Agrupación de permisos guardada' : 'Agrupación de permisos creada');
                        this.perfilGuardado.emit(res);
                    });
                }
            }
        }
    }

    /**
     * Cancela la edición/creación de un perfil
     * @memberof PerfilFormComponent
     */
    public cancelar() {
        this.perfilGuardado.emit(null);
    }

    /**
     * Setea los permisos del perfil de acuerdo al árbol de permisos
     * @memberof PerfilFormComponent
     */
    private cargarPermisosDelArbol() {
        let i = 0;
        this.childsComponents.forEach(child => {
            this.permisos = [...this.permisos, ...child.generateString()];
        });
        this.perfilEdit.permisos = this.permisos;
    }
}
