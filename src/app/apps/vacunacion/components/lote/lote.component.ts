import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VacunasService } from 'src/app/services/vacunas.service';
import { Plex } from '@andes/plex';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
})
export class LoteComponent implements OnInit {
  public vacunaSelected: any;
  public showSidebar = false;
  public vacunas$: Observable<any[]>;
  public lotes$: Observable<any[]>;
  public lote;
  public lote2;
  public vacunasEncontradas;
  public creando = false;
  public columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      sorteable: true,
      opcional: false
    }
  ];
  public loteSelected =
    {
      codigo: '',
      descripcion: '',
      habilitado: true,
      vacuna: null
    };

  constructor(
    private vacunasService: VacunasService,
    private plex: Plex
  ) { }

  ngOnInit(): void {
    this.vacunas$ = this.vacunasService.getNomivacVacunas({ habilitado: true, calendarioNacional: 'NO', sort: 'nombre' }).pipe(
      map(vacunas => {
        return vacunas.map((v) => {
          return { _id: v._id, codigo: v.codigo, nombre: v.nombre, snomed_conceptId: v.snomed_conceptId };
        });
      })
    );
  }

  showInSideBar(vacuna) {
    if (vacuna) {
      this.loteSelected.vacuna = vacuna;
      this.vacunaSelected = vacuna;
      this.showSidebar = true;
      this.loadLote();
    }
  }

  loadLote() {
    this.lote = null;
    this.lotes$ = this.vacunasService.getNomivacLotes({ habilitado: true, sort: 'codigo' }).pipe(
      map(lot => {
        if (this.vacunaSelected) {
          this.lote = lot.filter(l => (this.vacunaSelected.codigo === l.vacuna.codigo));
          return this.lote;
        }
      })
    );
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  crearLote() {
    this.creando = true;
  }

  cerrar() {
    this.creando = false;
  }

  guardar() {

    this.lote2 = this.lote.find(l => (this.loteSelected.codigo.toUpperCase() === l.codigo.toUpperCase()));
    if (this.lote2 === undefined) {
      this.vacunasService.guardarNomivacLotes(this.loteSelected).subscribe(resultado => {
        if (resultado) {
          this.plex.toast('success', 'Lote creado con éxito.');
          this.cerrar();
        } else {
          this.plex.toast('danger', 'A ocurrido un error y no se pudo crear el nuevo lote, intentelo nuevamente.');
        }
      });
    } else {
      this.plex.toast('danger', 'El lote ya existe.');
    }
  }
}
