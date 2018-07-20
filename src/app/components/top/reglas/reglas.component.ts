import { ProfesionalService } from './../../../services/profesional.service';
import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { ReglaService } from '../../../services/top/reglas.service';

@Component({
  selector: 'reglas',
  templateUrl: './reglas.component.html',
  styleUrls: ['./reglas.component.css']
})
export class ReglasComponent implements OnInit {
  organizacionDestino = this.auth.organizacion;
  prestacionDestino;
  reglas = [];
  constructor(
    private auth: Auth,
    private plex: Plex,
    private servicioPrestacion: TipoPrestacionService,
    private servicioProfesional: ProfesionalService,
    private servicioReglas: ReglaService
  ) { }

  ngOnInit() {
  }

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

  cargarReglas() {
    let query: any = {};
    this.reglas = [];
    query.idDestino = this.organizacionDestino.id;
    if (this.prestacionDestino && this.prestacionDestino.conceptId) {
      query.prestacionDestino = this.prestacionDestino.conceptId;
    }
    this.servicioReglas.get(query).subscribe((reglas: any) => {
      console.log('reglas ', reglas);
      this.reglas = reglas;
    });
  }

  expand() {
    console.log('expando');
  }

}
