import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import {
  CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, BorderDirective,
  ButtonDirective,
  FormSelectDirective,
  TableDirective, TableColorDirective,
  RowComponent, ColComponent,
  ContainerComponent
} from '@coreui/angular';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { PhotoRepositoryService } from '../../../shared/services/network/photo-repository.service';
import { ColorClasses, EndPoints, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';
import { ErrorMessage } from '../../../interfaces/error.model';
import { ShowToastService } from '../../../shared/services/show-toast.service';
import { Photo } from '../../../interfaces/photo.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, BorderDirective,
    ButtonDirective,
    FormSelectDirective,
    TableDirective, TableColorDirective,
    RowComponent, ColComponent,
    FormsModule,
    GridPagerComponent,
    NgIf,
    ContainerComponent
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit{
  images: Photo[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  showPager: boolean = false;
  itemsPerTable: number[] = [];
  totalItems: number = 0;

  constructor(
    private photoRepository: PhotoRepositoryService,
    private defaults: DefaultValuesService,
    private toast: ShowToastService
  ){ }

  ngOnInit(): void {
    this.itemsPerPage = this.defaults.GetItemsPerPage(EndPoints.Thumbnail);
    this.countPhotos();
    this.getThumbnails(1, this.itemsPerPage);
    this.itemsPerTable = this.defaults.ItemsPerTable;
  }

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

  private getThumbnails = (start: number, size: number) => {
    const startNumber: number = ((start - 1) * size) + 1 || 1;
    const sizeNumber: number = size || 10;
    this.photoRepository
      .getThumbnails(startNumber, sizeNumber)
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
          this.showPager = this.totalItems > this.itemsPerPage;
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.photo);
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
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString(), EndPoints.Thumbnail);
    this.itemsPerPage = receivedItemsPerPage;
    this.setPager();
  }
  setPager() {
    this.getThumbnails(this.currentPage, this.itemsPerPage);
    this.showPager = this.totalItems > this.itemsPerPage;
  }
}
