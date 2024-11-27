import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, TableDirective, RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, FormFeedbackComponent, TextColorDirective, InputGroupComponent, InputGroupTextDirective, } from '@coreui/angular';

import { InvalidDirective } from '../../../shared/invalid.directive';
import { Tag } from '../../../interfaces/tag.model';
import { DefaultValuesService } from '../../../shared/default-values.service';
import { TagRepositoryService } from '../../../shared/services/tag-repository.service';
import { ColorClasses, ResponseTypes } from '../../../shared/enums.model';
import { ToastModel } from '../../../interfaces/toast.model';
import { ToastMessageComponent } from '../../../components/toast/toast-message.component';
import { NgIf } from '@angular/common';
import { Dependency } from '../../../interfaces/dependency.model';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, TableDirective, RowComponent, ColComponent, FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, FormFeedbackComponent, TextColorDirective, InputGroupComponent, InputGroupTextDirective, ToastMessageComponent, InvalidDirective, NgIf],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  receivedTag: Tag = this.defaults.tagObject();
  isEditing: boolean;
  tagEditForm!: FormGroup;
  savePlaceholder: string;
  formValidated: boolean = false;
  @ViewChild(ToastMessageComponent) toastComponent!: ToastMessageComponent;
  toastColor: string = '';
  toastAutohide: boolean = true;
  toastMessage: string = '';
  dependencies!: Dependency[];

  constructor(
    private repository: TagRepositoryService,
    private router: Router, 
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder) {
    const receivedData = this.router.getCurrentNavigation()?.extras.state;
    if (receivedData) {
      this.receivedTag.IdTag = receivedData['IdTag'];
      this.receivedTag.TagName = receivedData['TagName'];
      this.getDependencies(this.receivedTag);
    }
    this.isEditing = !!receivedData;
    this.savePlaceholder = this.isEditing ? 'Editar' : 'Nueva';
  } 
  
  ngOnInit(): void {
    this.tagEditForm = this.formBuilder.group({ name: [this.receivedTag.TagName, [Validators.required]] });   
  }

  get form() { return this.tagEditForm.controls; }

  onSubmit() {
    const name = this.form['name'].value;
    this.formValidated = name.length !== 0;
    if (name.length === 0) {
      return;
    }
    const tagToSave: Tag = {
      IdTag: this.isEditing ? this.receivedTag.IdTag : 0,
      TagName: this.form['name'].value
    };
    if (this.isEditing) {
      this.repository
        .updateTag(tagToSave)
        .subscribe(response => {
          this.handleResponse(response)
        });
    } else {
      this.repository
        .createTag(tagToSave)
        .subscribe(response => {
          this.handleResponse(response)
        });
    }
  }

  handleResponse(result: number) {
    let message: string = 'La etiqueta se ha guardado correctamente';
    let color: string = ColorClasses.info;
    
    if (result < ResponseTypes.SOME_CHANGES) {
      message = 'Ha habido un problema al editar la etiqueta';
      color = ColorClasses.warning;
    }
    const toast: ToastModel = this.defaults.ToastObject(message, color);
    ({ toastColor: this.toastColor, autohide: this.toastAutohide, toastMessage: this.toastMessage } = toast);
    this.toastComponent.toggleToast();

    this.router.navigate(['/tags/search']);
  }

  getDependencies(tag: Tag) {
    this.repository
      .getDependencies(tag)
      .subscribe(response => {
        this.dependencies = response;
      })
  }
}
