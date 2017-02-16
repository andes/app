import { Component } from '@angular/core';
import { IPaciente } from './../../interfaces/IPaciente';
import { PacienteCreateUpdateComponent } from './paciente-create-update.component';
import {
} from '@angular/common';


@Component({
  selector: 'pacientes',
  templateUrl: 'paciente.html'

})

export class PacienteComponent {
  selectedPaciente: any;
  showcreateupdate: boolean = false;

  constructor() {
  }


  seleccionar(objPaciente: IPaciente) {
      this.showcreateupdate = true;
      this.selectedPaciente = objPaciente;
  }

  onReturn(objPaciente: IPaciente): void {
      this.showcreateupdate = false;
      this.selectedPaciente = null;
  }

}
