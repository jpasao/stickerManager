import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgIf } from '@angular/common';

import {
  CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, BorderDirective,
  ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
  FormSelectDirective,
  TableDirective, TableColorDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective, FormCheckLabelDirective,
  ContainerComponent
} from '@coreui/angular';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { PhotoRepositoryService } from '../../../shared/services/network/photo-repository.service';
import { ColorClasses, EndPoints, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';
import { ErrorMessage } from '../../../interfaces/error.model';
import { ShowToastService } from '../../../shared/services/show-toast.service';
import { Photo } from '../../../interfaces/photo.model';
import { Gallery } from '../../../interfaces/gallery.model';
import { Select2Module, Select2UpdateEvent, Select2Option  } from 'ng-select2-component';
import { Tag } from '../../../interfaces/tag.model';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, BorderDirective,
    ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
    FormSelectDirective,
    TableDirective, TableColorDirective,
    RowComponent, ColComponent,
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, FormCheckLabelDirective,
    GridPagerComponent,
    NgIf,
    ContainerComponent,
    Select2Module
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit{
  images: Photo[] = [];
  tags: Select2Option[] = [];
  stickerForm!: FormGroup;
  submitted = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerTable: number[] = [];
  totalItems: number = 0;
  @ViewChild(GridPagerComponent) pagerComponent!: GridPagerComponent;
  radioForm = new UntypedFormGroup({
    field: new UntypedFormControl('field'),
    ascend: new UntypedFormControl('ascend')
  });
  constructor(
    private photoRepository: PhotoRepositoryService,
    private tagRepository: TagRepositoryService,
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private toast: ShowToastService
  ){ }

  ngOnInit(): void {
    this.stickerForm = this.formBuilder.group({name: [""], tag: [""]});
    this.itemsPerPage = this.defaults.GetItemsPerPage(EndPoints.Thumbnail);
    this.countPhotos();
    this.getTags();
    this.onSubmit();
    this.itemsPerTable = this.defaults.ItemsPerTable;
  }

  get form() { return this.stickerForm.controls; }

  private countPhotos() {
    this.photoRepository
      .countPhotos()
      .subscribe({
        next: (response) => this.totalItems = response[0],
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.photo);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  setFieldValue(value: string): void {
    this.radioForm.patchValue({ field: value });
  }
  setAscendingValue(value: string): void {
    this.radioForm.patchValue({ ascend: value });
  }
  onSubmit() {
    this.submitted = true;
    const selectedTags = this.form['tag'].value;
    let tagObject: Tag[] = [this.defaults.TagObject()];
    if (selectedTags) {
      tagObject = selectedTags.map((tag: string) => {
        return {
          IdTag: tag,
          TagName: ''
        }
      });
    }
    const gallerySearch: Gallery = {
      Start: this.currentPage,
      Size: this.itemsPerPage,
      OrderByName: this.radioForm.controls['field'].value === 'name',
      Ascending: this.radioForm.controls['ascend'].value === 'asc',
      Sticker: {
        IdSticker: 0,
        StickerName: this.form['name'].value || '',
        Tag: tagObject
      }
    }
    this.getThumbnails(gallerySearch);
  }
  onReset() {
    this.submitted = false;
    this.stickerForm.reset();
  }
  private getThumbnails = (filters: Gallery) => {
    this.photoRepository
      .getThumbnails(filters)
      .subscribe({
        next: (response) => {
          this.images = response.map((image) => {
            return {
              IdSticker: 0,
              IdImage: image.IdImage,
              StickerImage: new FormData,
              Src: '',
              StickerThumbnail: `data:image/jpeg;base64,${image.StickerThumbnail}`,
              StickerName: image.StickerName
            }
          });
          this.pagerComponent.setPageNumbers();
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.photo);
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
  handlePageChange(event: number) {
    if (event) {
      this.currentPage = event;
      this.onSubmit();
    }
  }
  handleChangeTableRows(event: any) {
    let receivedItemsPerPage = event?.target?.value;
    if (isNaN(receivedItemsPerPage)) {
      receivedItemsPerPage = 10;
    }
    this.currentPage = 1;
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString(), EndPoints.Thumbnail);
    this.itemsPerPage = receivedItemsPerPage;
    this.pagerComponent.setPageNumbers();
    this.onSubmit();
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
