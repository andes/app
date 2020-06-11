import { Directive, OnInit } from '@angular/core';
import { PlexTextComponent, PlexTextToolBar } from '@andes/plex';

@Directive({
    selector: '[rup-text-modal]'
})
export class RUPTextModalDirective implements OnInit {

    public qlToolbar: PlexTextToolBar[] = [{
        name: 'fullscreen',
        handler: () => {
            console.log('TESTING');
        }
    }];

    constructor(private plexText: PlexTextComponent) { }

    ngOnInit() {
        debugger;
        this.plexText.qlToolbar = this.qlToolbar;
    }
}
