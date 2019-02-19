import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPerfilUsuario } from '../interfaces/IPerfilUsuario';
import { PerfilUsuarioService } from './../services/perfilUsuarioService';
@Component({
    selector: 'gestorPerfiles',
    templateUrl: 'gestorPerfiles.html'
})

export class GestorPerfilesComponent implements OnInit {

    /**
     * Todos los perfiles de usuario, tanto globales como locales para la organización donde está logueado el usuario
     * @type {IPerfilUsuario[]}
     * @memberof GestorPerfilesComponent
     */
    public perfiles: IPerfilUsuario[];

    /**
     * Es el perfil seleccionado de la tabla de la izquierda
     * @type {IPerfilUsuario}
     * @memberof GestorPerfilesComponent
     */
    public perfilSeleccionado: IPerfilUsuario;
    public puedeBorrarGlobal: boolean;
    public puedeBorrarLocal: boolean;
    /**
     * Indica si el usuario puede crear un perfil local. Se discrimina con el global porque es necesario al momento
     * de setear el nuevo perfil
     * @type {boolean}
     * @memberof GestorPerfilesComponent
     */
    public puedeCrearLocal: boolean;
    /**
     * Indica si el usuario puede crear un perfil global. Se discrimina con el local porque es necesario al momento
     * de setear el nuevo perfil
     * @type {boolean}
     * @memberof GestorPerfilesComponent
     */
    public puedeCrearGlobal: boolean;

    constructor(private perfilUsuarioService: PerfilUsuarioService, private auth: Auth, private plex: Plex) { }

    ngOnInit() {
        this.recuperarPerfiles();
        this.puedeBorrarGlobal = this.auth.check('usuarios:perfil:eliminar:global');
        this.puedeBorrarLocal = this.auth.check('usuarios:perfil:eliminar:local');
        this.puedeCrearLocal = this.auth.check('usuarios:perfil:crear:local');
        this.puedeCrearGlobal = this.auth.check('usuarios:perfil:crear:global');
    }

    /**
     * Busca en base de datos los perfiles globales y los correspondientes locales
     * @memberof GestorPerfilesComponent
     */
    recuperarPerfiles() {
        this.perfilUsuarioService.get({ idOrganizacion: this.auth.organizacion.id }).subscribe(res => {
            this.perfiles = res;
        });
    }

    /**
     * Crea un perfil vacío y lo carga en el perfil seleccionado, desactivado por defecto
     * @memberof GestorPerfilesComponent
     */
    nuevoPerfil() {
        this.perfilSeleccionado = {
            nombre: null,
            permisos: [],
            organizacion: (this.puedeCrearGlobal && !this.puedeCrearLocal) ? null : this.auth.organizacion.id,
            activo: false
        };
    }

    perfilGuardado() {
        this.perfilSeleccionado = null;
        this.recuperarPerfiles();
    }

    deletePerfil(perfilBorrar: IPerfilUsuario) {
        if (perfilBorrar) {
            this.plex.confirm('¿Está seguro que desea eliminar el perfil?', 'Eliminar Perfil').then((confirmar: boolean) => {
                if (confirmar) {
                    this.perfilUsuarioService.delete(perfilBorrar.id).subscribe(() => {
                        this.perfilSeleccionado = null;
                        this.recuperarPerfiles();
                    });
                }
            });
        }
    }
}
