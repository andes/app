import { ProfesionalService } from './../../../services/profesional.service';
import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';

@Component({
  selector: 'app-reglas',
  templateUrl: './reglas.component.html',
  styleUrls: ['./reglas.component.css']
})
export class ReglasComponent implements OnInit {
  organizacionDestino = this.auth.organizacion;
  auditable = false;
  constructor(
    private auth: Auth,
    private plex: Plex,
    private servicioPrestacion: TipoPrestacionService,
    private servicioProfesional: ProfesionalService
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


}
