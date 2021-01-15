import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { FechaPipe } from 'projects/shared/src/lib/pipes/fecha.pipe';

@Component({
  selector: 'app-ficha-epidemiologica',
  templateUrl: './ficha-epidemiologica.component.html'
})
export class FichaEpidemiologicaComponent implements OnInit {
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
    private plex: Plex
  ) { }

  ngOnInit(): void {
    this.plex.updateTitle([
      { route: '/', name: 'EPIDEMIOLOGIA' },
      { name: 'Ficha epidemiológica' }
    ]);
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
}
