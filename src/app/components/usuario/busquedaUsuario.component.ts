import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
// Services
import { UsuarioService } from '../../services/usuarios/usuario.service';
import { Router } from '@angular/router';
import { OrganizacionService } from '../../services/organizacion.service';

@Component({
    selector: 'busquedaUsuario',
    templateUrl: 'busquedaUsuario.html',
    styleUrls: ['usuarios.css']
})

export class BusquedaUsuarioComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    private timeoutHandle: number;

    // Propiedades públicas
    public busquedaAvanzada = false;
    public textoLibre: string = null;
    public resultado = null;
    public seleccion = null;
    public loading = false;
    public showUpdate = false;
    public showCreate = false;
    public mostrarNuevo = true;
    public autoFocus = 0;
    public users;
    public mostrarFiltro = false;
    public organizacionBusqueda;
    public idOrganizacionBusqueda;
    public busquedaTextoLibre = {
        valor: null,
        tipo: 'textoLibre'
    };
    public busquedaOrganizacion = {
        valor: null,
        tipo: 'organizacion'
    };
    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private router: Router, private server: Server, private usuarioService: UsuarioService, private auth: Auth, private organizacionService: OrganizacionService) {

    }

    public ngOnInit() {
        if (this.auth.getPermissions('usuarios:?').length > 0) {
            this.autoFocus = this.autoFocus + 1;
            this.showCreate = false;
            this.showUpdate = false;
            this.loadUsuarios();
        } else {
            this.router.navigate(['./inicio']);
        }
    }



    /**
     * Selecciona un usuario y emite el evento 'selected'
     *
     * @private
     * @param {*} user Usuario para seleccionar
     */
    public seleccionarUsuario(user: any) {
        this.seleccion = user;
        if (user) {
            this.selected.emit(user);
            this.showUpdate = true;
        } else {

            this.showCreate = true;
        }
        this.textoLibre = null;
        this.mostrarNuevo = false;
    }

    /**
     * Busca usuario cada vez que el campo de busca cambia su valor
     */
    public loadUsuarios() {
        this.usuarioService.get().subscribe(
            datos => {

                if (this.organizacionBusqueda && this.organizacionBusqueda._id) {
                    let g = datos.filter((item1: any) => { return item1.organizaciones.findIndex(item => item._id ===  this.organizacionBusqueda._id) > 0; });
                    console.log(g);
                    this.users = g;
                } else {
                    this.users = datos;

                }

            }
        );
    }

    afterCreateUpdate(user) {
        this.loadUsuarios();
        this.showCreate = false;
        this.showUpdate = false;
        this.mostrarNuevo = true;
        this.seleccion = null;
        this.autoFocus = this.autoFocus + 1;
        this.textoLibre = '';
        if (user) {
            this.resultado = [user];
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(resultado => {
                //  let res2 =   resultado.filter((elem: any) => this.userModel.organizaciones.findIndex(item => elem._id === item._id) < 0);
                // console.log(res2);
                event.callback(resultado);
            });
        } else {
            event.callback([]);
        }
    }

    parseIdOrganizacion(evento) {
        console.log(evento);
        if (this.organizacionBusqueda) {

            this.idOrganizacionBusqueda = this.organizacionBusqueda._id;
            this.busquedaOrganizacion.valor = this.organizacionBusqueda._id;
        }

        if (evento.value === null) {
            this.busquedaOrganizacion.valor = '';
        }
    }
}
