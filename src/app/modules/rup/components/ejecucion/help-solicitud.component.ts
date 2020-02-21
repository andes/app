import { Input, Component } from '@angular/core';

@Component({
    selector: 'help-solicitud',
    templateUrl: './help-solicitud.html',
})
export class HelpSolicitudComponent {
    @Input() solicitud: any;
}
