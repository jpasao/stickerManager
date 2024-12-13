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
import { Select2Module, Select2Data, Select2UpdateEvent } from 'ng-select2-component';

import { InvalidDirective } from '../../../shared/invalid.directive';
import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { StickerRepositoryService } from '../../../shared/services/network/sticker-repository.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { Sticker } from '../../../interfaces/sticker.model';
import { Tag } from '../../../interfaces/tag.model';
import { Dependency } from '../../../interfaces/dependency.model';
import { ErrorMessage } from '../../../interfaces/error.model';
import { ResponseTypes, Operations, Entities } from '../../../shared/enums.model';

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
    NgIf,
    Select2Module
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  receivedSticker: Sticker = this.defaults.StickerObject();
  tags: Select2Data = [];
  stickerTags: number[] = [];
  isEditing: boolean;
  stickerEditForm!: FormGroup;
  savePlaceholder: string;
  formValidated: boolean = false;
  dependencies!: Dependency[];
  saving: boolean = false;

  constructor(
    private stickerRepository: StickerRepositoryService,
    private tagRepository: TagRepositoryService,
    private router: Router, 
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private toast: ToastrService) {
    const receivedData = this.router.getCurrentNavigation()?.extras.state as Sticker || {};
    const hasData = Object.keys(receivedData).length > 0;
    if (hasData) {
      this.receivedSticker.IdSticker = receivedData['IdSticker'];
      this.receivedSticker.StickerName = receivedData['StickerName'];
      this.receivedSticker.Tag = receivedData['Tag'];
    }
    this.isEditing = hasData;
    this.savePlaceholder = this.isEditing ? 'Editar' : 'Nueva';
  } 
  
  ngOnInit(): void {
    this.getTags();
    this.stickerEditForm = this.formBuilder.group({ 
      name: [this.receivedSticker.StickerName, [Validators.required]],
      tag: [this.receivedSticker.Tag]
      });   
  }

  get form() { return this.stickerEditForm.controls; }

  private getTags = () => {
    this.tagRepository
      .getTags(this.defaults.TagObject())
      .subscribe(response => {
        this.tags = response.map((tag) => {
          return {
            value: tag.IdTag,
            label: tag.TagName
          }
        });
        if (this.receivedSticker.Tag[0] !== null) {
          this.stickerTags = this.receivedSticker.Tag.map((tag) => tag.IdTag);
        }
      });
  }

  handleCreateTag(event: Select2UpdateEvent<any>) {
    if (event === null || event.value.value.length === 0) return;
    const tagName = event.value.value;
    const tagToSave: Tag = {
      IdTag: 0,
      TagName: tagName
    };
    this.tagRepository
      .createTag(tagToSave)
      .subscribe({
        next: (response) => {
          let message: string = `La etiqueta '${tagName}' se ha guardado correctamente`;
          const toatsTitle = 'Guardando etiqueta';
          
          if (response < ResponseTypes.SOME_CHANGES) {
            message = `Ha habido un problema al crear la etiqueta '${tagName}'`;
            this.toast.warning(message, toatsTitle);
          } else {
            this.toast.success(message, toatsTitle);          
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.tag);
          this.toast.error(errorTexts.Message, errorTexts.Title);
        }
      });
  }

  onSubmit() {
    const name = this.form['name'].value;
    const tags = this.form['tag'].value;
    this.formValidated = name.length !== 0;
    if (name.length === 0) {
      return;
    }
    const tagsToSave = tags.length > 0
      ? tags.map((tag: number) => {
        return { IdTag: tag, TagName: '' }
      })
      : [this.defaults.TagObject()];
    const stickerToSave: Sticker = {
      IdSticker: this.isEditing ? this.receivedSticker.IdSticker : 0,
      StickerName: this.form['name'].value,
      Tag: tagsToSave
    };
    this.saving = true;
    if (this.isEditing) {
      this.stickerRepository
        .updateSticker(stickerToSave)
        .subscribe({
          next: (response) => {
            this.handleResponse(response)
          },
          error: (err) => {
            const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.sticker);
            this.toast.error(errorTexts.Message, errorTexts.Title);
          }
        });
    } else {
      this.stickerRepository
        .createSticker(stickerToSave)
        .subscribe({
          next: (response) => {
            this.handleResponse(response)
          },
          error: (err) => {
            const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.sticker);
            this.toast.error(errorTexts.Message, errorTexts.Title);
          }
        });
    }
  }

  handleResponse(result: number) {
    let message: string = `La pegatina '${this.form['name'].value}' se ha guardado correctamente`;
    const toatsTitle = 'Guardando pegatina';
    
    if (result < ResponseTypes.SOME_CHANGES) {
      message = `Ha habido un problema al editar la pegatina '${this.form['name'].value}'`;
      this.toast.warning(message, toatsTitle);
    } else {
      this.toast.success(message, toatsTitle);
      this.router.navigate(['/stickers/search']);
    }
  }

  getWidth() {
    return this.isEditing ? '8' : '10';
  }
}
