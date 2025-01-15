import { Component, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  CardComponent, CardHeaderComponent, CardBodyComponent,
  ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
  FormSelectDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective
} from '@coreui/angular';
import { Select2Module, Select2UpdateEvent, Select2Option } from 'ng-select2-component';

import { DefaultValuesService } from '../../shared/services/default-values.service';
import { Tag } from '../../interfaces/tag.model';
import { CategoryRepositoryService } from '../../shared/services/network/category-repository.service';
import { TagRepositoryService } from '../../shared/services/network/tag-repository.service';
import { ErrorMessage } from '../../interfaces/error.model';
import { ColorClasses, Entities, Operations, ResponseTypes } from '../../shared/enums.model';
import { ShowToastService } from '../../shared/services/show-toast.service';
import { StickerFilter } from '../../interfaces/sticker-filter.model';
import { Category } from '../../interfaces/category.model';

@Component({
  selector: 'app-sticker-filter',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent,
    ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
    FormSelectDirective,
    RowComponent, ColComponent, 
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule,
    Select2Module
  ],
  templateUrl: './sticker-filter.component.html',
  styleUrl: './sticker-filter.component.scss'
})
export class StickerFilterComponent implements OnInit {
  categories: Select2Option[] = [];
  tags: Select2Option[] = [];
  stickerForm!: FormGroup;
  radioForm!: FormGroup;
  filters = output<StickerFilter>();

  constructor(
    private categoryRepository: CategoryRepositoryService,
    private tagRepository: TagRepositoryService,
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private toast: ShowToastService
  ){ }

  ngOnInit(): void {
    this.stickerForm = this.formBuilder.group({name: [""], tag: [""], category: [""]});
    this.radioForm = this.formBuilder.group({field: [""], ascend: [""]});
    this.setFieldValue("name");
    this.setAscendingValue("asc");
    this.getCategoriesList();
    this.getTags();
  }

  get form() { return this.stickerForm.controls; }
  get rForm() { return this.radioForm.controls; }

  onReset() {
    this.stickerForm.reset();
    this.radioForm.reset();
  }
  setFieldValue(value: string): void {
    this.radioForm.patchValue({ field: value });
  }
  setAscendingValue(value: string): void {
    this.radioForm.patchValue({ ascend: value });
  }
  getFilters() {
    const selectedCategories = this.form['category'].value;
    let categoryObject: Category[] = [this.defaults.CategoryObject()];
    if (selectedCategories && selectedCategories.length) {
      categoryObject = selectedCategories.map((category: string) => {
        return {
          IdCategory: category,
          CategoryName: ''
        }
      });
    }
    const selectedTags = this.form['tag'].value;
    let tagObject: Tag[] = [this.defaults.TagObject()];
    if (selectedTags && selectedTags.length) {
      tagObject = selectedTags.map((tag: string) => {
        return {
          IdTag: tag,
          TagName: ''
        }
      });
    }
    const selectedFilters: StickerFilter = {
      Start: 0,
      Size: 10,
      OrderByName: this.rForm['field'].value === 'name',
      Ascending: this.rForm['ascend'].value === 'asc',
      Sticker: {
        IdSticker: 0,
        StickerName: this.form['name'].value || '',
        Category: categoryObject,
        Tag: tagObject,
      }
    };
    this.filters.emit(selectedFilters);
  }
  private getCategoriesList = () => {
    this.categoryRepository
      .getCategories(this.defaults.CategoryObject())
      .subscribe({
        next: (response) => {
          this.categories = response.map((category) => {
            return {
              value: category.IdCategory,
              label: category.CategoryName
            }
          });
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.category);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
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
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  handleCreateCategory(event: Select2UpdateEvent<any>) {
    if (event === null || event.value.value.length === 0) return;
    const categoryName = event.value.value;
    const categoryToSave: Category = {
      IdCategory: 0,
      CategoryName: categoryName,
      Tag: []
    };
    this.categoryRepository
      .createCategory(categoryToSave)
      .subscribe({
        next: (response) => {
          let message: string = `La categoría '${categoryName}' se ha guardado correctamente`;
          const toastTitle = 'Guardando categoría';

          if (response < ResponseTypes.SOME_CHANGES) {
            message = `Ha habido un problema al crear la categoría '${categoryName}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          } else {
            this.toast.show(toastTitle, message, ColorClasses.info);
            this.categories.forEach(category => {
              if (category.value === categoryName) {
                category.value = response;
              }
            });
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.category);
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
}
