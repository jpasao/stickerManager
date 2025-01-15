import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { cilFeaturedPlaylist, cilPencil, cilTrash } from '@coreui/icons';
import { 
  CardComponent, CardHeaderComponent, CardBodyComponent,
  ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
  FormSelectDirective,
  TableDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective,
  BadgeComponent
} from '@coreui/angular';
import { Select2Module, Select2UpdateEvent, Select2Option } from 'ng-select2-component';
import { IconDirective } from '@coreui/icons-angular';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { CategoryRepositoryService } from '../../../shared/services/network/category-repository.service';
import { ColorClasses, EndPoints, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { Category } from './../../../interfaces/category.model';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';
import { ShowToastService } from '../../../shared/services/show-toast.service';
import { ErrorMessage } from '../../../interfaces/error.model';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { Tag } from '../../../interfaces/tag.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent,
    ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
    FormSelectDirective,
    TableDirective,
    RowComponent, ColComponent,
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule,
    BadgeComponent,
    IconDirective,
    ModalMessageComponent,
    GridPagerComponent,
    NgIf,
    Select2Module
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit{
  categories: Category[] = [];
  categoryToHandle!: Category;
  categoryForm!: FormGroup;
  submitted = false;
  actionIcons = { cilPencil, cilTrash, cilFeaturedPlaylist };
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  @ViewChild(GridPagerComponent) pagerComponent!: GridPagerComponent;
  modalTitle: string = '';
  modalMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedItems: Category[] = [];
  itemsPerTable: number[] = [];
  showDetails: boolean = false;
  hasTags: boolean = false;
  tags: Select2Option[] = [];

  constructor (
    private repository: CategoryRepositoryService,
    private tagRepository: TagRepositoryService,
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: ShowToastService
  ) { }

  ngOnInit(): void {
    this.categoryForm = this.formBuilder.group({ name: [""], tag: [""] });
    this.getCategoriesList();
    this.getTags();
    this.currentPage = 1;
    this.itemsPerTable = this.defaults.ItemsPerTable;
    this.itemsPerPage = this.defaults.GetItemsPerPage(EndPoints.Category);
  }

  get form() { return this.categoryForm.controls; }

  openDetail(category: Category) {
    this.showDetails = true;
    this.categoryToHandle = category;
    this.hasTags = category.Tag[0] !== null;
  }
  onSubmit() {
    this.submitted = true;
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
    const categorySearch: Category = {
      IdCategory: 0,
      CategoryName: this.form['name'].value || '',
      Tag: tagObject
    }
    this.getCategoriesList(categorySearch);
  }
  onReset() {
    this.submitted = false;
    this.categoryForm.reset();
  }
  onEdit(category: Category) {
    this.router.navigate(['/categories/save'], { state: category });
  }
  openDeleteModal(category: Category) {
    this.categoryToHandle = category;
    this.modalTitle = 'Borrando categoría';
    this.modalMessage = `Vas a borrar la categoría '${category.CategoryName}'. ¿Estás segura?`;
    this.modalComponent.toggleModal();
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.onDelete(this.categoryToHandle);
    }
  }
  onDelete(categoryToDelete: Category) {
    let message: string = `La categoría '${categoryToDelete.CategoryName}' se ha borrado correctamente`;
    const toastTitle = 'Borrando categoría';

    this.repository
      .deleteCategory(categoryToDelete)
      .subscribe({
        next: (response) => {
          if (response > ResponseTypes.NO_CHANGE) {
            if ((this.categories.length - 1) % this.itemsPerPage === 0) {
              this.currentPage = 1;
            }
            this.toast.show(toastTitle, message, ColorClasses.info);
            this.getCategoriesList();
          } else {
            message = `Ha habido un problema al borrar la categoría '${categoryToDelete.CategoryName}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.delete, Entities.category);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  private getCategoriesList = (category: Category = this.defaults.CategoryObject()) => {
    this.repository
      .getCategories(category)
      .subscribe({
        next: (response) => {
          this.categories = response;
          this.setPager();
          this.pagerComponent.setPageNumbers();
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
  handlePageChange(event: number) {
    if (event) {
      this.currentPage = event;
      this.setPager();
    }
  }
  handleChangeTableRows(event: any) {
    let receivedItemsPerPage = event?.target?.value;
    if (isNaN(receivedItemsPerPage)) {
      receivedItemsPerPage = 10;
    }
    this.currentPage = 1;
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString(), EndPoints.Category);
    this.itemsPerPage = receivedItemsPerPage;
    this.pagerComponent.setPageNumbers();
    this.setPager();
  }
  setPager() {
    this.pagedItems = this.defaults.GetPagedItems(this.categories, this.currentPage, this.itemsPerPage);
  }
}
