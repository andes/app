import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab',
  template: `
    <div [hidden]="!active" class="pane pt-3 pb-3 bg-white">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input() tabTitle: String = '';
  @Input() active = false;
  @Input() class: String = '';
}
