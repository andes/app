import { Component, Input, OnInit } from '@angular/core';
import { FormsService } from '../../../forms-builder/services/form.service';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';


@Component({
  selector: 'app-ficha-covid',
  templateUrl: './ficha-covid.component.html'
})
export class FichaCovidComponent implements OnInit {
  @Input() paciente: IPaciente;

  public fields = [];
  public fieldSelected;
  public organizaciones$: Observable<any>;
  public secciones = [];
  public seccionUsuario = [];
  public seccionMpi = [];
  public seccionClasificacion = [];
  public laFicha = {};

  constructor(
    private formsService: FormsService,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    this.seccionUsuario[0] = { nombre: 'Usuario' };
    this.seccionMpi[0] = { nombre: 'Mpi' };
    this.seccionClasificacion[0] = { nombre: 'Clasificacion' };
    this.organizaciones$ = this.auth.organizaciones();
    this.formsService.search({ name: 'covid19' }).subscribe((ficha: any) => {
      this.fields = ficha[0].fields;
      this.fields.map(field => {
        field.sections.map(section => {
          switch (section.id) {
            case 'usuario':
              this.seccionUsuario.push(field);
              break;
            case 'mpi':
              this.seccionMpi.push(field);
              break;
            case 'clasificacion':
              this.seccionClasificacion.push(field);
              break;
          }
        })
      });
      this.secciones.push(this.seccionUsuario);
      this.secciones.push(this.seccionMpi);
      this.secciones.push(this.seccionClasificacion);
    });
  }

  saveFicha(nuevaFicha) {
    let keys = Object.keys(nuevaFicha);
    keys.map(key => {
      this.laFicha[key] = nuevaFicha[key];
    })
    console.log(this.laFicha);

  }

}
