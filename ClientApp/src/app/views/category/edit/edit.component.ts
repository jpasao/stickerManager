import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

import { 
  CardComponent, CardHeaderComponent, CardBodyComponent,
  ButtonDirective, ButtonGroupComponent,
  TableDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective, FormFeedbackComponent,
  TextColorDirective,
  InputGroupComponent, InputGroupTextDirective
} from '@coreui/angular';
import { Select2Module, Select2Option, Select2UpdateEvent } from 'ng-select2-component';

import { InvalidDirective } from '../../../shared/invalid.directive';
import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { CategoryRepositoryService } from '../../../shared/services/network/category-repository.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { Category } from '../../../interfaces/category.model';
import { Tag } from '../../../interfaces/tag.model';
import { Dependency } from '../../../interfaces/dependency.model';
import { ColorClasses, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { ErrorMessage } from '../../../interfaces/error.model';
import { ShowToastService } from '../../../shared/services/show-toast.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent,
    ButtonDirective, ButtonGroupComponent,
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
  receivedCategory!: Category;
  isEditing: boolean;
  categoryEditForm!: FormGroup;
  savePlaceholder: string;
  formValidated: boolean = false;
  dependencies!: Dependency[];
  saving: boolean = false;
  tags: Select2Option[] = [];
  categoryTags: number[] = [];

  constructor(
    private repository: CategoryRepositoryService,
    private tagRepository: TagRepositoryService,
    private router: Router, 
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private toast: ShowToastService) {
    this.receivedCategory = this.defaults.CategoryObject();
    const receivedData = this.router.getCurrentNavigation()?.extras.state as Category || {};
    const hasData = Object.keys(receivedData).length > 0;
    if (hasData) {
      this.receivedCategory.IdCategory = receivedData['IdCategory'];
      this.receivedCategory.CategoryName = receivedData['CategoryName'];
      this.receivedCategory.Tag = receivedData['Tag'];
      this.getDependencies(this.receivedCategory);
    }
    this.isEditing = hasData;
    this.savePlaceholder = this.isEditing ? 'Editar' : 'Nueva';
  }

  ngOnInit(): void {
    this.categoryEditForm = this.formBuilder.group({ 
      name: [this.receivedCategory.CategoryName, [Validators.required]], 
      tag: [this.receivedCategory.Tag] });
    this.getTags();
  }

  get form() { return this.categoryEditForm.controls; }

  onSubmit() {
    const name = this.form['name'].value;
    const tags = this.form['tag'].value;
    this.formValidated = name.length !== 0;
    if (name.length === 0) {
      return;
    }
    const tagsToSave = tags.length > 0
    ? tags.map((tag: any) => {
      let num = tag;
      if (isNaN(parseInt(num.toString()))) {
        num = this.tags.find(element => element.label === num)?.value;
      }
      return { IdTag: num, TagName: '' }
    })
    : [this.defaults.TagObject()];
    const categoryToSave: Category = {
      IdCategory: this.isEditing ? this.receivedCategory.IdCategory : 0,
      CategoryName: this.form['name'].value,
      Tag: tagsToSave
    };
    this.saving = true;
    if (this.isEditing) {
      this.repository
        .updateCategory(categoryToSave)
        .subscribe({
          next: (response) => {
            this.handleResponse(response)
          },
          error: (err) => {
            const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.category);
            this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
          }
        });
    } else {
      this.repository
        .createCategory(categoryToSave)
        .subscribe({
          next: (response) => {
            this.handleResponse(response)
          },
          error: (err) => {
            const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.category);
            this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
          }
        });
    }
  }
  private getTags = () => {
    this.tagRepository
      .getTags(this.defaults.TagObject())
      .subscribe({
        next: (response) => {
          this.tags = response.map((tag) => {
            return {
              value: tag.IdTag,
              label: tag.TagName
            }
          });
          if (this.receivedCategory.Tag[0] !== null) {
            this.categoryTags = this.receivedCategory.Tag.map((tag) => tag.IdTag);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
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
          const toastTitle = 'Guardando etiqueta';

          if (response < ResponseTypes.SOME_CHANGES) {
            message = `Ha habido un problema al crear la etiqueta '${tagName}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          } else {
            this.toast.show(toastTitle, message, ColorClasses.info);
            this.tags.forEach(tag => {
              if (tag.value === tagName) {
                tag.value = response;
              }
            });
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  handleResponse(result: number) {
    let message: string = `La categoría '${this.form['name'].value}' se ha guardado correctamente`;
    const toastTitle = 'Guardando categoría';

    if (result < ResponseTypes.SOME_CHANGES) {
      message = `Ha habido un problema al editar la categoría '${this.form['name'].value}'`;
      this.toast.show(toastTitle, message, ColorClasses.warning);
    } else {
      this.toast.show(toastTitle, message, ColorClasses.info);
      this.router.navigate(['/categories/search']);
    }
  }

  getDependencies(category: Category) {
    this.repository
      .getDependencies(category)
      .subscribe(response => {
        this.dependencies = response;
      })
  }

  getWidth() {
    return this.isEditing ? '8' : '10';
  }
}
