import { Component, Input, OnInit } from '@angular/core';
import { FormsService } from '../../../forms-builder/services/form.service';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { Plex } from '@andes/plex';


@Component({
  selector: 'app-ficha-covid',
  templateUrl: './ficha-covid.component.html'
})
export class FichaCovidComponent implements OnInit {
  @Input() paciente: IPaciente;
  @Input() fichaPaciente: any;

  public fields = [];
  public fieldSelected;
  public organizaciones$: Observable<any>;
  public secciones = [];
  public ficha = [];

  constructor(
    private formsService: FormsService,
    private formEpidemiologiaService: FormsEpidemiologiaService,
    private plex: Plex,

  ) { }

  ngOnInit(): void {
    this.formsService.search({ name: 'covid19' }).subscribe((ficha: any) => {
      this.secciones = ficha[0].sections;
    });
  }

  saveFicha(nuevaFicha) {
    // registro los datos del usuario
    const buscado = this.ficha.findIndex(seccion => seccion.name === nuevaFicha.seccion);
    if (buscado !== -1) {
      // si ya existe la sección, la reemplazo
      this.ficha[buscado] = { name: nuevaFicha.seccion, fields: nuevaFicha.campos };
    } else {
      this.ficha.push({ name: nuevaFicha.seccion, fields: nuevaFicha.campos })
    }
  }

  registrarFicha() {
    const fichaFinal = {
      type: 'covid19',
      createdAt: new Date(),
      secciones: this.ficha,
      paciente: this.paciente
    }
    if (this.fichaPaciente) {
      this.formEpidemiologiaService.update(this.fichaPaciente._id, fichaFinal).subscribe(
        res => {
          this.plex.toast('success', 'Su ficha fue actualizada correctamente');
        },
        error => {
          this.plex.toast('danger', 'ERROR: La ficha no pudo ser actualizada');
        })
    } else {
      this.formEpidemiologiaService.save(fichaFinal).subscribe(
        res => {
          this.plex.toast('success', 'Su ficha fue registrada correctamente');
        },
        error => {
          this.plex.toast('danger', 'ERROR: La ficha no pudo ser registrada');

        })
    }
  }

}
