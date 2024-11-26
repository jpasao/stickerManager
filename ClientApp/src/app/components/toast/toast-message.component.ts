import { Component, input, signal } from '@angular/core';
import { ToasterComponent, ToastComponent, ToastBodyComponent, ButtonCloseDirective } from '@coreui/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToasterComponent, ToastComponent, ToastBodyComponent, ButtonCloseDirective],
  templateUrl: './toast-message.component.html',
  styleUrl: './toast-message.component.scss'
})
export class ToastMessageComponent {
  colorClass = input<string>('');
  message = input<string>('');
  autohide = input<boolean>(true);
  visible = signal(false);

  ngOnInit(): void { }
  
  toggleToast() {
    this.visible.update((value) => !value);
  }
}
