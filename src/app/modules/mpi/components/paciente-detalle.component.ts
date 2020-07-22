import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { ObraSocialService } from '../../../services/obraSocial.service';
import { IObraSocial } from '../../../interfaces/IObraSocial';
import { ObraSocialCacheService } from '../../../services/obraSocialCache.service';
import { Observable } from 'rxjs';
import { PacienteService } from '../../../core/mpi/services/paciente.service';

@Component({
    selector: 'paciente-detalle',
    templateUrl: 'paciente-detalle.html',
    styleUrls: ['paciente-detalle.scss']
})
export class PacienteDetalleComponent implements OnInit {
    @Input() orientacion: 'vertical' | 'horizontal' = 'vertical';
    @Input() paciente: IPaciente;
    @Input() fields: string[] = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado'];
    @Input() reload: Boolean = false;

    obraSocial: IObraSocial;
    token$: Observable<string>;

    get showSexo() {
        return this.fields.findIndex(i => i === 'sexo') >= 0;
    }

    get showFechaNacimiento() {
        return this.fields.findIndex(i => i === 'fechaNacimiento') >= 0;
    }

    get showEdad() {
        return this.fields.findIndex(i => i === 'edad') >= 0;
    }

    get showCuil() {
        return this.fields.findIndex(i => i === 'cuil') >= 0;
    }

    get showFinanciador() {
        return this.fields.findIndex(i => i === 'financiador') >= 0;
    }

    get showNumeroAfiliado() {
        return this.fields.findIndex(i => i === 'numeroAfiliado') >= 0;
    }

    get showDireccion() {
        return this.fields.findIndex(i => i === 'direccion') >= 0;
    }

    get showTelefono() {
        return this.fields.findIndex(i => i === 'telefono') >= 0;
    }

    get estadoBadgeType() {
        return this.paciente.estado === 'validado' ? 'success' : 'warning';
    }

    get direccion() {
        if (this.paciente.direccion && this.paciente.direccion.length > 0) {
            const dir = this.paciente.direccion[0];
            const dirLegal = this.paciente.direccion[1];
            let texto = '';
            if (dir.valor) {
                texto = this.paciente.direccion[0].valor as string;
            }
            if (dirLegal && dirLegal.valor) {
                texto += '\n' + '(Legal: ' + dirLegal.valor + ')';
            }
            if (dir.ubicacion.localidad) {
                if (texto.length > 0) {
                    texto += ', ';
                }
                texto = texto + dir.ubicacion.localidad.nombre;
            }
            return texto;
        }
        return 'Sin dirección';
    }

    get contacto() {
        if (this.paciente.contacto && this.paciente.contacto.length > 0) {
            const contacto = this.paciente.contacto[0];
            return contacto.valor ? contacto.valor : 'Sin contacto';
        }
        return 'Sin contacto';
    }

    get numeroAfiliado() {
        return this.obraSocial && this.obraSocial.numeroAfiliado;
    }

    get financiadorLabel() {
        if (this.obraSocial && this.obraSocial.financiador === 'SUMAR') {
            return 'Financiador';
        }
        return 'Obra Social';
    }

    constructor(
        private obraSocialService: ObraSocialService,
        private obraSocialCacheService: ObraSocialCacheService,
        private pacienteService: PacienteService
    ) {
    }

    ngOnInit() {
    }

    // tslint:disable-next-line: use-lifecycle-interface
    ngOnChanges() {
        this.loadObraSocial();
        if (this.reload) {
            this.pacienteService.getById(this.paciente.id).subscribe(result => {
                this.paciente = result;
            });
        }
    }

    // TODO: Eliminar este metodo y utilizar el financiador que viene en el paciente (una vez que se agregue en el multimatch)
    loadObraSocial() {
        this.obraSocial = {
            id: '',
            tipoDocumento: '',
            dni: 0,
            transmite: '',
            nombre: '',
            codigoFinanciador: 0,
            financiador: ' ',
            version: new Date(),
            numeroAfiliado: '',
        };
        if (!this.paciente || !this.paciente.documento) {
            this.obraSocialCacheService.setFinanciadorPacienteCache(null);
            return;
        }
        if (this.paciente.financiador && this.paciente.financiador.length > 0 && this.paciente.financiador[0].nombre) {
            this.obraSocial = this.paciente.financiador[0] as any;
            this.obraSocialCacheService.setFinanciadorPacienteCache(this.obraSocial);
            return;
        }
        this.obraSocialService.getObrasSociales(this.paciente.documento).subscribe(resultado => {
            if (resultado.length > 0) {
                this.obraSocial = resultado[0];
                this.obraSocialCacheService.setFinanciadorPacienteCache(this.obraSocial);
            } else {
                this.obraSocial = null;
                this.obraSocialCacheService.setFinanciadorPacienteCache(null);
            }
        });
    }
}
