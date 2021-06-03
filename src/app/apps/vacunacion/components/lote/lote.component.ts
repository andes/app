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
  public lotes2$: Observable<any[]>;
  public loteEncontrado;
  public lote2;
  public vacunasEncontradas;
  public creando = false;
  public seEncuentra = false;

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
    this.vacunas$ = this.vacunasService.getNomivacVacunas({
      habilitado: true,
      calendarioNacional: 'NO',
      sort: 'nombre'
    });
  }

  showInSideBar(vacuna) {
    if (vacuna) {
      this.limpiarForm();
      vacuna.id = vacuna._id;
      this.loteSelected.vacuna = vacuna;
      this.vacunaSelected = vacuna;
      this.showSidebar = true;
      this.loadLote();
    }
  }

  loadLote() {
    this.lotes$ = this.vacunasService.getNomivacLotes({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  crearLote() {
    this.creando = true;
  }

  cerrar() {
    this.creando = false;
    this.limpiarForm();
  }

  limpiarForm() {
    this.loteSelected.codigo = '';
    this.loteSelected.descripcion = '';
  }

  guardar() {
    this.seEncuentra = false;
    this.lotes$.subscribe(lotes => {
      this.seEncuentra = lotes.some(lote => lote.codigo.toUpperCase() === this.loteSelected.codigo.toUpperCase());
      if (this.seEncuentra) {
        this.plex.toast('danger', 'El lote que esta creando ya existe.');
      } else {
        this.vacunasService.guardarNomivacLotes(this.loteSelected).subscribe(resultado => {
          if (resultado) {
            this.plex.toast('success', 'Lote creado con éxito.');
            this.cerrar();
          }
        });
      }
    });
  }
}
