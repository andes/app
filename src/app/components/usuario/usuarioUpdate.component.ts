import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import * as enumerados from './../../utils/enumerados';
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
    @Input('seleccion') seleccion: any;
    @Output() data: EventEmitter<string> = new EventEmitter<string>();
    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;

    private organizacionSelect = null;
    private organizacionSelectPrev = null;

    private timeoutHandle: number;
    private temp;
    private organizacionesAuth: any[] = [];

    public btnEliminar: boolean;
    public showAgregarEfector: boolean;
    public newOrganizaciones: any;
    public newOrg: any;
    public hidePermisos = false;
    public organizacionesUsuario: any[] = [];
    public permisos$: any;
    public showCreate = false;
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
                        });
                    } else {
                        this.loadUser();
                    };
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

        // Si el usuario puede agregar efectores, se listan todos los disponibles
        if (this.auth.check('usuarios:agregarEfector')) {
            this.organizacionService.get({}).subscribe(organizaciones => {
                this.newOrganizaciones = organizaciones;
                this.showAgregarEfector = (this.newOrganizaciones.length > 0) ? true : false;
                this.btnEliminar = (this.organizacionesUsuario.length > 0) ? true : false;
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
            this.showAgregarEfector = (this.newOrganizaciones.length > 0) ? true : false;
            this.btnEliminar = (this.organizacionesUsuario.length > 0) ? true : false;
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
        this.savePermisos();
        this.organizacionSelectPrev = this.organizacionSelect;
        this.loadPermisos();
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
            String(item._id) === String(this.organizacionSelectPrev._id)
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
                this.getOrganizaciones();

            }
        });
    }

    savePermisos() {
        let permisos = [];
        this.childsComponents.forEach(child => {
            permisos = [...permisos, ...child.generateString()];
        });
        this.temp = this.userModel.organizaciones.find(item => String(item._id) === String(this.organizacionSelectPrev._id));
        if (this.temp) {
            this.temp.permisos = permisos;
        }

    }

    onSave() {
        this.savePermisos();
        this.usuarioService.save(this.userModel).subscribe(user => {
            this.plex.info('success', '', 'Usuario guardado', );
            this.data.emit(user);
        });
    }

    onCancel() {
        this.data.emit(null);
    }
}
