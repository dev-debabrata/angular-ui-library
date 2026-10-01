import { Component, computed, input, model, numberAttribute, output } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export type HelpfulVote = 'yes' | 'no';

/** "Was this helpful?" widget: one click records the vote, locks the buttons and shows the counts */
@Component({
  selector: 'nex-helpful',
  imports: [IconComponent],
  templateUrl: './helpful.html',
  styleUrl: './helpful.css',
})
export class HelpfulComponent {
  /** The question */
  readonly question = input('Was this helpful?');

  /** Text of the yes button */
  readonly yesLabel = input('Yes, helpful');

  /** Text of the no button */
  readonly noLabel = input('Not really');

  /** Earlier yes votes (the user's vote is added on top) */
  readonly yesCount = input(0, { transform: numberAttribute });

  /** Earlier no votes */
  readonly noCount = input(0, { transform: numberAttribute });

  /** The user's vote. Supports [(vote)] two-way binding */
  readonly vote = model<HelpfulVote | null>(null);

  /** Emits when the user votes */
  readonly voted = output<HelpfulVote>();

  protected readonly counts = computed(() => ({
    yes: this.yesCount() + (this.vote() === 'yes' ? 1 : 0),
    no: this.noCount() + (this.vote() === 'no' ? 1 : 0),
  }));

  protected cast(vote: HelpfulVote) {
    if (this.vote()) return;
    this.vote.set(vote);
    this.voted.emit(vote);
  }
}
