import { Component, input, output } from '@angular/core';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalToggleDirective
} from '@coreui/angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonDirective, ModalComponent, ModalHeaderComponent, ModalTitleDirective, ButtonCloseDirective, ModalBodyComponent, ModalFooterComponent, ModalToggleDirective],
  templateUrl: './modal-message.component.html',
  styleUrl: './modal-message.component.scss'
})
export class ModalMessageComponent {
  visible = false;
  title = input<string>('');
  message = input<string>('');
  dialogResponse = output<boolean>();

  handleDialogResponse(response: boolean) {
    this.dialogResponse.emit(response);
  }
  toggleModal() {
    this.visible = !this.visible;
  }
}
