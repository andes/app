import { Component, Input, OnInit, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ArbolPermisosComponent } from './../../../components/usuario/arbolPermisos.component';
import { PermisosService } from '../../../services/permisos.service';
import { PerfilUsuarioService } from './../services/perfilUsuarioService';
import { IPerfilUsuario } from '../interfaces/IPerfilUsuario';
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
    @Output() perfilGuardado = new EventEmitter<IPerfilUsuario>();

    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    /**
     * Clon del perfil pasado por parámetro sobre el que se realizan las modificaciones.
     * Si se guarda, es este el objeto que pisa el documento de la base de datos.
     * @type { IPerfilUsuario }
     * @memberof PerfilFormComponent
     */
    perfilEdit: IPerfilUsuario;
    /**
     * Booleano que indica si el perfil a crear/editar tiene alcance Global o solo Local. Sirve para saber
     * si la organización donde está logueado el usuario debe guardarse en el perfil
     * @type {boolean}
     * @memberof PerfilFormComponent
     */
    esGlobal: boolean;
    /**
     * Indica si se debe mostrar el bool que permite modificar el alcance del perfil
     * @type {boolean}
     * @memberof PerfilFormComponent
     */
    puedeModificarAlcance: boolean;
    /**
     * Indica si se debe mostrar los datos del perfil para poder modificarlos o no
     * @type {boolean}
     * @memberof PerfilFormComponent
     */
    puedeModificar: boolean;

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
    guardar(event) {
        if (event.formValid) {
            this.savePermisos();
            this.perfilEdit.organizacion = !this.esGlobal ? this.auth.organizacion.id : null;
            (this.perfilEdit.id ? this.perfilUsuarioService.putPerfil(this.perfilEdit) : this.perfilUsuarioService.postPerfil(this.perfilEdit)).subscribe(res => {
                this.plex.toast('success', this.perfilEdit.id ? 'Perfil guardado' : 'Perfil creado');
                this.perfilGuardado.emit(res);
            });
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }

    /**
     * Cancela la edición/creación de un perfil
     * @memberof PerfilFormComponent
     */
    cancelar() {
        this.perfilGuardado.emit(null);
    }

    /**
     * Setea los permisos del perfil de acuerdo al árbol de permisos
     * @memberof PerfilFormComponent
     */
    savePermisos() {
        let i = 0;
        this.childsComponents.forEach(child => {
            this.permisos = [...this.permisos, ...child.generateString()];
        });
        this.perfilEdit.permisos = this.permisos;
    }
}
