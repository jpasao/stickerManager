import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { cilPencil, cilTrash } from '@coreui/icons';
import { CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, TableDirective, RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective } from '@coreui/angular';
import { Tag } from './../../../interfaces/tag.model';
import { DefaultValuesService } from '../../../shared/default-values.service';
import { TagRepositoryService } from './../../../shared/services/tag-repository.service'  
import { IconDirective } from '@coreui/icons-angular';
import { colorClasses } from '../../../shared/enums.model';
import { ToastMessageComponent } from '../../../components/toast/toast-message.component';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { ToastModel } from '../../../interfaces/toast.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, TableDirective, RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, IconDirective, ToastMessageComponent, ModalMessageComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  tags: Tag[] = [];
  tagToHandle!: Tag;
  tagForm!: FormGroup;
  submitted = false;
  actionIcons = { cilPencil, cilTrash };
  @ViewChild(ToastMessageComponent) toastComponent!: ToastMessageComponent;
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  toastColor: string = '';
  toastAutohide: boolean = true;
  toastMessage: string = '';
  modalTitle: string = '';
  modalMessage: string = '';

  constructor(
    private repository: TagRepositoryService, 
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.tagForm = this.formBuilder.group({ name: [""] });
    this.getTags();    
  }

   get form() { return this.tagForm.controls; }

  onSubmit() {
    this.submitted = true;
    const tagSearch: Tag = {
      IdTag: 0,
      TagName: this.form['name'].value || ''
    }
    this.getTags(tagSearch);
  }
  onReset() {
    this.submitted = false;
    this.tagForm.reset();
  }
  onEdit(tag: Tag) {

  }

  openDeleteModal(tag: Tag) {
    this.tagToHandle = tag;
    this.modalTitle = 'Borrar etiqueta';
    this.modalMessage = `Vas a borrar la etiqueta ${tag.TagName}. ¿Estás segura?`;
    this.modalComponent.toggleModal();
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.onDelete(this.tagToHandle);
    }
  }

  onDelete(tagToDelete: Tag) {
    let message: string = 'La etiqueta se ha borrado correctamente';
    let color: string = colorClasses.info;
    this.repository
      .deleteTag(tagToDelete)
      .subscribe(response => {
        if (response > 0) {
          this.getTags();
        } else {
          message = 'ha habido un problema al borrar la etiqueta';
          color = colorClasses.warning;
        }
        const toast: ToastModel = this.defaults.ToastObject(message, color);
        ({ toastColor: this.toastColor, autohide: this.toastAutohide, toastMessage: this.toastMessage } = toast);
        this.toastComponent.toggleToast();
      })
  }

  private getTags = (tag: Tag = this.defaults.tagObject) => {    
    this.repository
      .getTags(tag)
      .subscribe(response => {
        this.tags = response;
      });
  }
}
