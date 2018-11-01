import { OrganizacionService } from './../../../services/organizacion.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { Component, Output, EventEmitter, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { ReglaService } from '../../../services/top/reglas.service';

@Component({
  selector: 'reglas',
  templateUrl: './reglas.component.html',
  styleUrls: ['./reglas.component.css']
})
export class ReglasComponent {
  @HostBinding('class.plex-layout') layout = true;
  organizacionDestino = this.auth.organizacion;
  prestacionDestino;
  prestacionOrigen;
  reglas: any = [];
  prestaciones = [];
  auditable = false;
  reglaActiva = -1;
  regla: any = {};
  prestacionActiva = -1;
  prestacion = {};
  organizacion;
  constructor(
    private auth: Auth,
    private plex: Plex,
    private servicioPrestacion: TipoPrestacionService,
    private servicioProfesional: ProfesionalService,
    private servicioOrganizacion: OrganizacionService,
    private servicioReglas: ReglaService
  ) { }

  @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

  loadTipoPrestaciones(event) {
    this.servicioPrestacion.get({ turneable: 1 }).subscribe((data) => {
      let dataF = data.filter(x => {
        return this.auth.check('turnos:planificarAgenda:prestacion:' + x.id);
      });
      event.callback(dataF);
    });
  }

  loadProfesionales(event) {
    if (event.query) {
      let query = {
        nombreCompleto: event.query
      };
      this.servicioProfesional.get(query).subscribe(event.callback);
    } else {
      event.callback([]);
    }
  }

  loadOrganizaciones(event) {
    if (event.query) {
      this.servicioOrganizacion.get({}).subscribe(event.callback);
    } else {
      event.callback([]);
    }
  }

  cargarReglas() {
    let query: any = {};
    this.limpiarForm();
    query.organizacionDestino = this.organizacionDestino.id;
    if (this.prestacionDestino && this.prestacionDestino.conceptId) {
      query.prestacionDestino = this.prestacionDestino.conceptId;
      this.servicioReglas.get(query).subscribe((reglas: any) => {
        this.reglas = reglas;
      });
    }
  }

  addOrganizacion() {
    if (this.organizacion && this.prestacionDestino) {
      const longitud = this.reglas.length;
      let destino = {
        organizacion: {
          nombre: this.organizacionDestino.nombre,
          id: this.organizacionDestino.id
        },
        prestacion: this.prestacionDestino
      };
      let origen = {
        organizacion: {
          nombre: this.organizacion.nombre,
          id: this.organizacion.id
        },
      };
      this.reglas.push({
        destino: destino,
        origen: origen
      });
      this.activarRegla(longitud);
      this.organizacion = null;
    } else {
      const mensaje = this.prestacionDestino ? 'Debe seleccionar la organización de origen' : 'Debe seleccionar la prestación destino';
      this.plex.info('info', mensaje);
    }
  }

  deleteOrganizacion(indice) {
    this.reglas.splice(indice, 1);
  }

  addPrestacion() {
    this.prestaciones = [];
    if (this.regla.origen.prestaciones) {
      this.prestaciones = this.regla.origen.prestaciones;
    }
    this.auditable = this.regla.origen.auditable;
    if (this.prestacionOrigen) {
      this.prestaciones.push({ prestacion: this.prestacionOrigen, auditable: this.auditable });
      this.regla.origen.prestaciones = this.prestaciones;
      this.prestacionOrigen = null;
    } else {
      this.plex.info('info', 'Debe seleccionar la prestación origen');
    }
  }

  deletePrestacion(indice) {
    this.regla.origen.prestaciones.splice(indice, 1);
  }


  activarRegla(indice) {
    this.reglaActiva = indice;
    this.regla = this.reglas[indice];
  }

  activarPrestacion(indice) {
    this.prestacionActiva = indice;
    this.prestacion = (this.regla as any).origen.prestaciones[indice];
  }

  limpiarForm() {
    this.reglas = [];
    this.reglaActiva = -1;
    this.regla = {};
  }

  cancelar() {
    this.cancel.emit();
  }

  onSave($event) {
    let condiciones = false;
    if (this.reglas && this.reglas.length > 0) {
      condiciones = this.reglas.every(regla => regla.destino && regla.destino.organizacion && regla.destino.prestacion
        && regla.destino && regla.origen.organizacion && regla.origen.prestaciones && regla.origen.prestaciones.length > 0);
    }
    if (condiciones) {
      let data = {
        reglas: this.reglas
      };
      let operation = this.servicioReglas.save(data);
      operation.subscribe((resultado) => {
        this.plex.toast('success', 'Las reglas se guardaron correctamente');
        this.limpiarForm();
        this.prestacionDestino = {};
      });
    } else {
      this.plex.info('info', 'Debe completar los datos de las reglas');

    }
  }

}
