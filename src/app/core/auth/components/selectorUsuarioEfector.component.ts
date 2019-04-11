import { IProfesional } from './../../../interfaces/IProfesional';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Component, EventEmitter, QueryList, ViewChildren, Output, OnInit } from "@angular/core";
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { UsuarioService } from '../../../services/usuarios/usuario.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { PermisosService } from '../../../services/permisos.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { TextFilterPipe } from '../../../pipes/textFilter.pipe';


import { ArbolPermisosComponent } from './arbolPermisos.component';

@Component({
    selector: 'selectorUsuarioEfector',
    templateUrl: 'selectorUsuarioEfector.html',
    providers: [TextFilterPipe]
})
export class SelectorUsuarioEfectorComponent implements OnInit {
    /**
     * Notifica al componente que contiene a este el usuario seleccionado
     * @memberof SelectorUsuarioEfectorComponent
     */
    @Output() seleccionUsuario = new EventEmitter();
    /**
     * Notifica al componente que contiene a este la organización seleccionada y si es nueva (sin permisos)
     * o si la tenía cargada de antes (con permisos)
     * @memberof SelectorUsuarioEfectorComponent
     */
    @Output() seleccionOrganizacion = new EventEmitter<{ org: IOrganizacion, esNueva: boolean }>();
    /**
     * Indica si la pestaña de selección de usuario es la que se encuentra activa
     * @memberof SelectorUsuarioEfectorComponent
     */
    @Output() pestaniaUsuarioActiva = new EventEmitter<boolean>();
    // @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;
    /**
   * Indica el índice de la pestaña que se encuentra activa. Por defecto es la primera
   *
   * @memberof GestorUsuarioComponent
   */
    public pestaniaActiva = 0;

    /**
     * Texto ingresado (documento, nombre, apellido) para buscar paciente
     *
     * @type {string}
     * @memberof GestorUsuarioComponent
     */
    public textoLibre: string = null;
    public autoFocus = 0;
    /**
     * Filtro de búsqueda por Organización
     *
     * @memberof SelectorUsuarioEfectorComponent
     */
    public organizacionBusqueda;
    /**
     * Listado de usuarios que cumplen con los filtros de búsqueda
     *
     * @memberof SelectorUsuarioEfectorComponent
     */
    public users: any[];
    public usuarioSeleccionado;
    /**
     * Profesional que puede llegar estar asociado al usuario seleccionado
     *
     * @type {IProfesional}
     * @memberof SelectorUsuarioEfectorComponent
     */
    public profesionalAsociadoUsuario: IProfesional = null;

    public permisos: any[] = [];
    public userModel: any = {
        id: null,
        usuario: '',
        nombre: '',
        apellido: '',
        password: '',
        organizaciones: []
    };
    public permisos$: any;
    /**
     * Organización seleccionada para modificarle los permisos al usuario
     *
     * @private
     * @memberof SelectorUsuarioEfectorComponent
     */
    public organizacionPermisos = null;
    private organizacionSelectPrev = null;

    public organizacionesUsuario: IOrganizacion[] = [];
    public organizacionActualAuthUs;
    public showAgregarEfector: boolean;

    /**
     * Muestra los filtros avanzados (selección por organización)
     *
     * @memberof GestorUsuarioComponent
     */
    public mostrarFiltrosAvanzados = false;
    /**
     * Bandera que indica si se debe mostrar la parte de agregar un efector o no
     * @memberof SelectorUsuarioEfectorComponent
     */
    public agregarEfector = false;
    /**
     * Bandera que indica si se debe mostrar la parte de copiar permisos de un efector a otro
     * @memberof SelectorUsuarioEfectorComponent
     */
    public copiarPermisos = false;
    private temp;
    private organizacionesAuth: any[] = [];
    /**
     * Nuevas organizaciones que se agregan al clonar los permisos de otro efector
     * @type {any[]}
     * @memberof SelectorUsuarioEfectorComponent
     */
    public organizacionesNuevas: any[];
    public newOrganizaciones: any;
    /**
     * Nuevo Efector para el usuario seleccionado
     * @type {*}
     * @memberof SelectorUsuarioEfectorComponent
     */
    public newOrg: any;

    constructor(private plex: Plex, private auth: Auth, private usuarioService: UsuarioService, private organizacionService: OrganizacionService, private permisosService: PermisosService, private profesionalService: ProfesionalService,
        private textFilterPipe: TextFilterPipe) {

    }

    public ngOnInit() {
        this.loadUsuarios();
    }
    public seSeleccionoUsuario() {
        this.permisos$ = this.permisosService.get();
        this.permisosService.organizaciones({ admin: true }).subscribe(data => {
            this.organizacionesAuth = data;

            if (this.organizacionesAuth.length > 0) {
                if (this.usuarioSeleccionado) {
                    this.cargarProfesional(this.usuarioSeleccionado);

                    if (this.usuarioSeleccionado.organizaciones && this.usuarioSeleccionado.organizaciones.length > 0) {
                        let idOrganizaciones = this.usuarioSeleccionado.organizaciones.map(i => i._id);

                        this.organizacionService.get({ ids: idOrganizaciones }).subscribe(dataUss => {
                            this.organizacionesUsuario = dataUss;
                            if (this.organizacionesUsuario && this.organizacionesUsuario.length > 0) {
                                this.organizacionPermisos = this.organizacionesUsuario[0];
                                this.onOrgChange();
                            }
                            // this.organizacionSelect = null;
                            this.loadUser();
                            this.getOrgActualAuthUs();
                        });
                    } else {
                        this.loadUser();
                    }
                    this.seleccionUsuario.emit(this.usuarioSeleccionado);
                }
            } else {
                // this.router.navigate(['./inicio']);
            }
        });
    }

    private cargarProfesional(usuario) {
        let parametros = {
            'documento': usuario.usuario
        };
        this.profesionalService.get(parametros).subscribe(res => { this.profesionalAsociadoUsuario = res[0]; });
    }

    /**
     * Indica qué pestaña se activó
     *
     * @param {number} value
     * @memberof GestorUsuarioComponent
     */
    public cambio(value: number) {
        // entra cuando cancela copiar los permisos o agregar un nuevo efector mientras se tiene abierto las sugerencias. Esto no permite que entre
        if (typeof value === 'number') {
            this.pestaniaActiva = value;
            this.pestaniaUsuarioActiva.emit(this.pestaniaActiva === 0);
        }
    }

    /**
     * Carga la tabla de resultados de usuario cada vez que se modifica el campo de búsqueda
     *
     * @memberof GestorUsuarioComponent
     */
    public loadUsuarios() {
        this.usuarioService.get().subscribe(
            datos => {
                if (this.organizacionBusqueda && this.organizacionBusqueda._id) {
                    let g = datos.filter((item1: any) => { return item1.organizaciones.findIndex(item => item._id === this.organizacionBusqueda._id) > 0; });
                    this.users = this.textFilterPipe.transform(g, this.textoLibre);
                } else {
                    this.users = this.textFilterPipe.transform(datos, this.textoLibre);
                }
            }
        );
    }
    /**
     * Carga lar organizaciones (efectores) asociadas al usuario seleccionado
     *
     * @param {*} event
     * @memberof GestorUsuarioComponent
     */
    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            let organizacionesFiltradas: IOrganizacion[] = [];
            this.organizacionService.get(query).subscribe(resultado => {
                organizacionesFiltradas = resultado.filter(x => !this.organizacionesUsuario.some(y => x.id === y.id));
                event.callback(organizacionesFiltradas);
            });
        } else {
            event.callback([]);
        }
    }

    /**
     * Selecciona un usuario y cambia de pestaña
     *
     * @private
     * @param {*} user Usuario para seleccionar
     */
    public seleccionarUsuario(user: any) {
        if (user) {
            this.usuarioSeleccionado = user;
            this.textoLibre = null;
            this.cambio(2);
            this.seSeleccionoUsuario();
        } else {
            let dniIngresado = this.textoLibre.match(/\d/g); // obtengo los numeros escritos del filtro (puede ingresar nombre y numero de documento)
            if (!dniIngresado) {
                this.plex.info('danger', 'Debe ingresar DNI del usuario');
            } else {
                this.usuarioService.getByDni(Number(dniIngresado.join(''))).subscribe(newUser => {
                    if (newUser.length < 1) {
                        this.usuarioService.getUser(dniIngresado.join('')).subscribe(res => {
                            this.userModel.nombre = res.givenName;
                            this.userModel.apellido = res.sn;
                            this.userModel.usuario = res.uid;
                            this.userModel.organizaciones = [];
                            this.usuarioSeleccionado = this.userModel;
                            this.textoLibre = null;
                            this.cambio(2);
                            this.seSeleccionoUsuario();
                        }, err => {
                            this.plex.toast('warning', err, 'Error');
                        });
                    } else {
                        this.userModel.id = newUser[0].id;
                        this.userModel.nombre = newUser[0].nombre;
                        this.userModel.apellido = newUser[0].apellido;
                        this.userModel.usuario = newUser[0].usuario;
                        this.userModel.organizaciones = newUser[0].organizaciones;
                        this.plex.toast('info', 'Usuario existente', 'Información');
                    }
                });
                this.usuarioSeleccionado = {};

            }
        }
    }

    /**
     * Selecciona organización a modificar los permisos
     *
     * @memberof SelectorUsuarioEfectorComponent
     */
    onOrgChange() {
        this.organizacionSelectPrev = this.organizacionPermisos;
        this.loadPermisos();
        this.getOrgActualAuthUs();
        this.seleccionOrganizacion.emit({ org: this.organizacionPermisos, esNueva: false });
    }

    /**
     * Carga los las organizaciones (y los permisos correspondientes a cada una de ellas) si tiene alguna.
     *
     * @memberof UsuarioUpdateComponent
     */
    loadPermisos() {
        this.temp = this.userModel.organizaciones.find(item =>
            String(item._id) === (this.organizacionSelectPrev ? String(this.organizacionSelectPrev._id) : null)
        );
        if (this.temp) {
            this.permisos = this.temp.permisos;
        } else {
            this.permisos = [];
        }
    }
    getOrgActualAuthUs() {
        if (this.organizacionPermisos) {
            this.organizacionActualAuthUs = this.userModel.organizaciones.find(x => x._id === this.organizacionPermisos._id);
        }
    }

    /**
     * Agrega una organización al usuario
     * @memberof SelectorUsuarioEfectorComponent
     */
    agregarOrg() {
        if (this.newOrg) {
            this.userModel.organizaciones.push({ _id: this.newOrg._id, permisos: [] });
            this.permisos = [];
            this.getOrganizaciones();
            this.organizacionesUsuario.push(this.newOrg);
            this.organizacionPermisos = this.newOrg;
            this.organizacionSelectPrev = this.organizacionPermisos;
            this.agregarEfector = false;
            this.seleccionOrganizacion.emit({ org: this.organizacionPermisos, esNueva: true });
        }
    }

    /**
     * Cancela agregar una nueva organización
     * @memberof SelectorUsuarioEfectorComponent
     */
    cancelarAgregarEfector() {
        this.agregarEfector = false;
        this.newOrg = null;
    }

    /**
     * Inicializa las variables utilizadas para dejar limpio la copia de permisos
     * Se utiliza cuando cancela y también cuando se guarda con éxito la copia de los permisos,
     * para dejarlo limpio para otra copia de permisos
     * @memberof SelectorUsuarioEfectorComponent
     */
    cancelarCopiarPermisos() {
        this.copiarPermisos = false;
        this.organizacionesNuevas = [];
    }

    deleteEfector() {
        this.plex.confirm('¿Eliminar todos los permisos de ' + this.organizacionPermisos.nombre + '?').then((value: boolean) => {
            if (value) {
                let index = this.userModel.organizaciones.findIndex(elem => elem._id === this.organizacionPermisos._id);
                this.userModel.organizaciones.splice(index, 1);
                if (this.organizacionesUsuario && this.organizacionesUsuario.length > 0) {
                    let index2 = this.organizacionesUsuario.findIndex(elem => elem.id === this.organizacionPermisos.id);
                    this.organizacionesUsuario.splice(index2, 1);
                    this.organizacionPermisos = this.organizacionesUsuario ? this.organizacionesUsuario[0] : null;
                    this.usuarioService.save(this.usuarioSeleccionado).subscribe(user => {
                        // es necesario hacer esto para que angular se dé cuenta de que el arreglo organizacionesUsuario se modificó.
                        // Si simplemente se borra uno de los ítems del arreglo, angular no actualiza la visual. Es necesario modificarlo
                        // completo, entonces seteo todo el arreglo de nuevo
                        this.organizacionesUsuario = [...this.organizacionesUsuario];
                    });
                }
                this.onOrgChange();
            }
        });
    }
    /**
     * Pausa y reanuda los permisos de un usuario para la organización seleccionada
     * @memberof SelectorUsuarioEfectorComponent
     */
    pausar() {
        let textoConfirm = (this.organizacionActualAuthUs.activo) ? 'pausar' : 'reanudar';
        this.plex.confirm(`¿Está seguro que desea ${textoConfirm} a este usuario?`).then((resultado: boolean) => {
            if (resultado) {
                this.permisosService.actualizarEstadoPermisos(this.userModel.usuario, this.organizacionPermisos.id).subscribe(res => {
                    this.organizacionActualAuthUs.activo = res.activo;
                });
            }
        });
    }
    loadUser() {
        this.userModel.id = this.usuarioSeleccionado.id;
        this.userModel.usuario = this.usuarioSeleccionado.usuario;
        this.userModel.nombre = this.usuarioSeleccionado.nombre;
        this.userModel.apellido = this.usuarioSeleccionado.apellido;
        this.userModel.organizaciones = this.usuarioSeleccionado.organizaciones;
        this.getOrganizaciones();
        this.loadPermisos();
    }

    /**
    * Obtiene las organizaciones del usuario y luego hace un "join" con las
    * organizaciones del administrador(usuario logueado) para llenar el combo de nuevas organizaciones
    *
    * @memberof UsuarioUpdateComponent
    */
    getOrganizaciones() {
        this.organizacionPermisos = (this.organizacionesUsuario.length > 0) ? this.organizacionesUsuario[0] : null;
        this.organizacionSelectPrev = (this.organizacionesUsuario.length > 0) ? this.organizacionesUsuario[0] : null;

        // Si el usuario puede agregar efectores, se listan todos los disponibles (que no tenga todavía)
        if (this.auth.check('usuarios:agregarEfector')) {
            this.organizacionService.get({ limit: 1000 }).subscribe(organizaciones => {
                this.newOrganizaciones = organizaciones.filter(x => !this.organizacionesUsuario.some(y => x.id === y.id));
                this.showAgregarEfector = (this.newOrganizaciones.length > 0) ? true : false;
            });
        } else {

            // obtenemos las organizaciones del usuario

            if (this.organizacionesUsuario.length > 0) {
                // si el user seleccionado tiene organizaciones, hacemos un "join" con las del administrador
                // y el resultado se asigna al combo de posibles nuevas organizaciones
                this.newOrganizaciones = this.organizacionesAuth.filter(elem => this.userModel.organizaciones.findIndex(item => elem._id === item._id) < 0);
            } else {
                this.newOrganizaciones = this.organizacionesAuth;
            }

            this.showAgregarEfector = (this.newOrganizaciones.length > 0) ? true : false;
        }
    }
    copiarAEfectores() {
        if (this.organizacionesNuevas) {
            this.organizacionesNuevas.forEach(element => {
                this.userModel.organizaciones.push({ _id: element.id, permisos: this.permisos });
            });
            let idOrganizaciones = this.userModel.organizaciones.map(i => i._id);

            this.organizacionService.get({ ids: idOrganizaciones }).subscribe(dataUss => {
                this.organizacionesUsuario = dataUss;
            });
            this.usuarioService.save(this.userModel).subscribe(user => {
                this.plex.info('success', '', 'Usuario guardado');
                this.cancelarCopiarPermisos();
            });
        }
    }
}
