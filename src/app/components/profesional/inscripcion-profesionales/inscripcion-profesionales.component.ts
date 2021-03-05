import { Component, OnInit } from '@angular/core';
import { UsuariosHttp } from '../../../apps/gestor-usuarios/services/usuarios.http';
import { ProfesionalService } from '../../../services/profesional.service';
import { getObjSexos } from '../../../utils/enumerados';


@Component({
  selector: 'app-inscripcion-profesionales',
  templateUrl: './inscripcion-profesionales.component.html'
})
export class InscripcionProfesionalesComponent implements OnInit {

  public aceptaPermisos = false;
  public existeUsuario = false;
  public sexos = [];
  public recaptcha = null;
  public profesional = {
    id: '',
    documento: '',
    sexo: null,
    nroTramite: '',
    recaptcha: '',
    nombreCompleto: '',
    fechaNacimiento: null,
    matricula: '',
    profesion: '',
    email: '',
    telefono: '',
    estaMatriculado: null
  };
  public estaValidado = false;
  constructor(
    private profesionalService: ProfesionalService,
    private usuariosHttp: UsuariosHttp
  ) { }

  ngOnInit(): void {
    this.sexos = getObjSexos();
  }

  pruebaValidacion() {
    this.profesionalService.validarProfesional({ documento: this.profesional.documento, sexo: this.profesional.sexo.id, nroTramite: this.profesional.nroTramite }).subscribe(datos => {
      if (datos) {
        this.profesional.id = datos.id;
        const datosMatricula: any = this.getMatricula(datos)
        this.profesional.nombreCompleto = datos.nombreCompleto;
        this.profesional.fechaNacimiento = datos.fechaNacimiento
        this.profesional.matricula = datosMatricula.numeroMatricula;
        this.profesional.profesion = datosMatricula.profesion;
        this.profesional.email = datos.contactos ? this.getEmail(datos.contactos) : '';
        this.profesional.telefono = datos.contactos ? this.getTelefono(datos.contactos) : '';
        this.profesional.estaMatriculado = Object.keys(datosMatricula).length ? true : false;
        this.estaValidado = true;
      } else {
      }
    });
  }

  aceptaTerminosActualizacion() {
    this.existeUsuario = true;
  }

  resolved(captchaResponse: any[]) {
    this.recaptcha = captchaResponse;
    this.profesional.recaptcha = this.recaptcha;
  }

  resetForm() {
    this.profesional = {
      id: '',
      documento: '',
      sexo: null,
      nroTramite: '',
      recaptcha: '',
      nombreCompleto: '',
      fechaNacimiento: null,
      matricula: '',
      profesion: '',
      email: '',
      telefono: '',
      estaMatriculado: null
    }
    this.estaValidado = false;
    this.aceptaPermisos = false;
  }

  getEmail(contacto: Array<any>) {
    const email: any = contacto.filter(elem => elem.tipo === 'email');
    return (email.length ? email[0].valor : null)
  }

  getTelefono(contacto: Array<any>) {
    const telefono: any = contacto.filter(elem => elem.tipo === 'celular');
    return (telefono.length ? telefono[0].valor : null)
  }

  getMatricula(profesional) {
    let resultado = {}
    if (profesional.formacionPosgrado?.length) {
      const ultimaEspecialidad = profesional.formacionPosgrado.length - 1;
      const especialidad = profesional.formacionPosgrado[ultimaEspecialidad];
      if (especialidad.matriculacion[especialidad.matriculacion.length - 1].fin > new Date()) {
        resultado['numeroMatricula'] = especialidad.matriculacion[especialidad.matriculacion.length - 1].matriculaNumero;
        resultado['profesion'] = especialidad.especialidad.nombre;

      } else {
        const ultimaProfesion = profesional.formacionGrado.length - 1;
        const profesion = profesional.formacionGrado[ultimaProfesion];
        if (profesion.matriculacion[profesion.matriculacion.length - 1].fin > new Date()) {
          resultado['numeroMatricula'] = profesion.matriculacion[profesion.matriculacion.length - 1].matriculaNumero;
          resultado['profesion'] = profesion.profesion.nombre;
        }
      }
    } else {
      if (profesional.formacionGrado?.length) {
        const ultimaProfesion = profesional.formacionGrado.length - 1;
        const profesion = profesional.formacionGrado[ultimaProfesion];
        if (profesion.matriculacion[profesion.matriculacion.length - 1].fin > new Date()) {
          resultado['numeroMatricula'] = profesion.matriculacion[profesion.matriculacion.length - 1].matriculaNumero;
          resultado['profesion'] = profesion.profesion.nombre;
        }
      }
    }
    return resultado;
  }


  verificarUsuario() {
    this.usuariosHttp.find({ documento: this.profesional.documento }).subscribe(user => {
      if (user.length) {
        this.existeUsuario = true;
      } else {
        this.existeUsuario = false;
      }
    })
  }

  agregarPermisos() {
    this.profesionalService.actualizarProfesional({ id: this.profesional.id, documento: this.profesional.documento, inscripcion: true }).subscribe(res => {
      console.log('actualizo')
    })
  }
}
