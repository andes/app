import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Servicios y modelo
import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'portal-paciente',
    templateUrl: './portal-paciente.html',
    styleUrls: ['./portal-paciente.scss']
})


export class PortalPacienteComponent implements OnInit {

    @ViewChildren('modal') modalRefs: QueryList<PlexModalComponent>;
    public invert = true;
    public width = 0;

    constructor(
        private el: ElementRef,
        private plex: Plex,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit() {
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    openModal(index) { }

}
