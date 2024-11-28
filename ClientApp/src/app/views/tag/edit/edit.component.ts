import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

import { 
  CardComponent, CardHeaderComponent, CardBodyComponent, 
  ButtonDirective, 
  TableDirective, 
  RowComponent, ColComponent, 
  FormDirective, FormLabelDirective, FormControlDirective, FormFeedbackComponent, 
  TextColorDirective, 
  InputGroupComponent, InputGroupTextDirective 
} from '@coreui/angular';
import { ToastrService } from 'ngx-toastr';

import { InvalidDirective } from '../../../shared/invalid.directive';
import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { Tag } from '../../../interfaces/tag.model';
import { Dependency } from '../../../interfaces/dependency.model';
import { ResponseTypes } from '../../../shared/enums.model';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, 
    ButtonDirective, 
    TableDirective, 
    RowComponent, ColComponent, 
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, FormFeedbackComponent, 
    TextColorDirective, 
    InputGroupComponent, InputGroupTextDirective, 
    InvalidDirective, 
    NgIf
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  receivedTag: Tag = this.defaults.TagObject();
  isEditing: boolean;
  tagEditForm!: FormGroup;
  savePlaceholder: string;
  formValidated: boolean = false;
  dependencies!: Dependency[];
  saving: boolean = false;

  constructor(
    private repository: TagRepositoryService,
    private router: Router, 
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private toast: ToastrService) {
    const receivedData = this.router.getCurrentNavigation()?.extras.state as Tag || {};
    const hasData = Object.keys(receivedData).length > 0;
    if (hasData) {
      this.receivedTag.IdTag = receivedData['IdTag'];
      this.receivedTag.TagName = receivedData['TagName'];
      this.getDependencies(this.receivedTag);
    }
    this.isEditing = hasData;
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
    this.saving = true;
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
    let message: string = `La etiqueta ${this.form['name'].value} se ha guardado correctamente`;
    const toatsTitle = 'Guardado etiquetas';
    
    if (result < ResponseTypes.SOME_CHANGES) {
      message = `Ha habido un problema al editar la etiqueta ${this.form['name'].value}`;
      this.toast.warning(message, toatsTitle);
    } else {
      this.toast.success(message, toatsTitle);
      this.router.navigate(['/tags/search']);
    }
  }

  getDependencies(tag: Tag) {
    this.repository
      .getDependencies(tag)
      .subscribe(response => {
        this.dependencies = response;
      })
  }
}
