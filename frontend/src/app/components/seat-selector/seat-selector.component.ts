import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

interface SeatVm {
  label: string;
  available: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-seat-selector',
  templateUrl: './seat-selector.component.html',
  styleUrls: ['./seat-selector.component.scss']
})
export class SeatSelectorComponent implements OnChanges {
  @Input() totalSeats = 0;
  @Input() availableSeats = 0;
  @Input() selectedSeats: string[] = [];
  @Output() selectedSeatsChange = new EventEmitter<string[]>();

  seats: SeatVm[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalSeats'] || changes['availableSeats'] || changes['selectedSeats']) {
      this.buildSeats();
    }
  }

  toggleSeat(seat: SeatVm): void {
    if (!seat.available) {
      return;
    }

    const updated = seat.selected
      ? this.selectedSeats.filter((entry) => entry !== seat.label)
      : [...this.selectedSeats, seat.label];

    this.selectedSeats = updated;
    this.selectedSeatsChange.emit(updated);
    this.buildSeats();
  }

  trackSeat(_index: number, seat: SeatVm): string {
    return seat.label;
  }

  private buildSeats(): void {
    const safeTotal = Math.max(this.totalSeats, 0);
    const safeAvailable = Math.max(Math.min(this.availableSeats, safeTotal), 0);

    this.seats = Array.from({ length: safeTotal }, (_, index) => {
      const label = `S${index + 1}`;
      return {
        label,
        available: index < safeAvailable,
        selected: this.selectedSeats.includes(label)
      };
    });
  }
}
