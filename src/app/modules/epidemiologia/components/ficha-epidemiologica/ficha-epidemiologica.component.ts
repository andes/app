import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
  selector: 'app-ficha-epidemiologica',
  templateUrl: './ficha-epidemiologica.component.html'
})
export class FichaEpidemiologicaComponent implements OnInit {
  fichaSelected = {};
  itemsDropdownFichas = [];
  public showFicha = null;
  public showLabel = true;
  public pacienteSelected = null;
  public resultadoBusqueda = null;
  public fichasPaciente: Observable<any>;
  public fichaPaciente$: Observable<any>;
  public permisoHuds = false;

  public columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      sorteable: true
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sorteable: true
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sorteable: false
    }
  ];

  constructor(
    private plex: Plex,
    private formsService: FormsService,
    private formEpidemiologiaService: FormsEpidemiologiaService,
    private router: Router,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    this.plex.updateTitle([
      { route: '/', name: 'EPIDEMIOLOGIA' },
      { name: 'Ficha epidemiológica' }
    ]);

    this.formsService.search().subscribe(fichas => {
      fichas.forEach(element => {
        this.itemsDropdownFichas.push({
          'label': element.name, handler: () => {
            this.mostrarFicha(element.name);
          }
        });
      });
    });
    this.permisoHuds = this.auth.check('huds:visualizacionHuds');
  }

  ruteo(id) {
    this.router.navigate(['/huds/paciente/', id]);
  }

  searchStart() {
    this.showLabel = false;
  }

  searchEnd(resultado) {
    if (resultado.err) {
      this.plex.info('danger', resultado.err);
      return;
    }
    this.resultadoBusqueda = resultado.pacientes;
  }

  onSearchClear() {
    this.resultadoBusqueda = [];
    this.pacienteSelected = '';
    this.showLabel = true;
  }

  onSelect(paciente: IPaciente): void {
    if (paciente) {
      this.pacienteSelected = paciente;
      this.fichasPaciente = this.formEpidemiologiaService.search({ paciente: this.pacienteSelected._id });
    }
  }

  mostrarFicha(nombreFicha, ficha?) {
    this.fichaPaciente$ = of(null);
    if (ficha) {
      this.fichaPaciente$ = of(ficha);
    }
    this.showFicha = nombreFicha;

  }

  volver() {
    this.showFicha = null;
    this.pacienteSelected = null;
    this.resultadoBusqueda = [];
  }
}
