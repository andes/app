import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'espacio-fisico',
    templateUrl: 'espacio-fisico.html',
})

export class EspacioFisicoComponent implements OnInit {
    showupdate = false;
    espaciosFisicos: IEspacioFisico[];
    searchForm: FormGroup;
    selectedEspacioFisico: IEspacioFisico;
    value: any;
    skip = 0;
    finScroll = false;
    tengoDatos = true;
    loader = false;

    constructor(private formBuilder: FormBuilder, private espacioFisicoService: EspacioFisicoService) { }

    ngOnInit() {
        // Crea el formulario reactivo
        this.searchForm = this.formBuilder.group({
            nombre: [''],
            descripcion: [''],
            activo: ['']
        });
        // Genera la busqueda con el evento change.
        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            this.value = value;
            this.skip = 0;
            this.loadEspaciosFisicos(false);

        });
        this.loadEspaciosFisicos();
    }

    loadEspaciosFisicos(concatenar: boolean = false) {
        let parametros = {
            'descripcion': this.value && this.value.descripcion,
            'nombre': this.value && this.value.nombre,
            'activo': this.value && this.value.activo,
            'skip': this.skip
        };

        this.espacioFisicoService.get(parametros).subscribe(
            espaciosFisicos => {
                if (concatenar) {
                    if (espaciosFisicos.length > 0) {
                        this.espaciosFisicos = this.espaciosFisicos.concat(espaciosFisicos);
                    } else {
                        this.finScroll = true;
                        this.tengoDatos = false;
                    }
                } else {
                    this.espaciosFisicos = espaciosFisicos;
                    this.finScroll = false;
                }

                this.loader = false;
            }); // Bind to view
    }

    /*      this.espacioFisicoService.get(parametros)
              .subscribe(
              espaciosFisicos => this.espaciosFisicos = espaciosFisicos, // Bind to view
              err => {
                  if (err) {
                      console.log(err);
                  }
              });
      }*/

    onReturn(espacioFisico: IEspacioFisico): void {
        this.showupdate = false;
        this.selectedEspacioFisico = null;
        this.loadEspaciosFisicos();
    }

    onDisable(espacioFisico: IEspacioFisico) {
        this.espacioFisicoService.disable(espacioFisico)
            .subscribe(dato => this.loadEspaciosFisicos(), // Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEnable(espacioFisico: IEspacioFisico) {
        this.espacioFisicoService.enable(espacioFisico)
            .subscribe(dato => this.loadEspaciosFisicos(), // Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    activate(objEspacioFisico: IEspacioFisico) {

        if (objEspacioFisico.activo) {

            this.espacioFisicoService.disable(objEspacioFisico)
                .subscribe(datos => this.loadEspaciosFisicos());  // Bind to view
        } else {
            this.espacioFisicoService.enable(objEspacioFisico)
                .subscribe(datos => this.loadEspaciosFisicos());  // Bind to view
        }
    }

    onEdit(espacioFisico: IEspacioFisico) {
        this.showupdate = true;
        this.selectedEspacioFisico = espacioFisico;
    }

}
