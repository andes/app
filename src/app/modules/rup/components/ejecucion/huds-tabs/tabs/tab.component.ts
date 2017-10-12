import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 1em;
      background: white;
    }   
  `],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input() tabTitle: String = '';
  @Input() active = false;
  @Input() class: String = '';
}
