import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IContacto } from 'src/app/interfaces/IContacto';
import { BarrioService } from '../../../../../../src/app/services/barrio.service';
import { LocalidadService } from '../../../../../../src/app/services/localidad.service';
import { ProvinciaService } from '../../../../../../src/app/services/provincia.service';
import * as enumerados from '../../../../../../src/app/utils/enumerados';
import { PacientePortalService } from '../../../../src/app/services/paciente-portal.service';

@Component({
  selector: 'pdp-mis-datos-personales',
  templateUrl: './mis-datos-personales.component.html'
})
export class PDPMisDatosPersonalesComponent implements OnInit {

  tipoComunicacion: any[];
  editarContacto = false;
  crearContacto = false;
  listadoContacto = true;
  posicionContacto;
  esContactoTelefonico = true;
  viveenneuquen = false;
  provinciaNeuquen = null;
  localidadNeuquen = null;

  contacto: IContacto = {
    tipo: 'celular',
    valor: '',
    ranking: 0,
    activo: true,
    ultimaActualizacion: new Date()
  };

  contactoNuevo: IContacto = {
    tipo: 'celular',
    valor: '',
    ranking: 0,
    activo: true,
    ultimaActualizacion: new Date()
  };

  contactos: IContacto[] = [];
  public provincias$: Observable<any>;
  public localidades$: Observable<any>;
  public barrios$: Observable<any>;
  public paciente;
  patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
  patronContactoAlfabetico = /^[-\w.%+]{1,61}@[a-z]+(.[a-z]+)+$/;

  constructor(private plex: Plex, private provinciaService: ProvinciaService, private localidadService: LocalidadService, private barrioService: BarrioService, private auth: Auth, private pacienteService: PacientePortalService) { }

  ngOnInit(): void {
    const idPaciente = this.auth.mobileUser.pacientes[0].id;

    this.tipoComunicacion = enumerados.getObjTipoComunicacion();

    // Cargo todas las provincias
    this.provincias$ = this.provinciaService.get({}).pipe(
      cache()
    );

    // Busco la provincia de Neuquén
    this.provinciaService.get({
      nombre: 'Neuquén'
    }).subscribe(Prov => {
      this.provinciaNeuquen = Prov[0];
    });

    // Busco la localidad de Neuquén
    this.localidadService.get({
      nombre: 'Neuquén'
    }).subscribe(Loc => {
      this.localidadNeuquen = Loc[0];
    });

    this.pacienteService.getById(idPaciente).subscribe(paciente => {
      this.paciente = paciente;
      this.contactos = this.paciente?.contacto;
      this.viveenneuquen = (paciente?.direccion[0].ubicacion.provincia.id === this.provinciaNeuquen.id && paciente?.direccion[0].ubicacion.localidad.id === this.localidadNeuquen.id) ? true : false;
      if (this.viveenneuquen) {
        this.barrios$ = this.barrioService.getXLocalidad(paciente?.direccion[0].ubicacion.localidad.id).pipe(
          cache()
        );
      }
      this.loadLocalidades(paciente?.direccion[0].ubicacion.provincia);
    });
  }

  // DATOS DE CONTACTO
  edicionContacto(contacto, pos) {
    this.editarContacto = true;
    this.crearContacto = false;
    this.listadoContacto = false;
    this.contacto.tipo = contacto.tipo;
    this.contacto.valor = contacto.valor;
    this.posicionContacto = pos;
    this.esContactoTelefonico = this.contactoTelefonico(contacto.tipo);
  }

  removerContacto(pos) {
    this.contactos.splice(pos, 1);
  }

  creacionContacto() {
    this.crearContacto = true;
    this.editarContacto = false;
    this.listadoContacto = false;
    this.contactoNuevo.valor = null;
  }

  volverListado() {
    this.crearContacto = false;
    this.editarContacto = false;
    this.listadoContacto = true;
  }

  guardarContacto(c) {
    if (this.patronContactoAlfabetico.test(this.contactoNuevo.valor) || this.patronContactoNumerico.test(this.contactoNuevo.valor)) {
      const tipoContacto = this.contactoNuevo.tipo.id ? this.contactoNuevo.tipo.id : this.contactoNuevo.tipo;

      const nuevoContacto: IContacto = {
        tipo: tipoContacto,
        valor: this.contactoNuevo.valor,
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
      };

      this.contactos.push(nuevoContacto);
      this.listadoContacto = true;
      this.crearContacto = false;
    } else {
      this.plex.info('warning', 'Verifique los datos ingresados por favor.');
    }
  }

  editContacto() {
    if (this.patronContactoAlfabetico.test(this.contacto.valor) || this.patronContactoNumerico.test(this.contacto.valor)) {
      this.contactos[this.posicionContacto].tipo = this.contacto.tipo.id ? this.contacto.tipo.id : this.contacto.tipo;
      this.contactos[this.posicionContacto].valor = this.contacto.valor;
      this.listadoContacto = true;
      this.editarContacto = false;
    } else {
      this.plex.info('warning', 'Verifique los datos ingresados por favor.');
    }
  }

  limpiarCampo(tipo) {
    this.esContactoTelefonico = this.contactoTelefonico(tipo);
    this.crearContacto ? this.contactoNuevo.valor = null : this.contacto.valor = null;
  }

  contactoTelefonico(tipo) {
    return (tipo === 'fijo' || tipo?.id === 'fijo' || tipo === 'celular' || tipo?.id === 'celular') ? true : false;
  }

  // DATOS DE DOMICILIO REAL

  loadLocalidades(provincia) {
    if (provincia && provincia.id) {
      if (provincia.id !== this.provinciaNeuquen.id) {
        this.viveenneuquen = false;
        this.paciente.direccion[0].ubicacion.localidad = null;
        this.paciente.direccion[0].ubicacion.barrio = null;
      }
      this.localidades$ = this.localidadService.getXProvincia(provincia.id).pipe(
        cache()
      );
    } else {
      this.viveenneuquen = false;
    }
  }

  loadBarrios(localidad) {
    if (localidad && localidad.id) {
      if (localidad.id !== this.localidadNeuquen.id) {
        this.viveenneuquen = false;
        this.paciente.direccion[0].ubicacion.barrio = null;
      } else {
        this.viveenneuquen = true;
      }
      this.barrios$ = this.barrioService.getXLocalidad(localidad.id).pipe(
        cache()
      );
    } else {
      this.viveenneuquen = false;
    }
  }

  cambiarNeuquen() {
    if (this.viveenneuquen) {
      this.paciente.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
      this.paciente.direccion[0].ubicacion.localidad = this.localidadNeuquen;
      this.loadBarrios(this.localidadNeuquen);
    } else {
      this.paciente.direccion[0].ubicacion.provincia = null;
      this.paciente.direccion[0].ubicacion.localidad = null;
      this.paciente.direccion[0].ubicacion.barrio = null;
    }
  }

  save() {
    this.pacienteService.save(this.paciente).pipe(
      catchError((err) => {
        this.plex.info('warning', err);
        return null;
      }),
    ).subscribe(() => {
      this.plex.info('success', 'Los datos han sido actualizados correctamente.');
    });
  }

}
