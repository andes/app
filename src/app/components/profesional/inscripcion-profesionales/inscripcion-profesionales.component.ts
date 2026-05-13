import moment from 'moment';
import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';
import { captcha } from 'src/environments/apiKeyMaps';
import { UsuariosHttp } from '../../../apps/gestor-usuarios/services/usuarios.http';
import { ProfesionalService } from '../../../services/profesional.service';
import { getObjSexos } from '../../../utils/enumerados';


@Component({
    selector: 'app-inscripcion-profesionales',
    templateUrl: './inscripcion-profesionales.component.html'
})
export class InscripcionProfesionalesComponent implements OnInit {

    public existeUsuario = false;
    public sexos = [];
    public contactos = [];
    public recaptcha = null;
    public enProceso = false;
    public token = '';
    public captchaEnabled = true;
    public profesional = {
        id: '',
        documento: '',
        nombre: '',
        apellido: '',
        sexo: null,
        recaptcha: '',
        nombreCompleto: '',
        fechaNacimiento: null,
        email: '',
        telefono: '',
        matriculas: []
    };
    public estaValidado = false;
    public user = null;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;

    constructor(
        private profesionalService: ProfesionalService,
        private usuariosHttp: UsuariosHttp,
        private usuarioService: UsuarioService,
        private plex: Plex,
        private router: Router
    ) {
        this.captchaEnabled = captcha.enabled;
    }

    ngOnInit(): void {
        this.sexos = getObjSexos();
    }

    getProfesional() {
        this.enProceso = true;
        this.recaptcha = '';
        this.profesionalService.validarProfesional({
            nombre: this.profesional.nombre,
            apellido: this.profesional.apellido,
            documento: this.profesional.documento,
            sexo: this.profesional.sexo.id,
            fechaNacimiento: this.profesional.fechaNacimiento,
        }).subscribe(
            (datos) => {
                if (datos.profesional) {
                    this.token = datos.token;
                    this.profesional.id = datos.profesional.id;
                    this.profesional.nombre = datos.profesional.nombre;
                    this.profesional.apellido = datos.profesional.apellido;
                    this.contactos = datos.profesional.contactos;
                    this.profesional.matriculas = this.getMatriculas(datos.profesional);
                    this.profesional.nombreCompleto = datos.profesional.nombreCompleto;
                    this.profesional.fechaNacimiento = moment(datos.profesional.fechaNacimiento).format('L');
                    this.profesional.email = datos.profesional.contactos ? this.getEmail(datos.profesional.contactos) : '';
                    this.profesional.telefono = datos.profesional.contactos ? this.getTelefono(datos.profesional.contactos) : '';
                    this.estaValidado = true;
                    this.enProceso = false;
                }
            },
            (error) => {
                this.plex.info('warning', error, 'Sus datos no pudieron ser validados');
                this.enProceso = false;
                this.profesional.recaptcha = '';
            }
        );
    }

    resolved(captchaResponse: any[]) {
        this.recaptcha = captchaResponse;
        this.profesional.recaptcha = this.recaptcha;
    }

    resetForm() {
        this.profesional = {
            id: '',
            documento: '',
            nombre: '',
            apellido: '',
            sexo: null,
            recaptcha: '',
            nombreCompleto: '',
            fechaNacimiento: null,
            matriculas: [],
            email: '',
            telefono: '',
        };
        this.estaValidado = false;
    }

    getEmail(contacto: Array<any>) {
        const email: any = contacto.find(elem => elem.tipo === 'email');
        return (email ? email.valor : null);
    }

    getTelefono(contacto: Array<any>) {
        const telefono: any = contacto.find(elem => elem.tipo === 'celular');
        return (telefono ? telefono.valor : null);
    }

    getMatriculas(profesional) {
        if (profesional.formacionGrado?.length) {
            return profesional.formacionGrado
                .filter(m => m.matriculado)
                .map(m => {
                    const matricula = m.matriculacion[m.matriculacion.length - 1];
                    return {
                        numeroMatricula: matricula.matriculaNumero,
                        profesion: m.profesion.nombre,
                        fechaFin: matricula.fin
                    };
                });
        }
        return [];
    }

    verificarUsuario() {
        this.usuariosHttp.find({ documento: this.profesional.documento, token: this.token }).subscribe(user => {
            this.user = user;
            this.existeUsuario = user.length ? true : false;
        });
    }

    createUser() {
        this.enProceso = true;
        const newUser = {
            documento: this.profesional.documento,
            nombre: this.profesional.nombre,
            apellido: this.profesional.apellido,
            email: this.profesional.email
        };
        this.usuarioService.createUsuario(newUser, { token: this.token }).subscribe(user => {
            if (user) {
                const contactoProfesional = this.updateContactos();
                this.profesionalService.actualizarProfesional({ id: this.profesional.id, contactos: contactoProfesional }, { token: this.token })
                    .subscribe((res) => {
                        if (res) {
                            if (user.tipo === 'temporal') {
                                this.plex.info('success', `Un email a ${newUser.email} fue enviado con sus datos de inicio de sesión`, 'Su usuario fue creado correctamente');
                            } else {
                                if (user.tipo === '') {
                                    this.plex.info('success', 'El usuario fue generado correctamente, puede ingresar con el usuario y clave de ONE LOGIN', 'Su usuario fue creado correctamente');
                                }
                            }
                            this.enProceso = false;
                            this.resetForm();
                        }
                    });
            }
        }, (error) => {
            this.plex.info('warning', error);
            this.enProceso = false;
        });
    }

    updateContactos() {
        const nuevoContacto = [];
        const telFijo = this.contactos.find(contacto => contacto.tipo === 'fijo');
        if (telFijo) {
            nuevoContacto.push(telFijo);
        }
        if (this.profesional.email) {
            nuevoContacto.push({ tipo: 'email', valor: this.profesional.email, activo: true });
        }
        if (this.profesional.telefono) {
            nuevoContacto.push({ tipo: 'celular', valor: this.profesional.telefono, activo: true });
        }
        return nuevoContacto;
    }

    renovarMatricula() {
        this.router.navigate(['matriculaciones']);
    }

}
