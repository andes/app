import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input, QueryList, ViewChildren } from '@angular/core';
import { Server } from '@andes/shared';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
// Services
import { UsuarioService } from '../../services/usuarios/usuario.service';
import { ProvinciaService } from './../../services/provincia.service';
import { OrganizacionService } from './../../services/organizacion.service';
import { PermisosService } from './../../services/permisos.service';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { ArbolPermisosComponent } from './arbolPermisos.component';
@Component({
    selector: 'usuarioUpdate',
    templateUrl: 'usuarioUpdate.html',
    styleUrls: ['usuarios.css']
})

export class UsuarioUpdateComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Input() seleccion: any;
    @Output() data: EventEmitter<string> = new EventEmitter<string>();
    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    private organizacionSelect = null;
    private organizacionSelectPrev = null;

    private temp;
    private organizacionesAuth: any[] = [];

    public showAgregarEfector: boolean;
    public newOrganizaciones: any;
    public newOrg: any;
    public hidePermisos = false;
    public organizacionesUsuario: IOrganizacion[] = [];
    public permisos$: any;
    public showCreate = false;
    public sideBarPermisos = false;
    public organizacionesNuevas;
    public showUpdate = false;
    public permisos: any[] = [];
    public userModel: any = {
        id: null,
        usuario: '',
        nombre: '',
        apellido: '',
        password: '',
        organizaciones: []
    };
    public organizacionActualAuthUs;

    constructor(private plex: Plex, private server: Server, private usuarioService: UsuarioService, private router: Router,
        private auth: Auth, private provinciaService: ProvinciaService, private organizacionService: OrganizacionService, private permisosService: PermisosService) { }

    public ngOnInit() {
        this.permisos$ = this.permisosService.get();
        this.permisosService.organizaciones({ admin: true }).subscribe(data => {
            this.organizacionesAuth = data;

            if (this.organizacionesAuth.length > 0) {
                if (this.seleccion) {
                    if (this.seleccion.organizaciones && this.seleccion.organizaciones.length > 0) {
                        let idOrganizaciones = this.seleccion.organizaciones.map(i => i._id);

                        this.organizacionService.get({ ids: idOrganizaciones }).subscribe(dataUss => {
                            this.organizacionesUsuario = dataUss;
                            this.loadUser();
                            this.getOrgActualAuthUs();
                        });
                    } else {
                        this.loadUser();
                    }
                }
            } else {
                this.router.navigate(['./inicio']);
            }
        });
    }

    /**
     * Obtiene las organizaciones del usuario y luego hace un "join" con las
     * organizaciones del administrador(usuario logueado) para llenar el combo de nuevas organizaciones
     *
     * @memberof UsuarioUpdateComponent
     */
    getOrganizaciones() {
        this.organizacionSelect = (this.organizacionesUsuario.length > 0) ? this.organizacionesUsuario[0] : null;
        this.organizacionSelectPrev = (this.organizacionesUsuario.length > 0) ? this.organizacionesUsuario[0] : null;

        // Si el usuario puede agregar efectores, se listan todos los disponibles (que no tenga todavía)
        if (this.auth.check('usuarios:agregarEfector')) {
            console.log('si tengo permiso');
            this.organizacionService.get({ limit: 1000 }).subscribe(organizaciones => {
                this.newOrganizaciones = organizaciones.filter(x => !this.organizacionesUsuario.some(y => x.id === y.id));
                console.log(this.newOrganizaciones.length);
                this.showAgregarEfector = (this.newOrganizaciones.length > 0) ? true : false;
            });
        } else {

            // obtenemos las organizaciones del usuario

            if (this.organizacionesUsuario.length > 0) {
                // si el user seleccionado tiene organizaciones, hacemos un "join" con las del administrador
                // y el resultado se asigna al combo de posibles nuevas organizaciones
                // this.organizacionSelect = this.organizacionSelectPrev = this.organizacionesUsuario[0];
                this.newOrganizaciones = this.organizacionesAuth.filter(elem => this.userModel.organizaciones.findIndex(item => elem._id === item._id) < 0);
            } else {
                this.newOrganizaciones = this.organizacionesAuth;
            }
            console.log(this.newOrganizaciones.length);

            this.showAgregarEfector = (this.newOrganizaciones.length > 0) ? true : false;
        }
    }


    loadUser() {
        this.showUpdate = true;
        this.userModel.id = this.seleccion.id;
        this.userModel.usuario = this.seleccion.usuario;
        this.userModel.nombre = this.seleccion.nombre;
        this.userModel.apellido = this.seleccion.apellido;
        this.userModel.organizaciones = this.seleccion.organizaciones;
        this.getOrganizaciones();
        this.loadPermisos();
    }

    onOrgChange() {
        this.hidePermisos = true;
        this.savePermisos();
        this.organizacionSelectPrev = this.organizacionSelect;
        this.loadPermisos();
        this.getOrgActualAuthUs();
        setTimeout(() => this.hidePermisos = false, 0);
    }

    newEfector() {
        this.savePermisos();
        this.hidePermisos = true;
    }

    agregarOrg() {
        this.userModel.organizaciones.push({ _id: this.newOrg._id, permisos: [] });
        this.permisos = [];
        this.getOrganizaciones();
        this.organizacionesUsuario.push(this.newOrg);
        this.organizacionSelect = this.newOrg;
        this.organizacionSelectPrev = this.organizacionSelect;
        this.hidePermisos = false;
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

    deleteEfector() {
        this.plex.confirm('¿Eliminar todos los permisos de ' + this.organizacionSelect.nombre + '?').then(value => {
            if (value) {
                let index = this.userModel.organizaciones.findIndex(elem => elem._id === this.organizacionSelect._id);
                this.userModel.organizaciones.splice(index, 1);

                if (this.organizacionesUsuario && this.organizacionesUsuario.length > 0) {
                    let index2 = this.organizacionesUsuario.findIndex(elem => elem.id === this.organizacionSelect.id);
                    this.organizacionesUsuario.splice(index2, 1);
                    // es necesario hacer esto para que angular se dé cuenta de que el arreglo organizacionesUsuario se modificó.
                    // Si simplemente se borra uno de los ítems del arreglo, angular no actualiza la visual. Es necesario modificarlo
                    // completo, entonces seteo todo el arreglo de nuevo
                    this.organizacionesUsuario = [...this.organizacionesUsuario];
                    this.organizacionSelect = this.organizacionesUsuario ? this.organizacionesUsuario[0] : null;
                }

                this.onOrgChange();
            }
        });
    }

    savePermisos() {
        let permisos = [];
        this.childsComponents.forEach(child => {
            permisos = [...permisos, ...child.generateString()];
        });
        this.temp = this.userModel.organizaciones.find(item => String(item._id) === (this.organizacionSelectPrev ? String(this.organizacionSelectPrev._id) : null));
        if (this.temp) {
            this.temp.permisos = permisos;
        }

    }

    onSave() {
        this.savePermisos();
        this.usuarioService.save(this.userModel).subscribe(user => {
            this.plex.info('success', '', 'Usuario guardado');
            this.data.emit(user);
        });
    }

    onCancel() {
        if (this.hidePermisos) {
            this.hidePermisos = false;
        } else {
            this.data.emit(null);
        }
    }

    loadOrganizacion(event?) {
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(resultado => {
                let res2 = resultado.filter((elem: any) => this.userModel.organizaciones.findIndex(item => elem._id === item._id) < 0);
                console.log(res2);
                event.callback(res2);
            });
        } else {
            event.callback([]);
        }
    }

    copiarAEfectores() {
        this.organizacionesNuevas.forEach(element => {
            // this.userModel.organizaciones.push({ _id: element.id, permisos: this.permisos });
            this.seleccion.organizaciones.push({ _id: element.id, permisos: this.permisos });
            // this.organizacionSelect.push({_id: element.id, permisos: this.permisos});
        });
        let idOrganizaciones = this.seleccion.organizaciones.map(i => i._id);

        this.organizacionService.get({ ids: idOrganizaciones }).subscribe(dataUss => {
            this.organizacionesUsuario = dataUss;
            // this.loadUser();
            // this.getOrgActualAuthUs();
        });
        console.log(this.userModel);
        this.savePermisos();
        this.usuarioService.save(this.userModel).subscribe(user => {
            this.plex.info('success', '', 'Usuario guardado');
            this.sideBarPermisos = false;     // this.data.emit(user);
            this.organizacionesNuevas = null;
        });

        // this.organizacionSelect = this.userModel.organizaciones;
        //    this.onSave();
    }

    getOrgActualAuthUs() {
        if (this.organizacionSelect) {

            this.organizacionActualAuthUs = this.userModel.organizaciones.find(x => x._id === this.organizacionSelect._id);
            console.log(this.organizacionActualAuthUs);
        }
    }

    pausar() {

        let textoConfirm;
        if (!this.organizacionActualAuthUs.permisosPausados) {
            textoConfirm = 'pausar';
        } else {
            textoConfirm = 'reanudar';
        }
        this.plex.confirm(`¿Está seguro que desea ${textoConfirm} a este usuario?`).then((resultado) => {
            if (resultado) {
                console.log(this.organizacionSelect);
                console.log(this.userModel.usuario, this.organizacionSelect.id);
                this.permisosService.actualizarEstadoPermisos(this.userModel.usuario, this.organizacionSelect.id).subscribe(resultado => {
                    // this.estadoPermisos = resultado.permisosPausados;
                    this.organizacionActualAuthUs.permisosPausados = resultado.permisosPausados;
                });
            }
        });
    }
}
