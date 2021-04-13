import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';

@Component({
  selector: 'listado-perinatal',
  templateUrl: './listado-perinatal.component.html'
})
export class ListadoPerinatalComponent implements OnInit {
  public fechaDesdeEntrada;
  public fechaHastaEntrada;
  public paciente;
  public fechaCita;
  public fechaUltimoControl;
  public columns = [
    {
      key: 'paciente',
      label: 'Paciente',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.paciente.localeCompare(b.paciente)
    },
    {
      key: 'documento',
      label: 'Documento',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.documento.localeCompare(b.documento)
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.telefono.localeCompare(b.telefono)
    },
    {
      key: 'edad',
      label: 'Edad',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.edad.localeCompare(b.edad)
    },
    {
      key: 'ausente',
      label: '',
      sorteable: true,
      opcional: false,
      sort: (a: any, b: any) => a.ausente.localeCompare(b.ausente)
    },
    {
      key: 'fechaCita',
      label: 'Fecha de cita',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.fechaCita.localeCompare(b.fechaCita)
    },
    {
      key: 'ultimoControl',
      label: 'Último control',
      sorteable: false,
      opcional: true,
      sort: (a: any, b: any) => a.ultimoControl.localeCompare(b.ultimoControl)
    }
  ];
  constructor(public router: Router, public plex: Plex) { }

  ngOnInit(): void { }

}
