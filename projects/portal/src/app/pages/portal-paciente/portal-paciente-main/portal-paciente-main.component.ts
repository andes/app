import { Component, Output, EventEmitter, ElementRef } from '@angular/core';
@Component({
    selector: 'pdp-portal-paciente-main',
    templateUrl: './portal-paciente-main.html',
})
export class PortalPacienteMainComponent {

    public width = 0;
    public hoy = Date();

    // Oculta filtros
    public valorFiltros = true;

    // Expande sidebar
    public sidebarValue = 9;

    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private el: ElementRef
    ) { }

    enviarFiltros() {
        this.valorFiltros = !this.valorFiltros;
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return (this.width > 780);
    }

}
