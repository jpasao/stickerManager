import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { cilPencil, cilTrash, cilFeaturedPlaylist } from '@coreui/icons';
import {
  CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective,
  ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
  FormSelectDirective,
  TableDirective, TableColorDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective,
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { Select2Module, Select2UpdateEvent, Select2Option } from 'ng-select2-component';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { StickerRepositoryService } from '../../../shared/services/network/sticker-repository.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { PhotoRepositoryService } from '../../../shared/services/network/photo-repository.service';
import { ColorClasses, EndPoints, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { Sticker } from './../../../interfaces/sticker.model';
import { Tag } from '../../../interfaces/tag.model';
import { StickerFilter } from '../../../interfaces/sticker-filter.model';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';
import { StickerFilterComponent } from '../../../components/sticker-filter/sticker-filter.component';
import { ErrorMessage } from '../../../interfaces/error.model';
import { ShowToastService } from '../../../shared/services/show-toast.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective,
    ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
    FormSelectDirective,
    TableDirective, TableColorDirective,
    RowComponent, ColComponent, 
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule,
    BadgeComponent,
    IconDirective,
    ModalMessageComponent,
    StickerFilterComponent,
    GridPagerComponent,
    NgIf,
    Select2Module
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  stickers: Sticker[] = [];
  tags: Select2Option[] = [];
  stickerToHandle!: Sticker;
  stickerSearch!: Sticker;
  actionIcons = { cilPencil, cilTrash, cilFeaturedPlaylist };
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  @ViewChild(GridPagerComponent) pagerComponent!: GridPagerComponent;
  modalTitle: string = '';
  modalMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedItems: Sticker[] = [];
  itemsPerTable: number[] = [];
  totalItems: number = 0;
  showDetails: boolean = false;
  stickerImage: string = '';
  hasTags: boolean = false;

  constructor(
    private stickerRepository: StickerRepositoryService,
    private tagRepository: TagRepositoryService,
    private photoRepository: PhotoRepositoryService,
    private defaults: DefaultValuesService,
    private router: Router,
    private toast: ShowToastService
  ) { }

  ngOnInit(): void {
    this.stickerToHandle = this.defaults.StickerObject();
    this.getTags();
    this.getStickers();
    this.currentPage = 1;
    this.itemsPerTable = this.defaults.ItemsPerTable;
    this.itemsPerPage = this.defaults.GetItemsPerPage(EndPoints.Sticker);
  }

  getFilters(event: StickerFilter) {
    this.showDetails = false;
    this.stickerToHandle.IdSticker = 0;
    if (event) {
      this.getStickers(event);
    }
  }
  openDetail(sticker: Sticker) {
    this.showDetails = true;
    this.stickerToHandle = sticker;
    this.hasTags = sticker.Tag !== null;
    this.photoRepository
      .getPhotos(sticker)
      .subscribe(response => {
        this.stickerImage = (response !== null && response.length > 0)
          ? `data:image/jpeg;base64,${response[0].StickerImage}`
          : '';
      })
  }
  onEdit(sticker: Sticker) {
    this.router.navigate(['/stickers/save'], { state: sticker });
  }
  openDeleteModal(sticker: Sticker) {
    this.stickerToHandle = sticker;
    this.modalTitle = 'Borrando pegatina';
    this.modalMessage = `Vas a borrar la pegatina '${sticker.StickerName}'. ¿Estás segura?`;
    this.modalComponent.toggleModal();
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.onDelete(this.stickerToHandle);
    }
  }
  onDelete(stickerToDelete: Sticker) {
    let message: string = `La pegatina '${stickerToDelete.StickerName}' se ha borrado correctamente`;
    const toastTitle = 'Borrando pegatina';

    this.stickerRepository
      .deleteSticker(stickerToDelete)
      .subscribe({
        next: (response) => {
          if (response > ResponseTypes.NO_CHANGE) {
            if ((this.stickers.length - 1) % this.itemsPerPage === 0) {
              this.currentPage = 1;
            }
            this.toast.show(toastTitle, message, ColorClasses.info);
            this.getStickers();
          } else {
            message = `Ha habido un problema al borrar la pegatina '${stickerToDelete.StickerName}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.delete, Entities.sticker);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  private getStickers = (sticker: StickerFilter = this.defaults.FilterObject()) => {
    this.stickerRepository
      .getStickers(sticker)
      .subscribe({
        next: (response) => {
          this.stickers = response;
          this.totalItems = response.length;
          this.setPager();
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.sticker);
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
      this.setPager();
    }
  }
  handleChangeTableRows(event: any) {
    let receivedItemsPerPage = event?.target?.value;
    if (isNaN(receivedItemsPerPage)) {
      receivedItemsPerPage = 10;
    }
    this.currentPage = 1;
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString(), EndPoints.Sticker);
    this.itemsPerPage = receivedItemsPerPage;
    this.setPager();
  }
  setPager() {
    this.pagerComponent.setPageNumbers();
    this.pagedItems = this.defaults.GetPagedItems(this.stickers, this.currentPage, this.itemsPerPage);
  }
  getRowColor(sticker: Sticker) {
    if (sticker === undefined || this.stickerToHandle === undefined) return '';
    return sticker.IdSticker === this.stickerToHandle.IdSticker ? 'info' : ''
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
