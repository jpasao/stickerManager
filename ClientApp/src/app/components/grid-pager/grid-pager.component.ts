import { Component, input, OnInit, output, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PageItemDirective, PageLinkDirective, PaginationComponent } from '@coreui/angular';

@Component({
  selector: 'app-grid-pager',
  standalone: true,
  imports: [PageItemDirective, PageLinkDirective, PaginationComponent, RouterLink, NgIf],
  templateUrl: './grid-pager.component.html',
  styleUrl: './grid-pager.component.scss'
})
export class GridPagerComponent implements OnInit{
  items = input<any[]>([]);
  itemsPerPage = input<number>(10);
  totalItems = input<number>(0);
  currentPage = input<number>(1);
  pageNumber = output<number>();
  pageNumbers: number[] = [];
  innerItemsPerPage: number = 10;
  innerTotalItems: number = 0;
  show: boolean = false;

  ngOnInit(): void {
    this.innerItemsPerPage = this.itemsPerPage();
    this.innerTotalItems = this.totalItems();
    this.setPageNumbers();
  }

  setPageNumbers(): void {
    this.pageNumbers = [];
    for (let i = 1; i <= Math.ceil(this.innerTotalItems / this.innerItemsPerPage); i++) {
      this.pageNumbers.push(i);
    }
    this.show = this.innerTotalItems > this.innerItemsPerPage;
  }

  setCurrentPage(page: any) {
    let pageNumber: number = 0;
    switch (page) {
      case 'P': pageNumber = this.currentPage() - 1; break;
      case 'N': pageNumber = this.currentPage() + 1; break;
      default: pageNumber = page; break;
    }
    this.pageNumber.emit(pageNumber);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemsPerPage']) this.innerItemsPerPage = changes['itemsPerPage'].currentValue;
    if (changes['totalItems']) this.innerTotalItems = changes['totalItems'].currentValue;
    this.setPageNumbers();
  } 
}
