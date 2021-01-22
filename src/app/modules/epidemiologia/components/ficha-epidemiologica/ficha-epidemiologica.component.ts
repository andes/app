import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';

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
      key: 'estado',
      label: 'Estado',
      sorteable: false
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sorteable: false
    }
  ];

  constructor(
    private plex: Plex,
    private formsService: FormsService
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

    }
  }

  mostrarFicha(nombreFicha) {
    this.showFicha = nombreFicha;
    console.log(this.showFicha);
    // Mostrar ficha en layout-main
  }
}
