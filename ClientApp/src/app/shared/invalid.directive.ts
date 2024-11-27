import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[invalid]',
  standalone: true
})
export class InvalidDirective implements OnInit, OnDestroy {
  subscription$: any;

  @Input("invalid") checkAtFirst: boolean = false;
  constructor(private control: NgControl, private el: ElementRef) { }

  ngOnInit() {
    this.subscription$ = this.control.statusChanges?.subscribe(res => {
      this.el.nativeElement.setCustomValidity(res == "INVALID" ? "error" : "");
    });
    if (this.checkAtFirst && this.control.invalid)
      this.el.nativeElement.setCustomValidity("error");
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
