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
        this.esGlobal = this.perfilEdit.organizacion ? false : true;
        console.log('Perfil pasado por parametro: ', this.perfil);
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



    public permisos$: any;
    public permisos: any[] = [];

    constructor(public auth: Auth, private permisosService: PermisosService, private perfilUsuarioService: PerfilUsuarioService, private plex: Plex) { }

    ngOnInit() {
        // if (!this.perfilEdit) {
        //     this.perfilEdit = {
        //         nombre: '',
        //         permisos: [''],
        //         organizacion: null,
        //         activo: false
        //     };
        //     this.esGlobal = false; // por defecto crea el perfil en local
        // }

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
            if (!this.esGlobal) { // si es local
                this.perfilEdit.organizacion = this.auth.organizacion.id;
            } else if (this.perfilEdit.organizacion) { // si es global y tiene cargada una organización, borro la organización (paso de local a global)
                this.perfilEdit.organizacion = null;
            }
            (this.perfilEdit.id ? this.perfilUsuarioService.putPerfil(this.perfilEdit) : this.perfilUsuarioService.postPerfil(this.perfilEdit)).subscribe(res => {
                this.perfilGuardado.emit(res);
            });
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }

    savePermisos() {
        let i = 0;
        this.childsComponents.forEach(child => {
            this.permisos = [...this.permisos, ...child.generateString()];
        });
        this.perfilEdit.permisos = this.permisos;
        // this.temp = this.userModel.organizaciones.find(item => String(item._id) === (this.organizacionSelectPrev ? String(this.organizacionSelectPrev._id) : null));
        // if (this.temp) {
        //     this.temp.permisos = permisos;
        // }
    }
}
