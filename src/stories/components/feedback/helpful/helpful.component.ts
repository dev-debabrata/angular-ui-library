import { Component, computed, input, model, numberAttribute, output, signal } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export type HelpfulVote = 'yes' | 'no';

/** Looks of the widget */
export const HELPFUL_VARIANTS = ['default', 'inline', 'pill', 'glass', 'gradient'] as const;
export type HelpfulVariant = (typeof HELPFUL_VARIANTS)[number];

/** How the user answers */
export const HELPFUL_MODES = ['thumbs', 'emoji', 'stars'] as const;
export type HelpfulMode = (typeof HELPFUL_MODES)[number];

/** "Was this helpful?" widget: one click records the vote, locks the buttons and shows the counts */
@Component({
  selector: 'np-helpful',
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

  /** Look: default (card), inline (one row, no box), pill (rounded bar), glass (frosted) or gradient */
  readonly variant = input<HelpfulVariant>('default');
  /** Answer with thumbs (yes/no), emoji (3 faces) or stars (1 to 5) */
  readonly mode = input<HelpfulMode>('thumbs');
  /** The user's rating in emoji (1–3) and stars (1–5) modes, 0 for none. Supports [(rating)] two-way binding */
  readonly rating = model(0);
  /** Placeholder of a comment box shown after a no vote or a low rating; empty for none */
  readonly followUp = input('');
  /** Message shown after voting */
  readonly thanks = input('Thanks for your feedback!');
  /** Emits when the user rates in emoji or stars mode */
  readonly rated = output<number>();
  /** Emits the follow-up comment when it's sent */
  readonly commented = output<string>();

  /** Emoji mode faces and their labels, rating 1 to 3 */
  protected readonly faces = ['😞', '😐', '😍'];
  protected readonly faceLabels = ['Not helpful', 'Okay', 'Loved it'];
  protected readonly hovered = signal(0);
  protected readonly sent = signal(false);

  protected readonly counts = computed(() => ({
    yes: this.yesCount() + (this.vote() === 'yes' ? 1 : 0),
    no: this.noCount() + (this.vote() === 'no' ? 1 : 0),
  }));

  /** Show the follow-up box: a negative answer and nothing sent yet */
  protected readonly asking = computed(() => {
    const low = this.rating() > 0 && this.rating() <= (this.mode() === 'stars' ? 2 : 1);
    return !!this.followUp() && !this.sent() && (this.vote() === 'no' || low);
  });

  protected cast(vote: HelpfulVote) {
    if (this.vote()) return;
    this.vote.set(vote);
    this.voted.emit(vote);
  }
}
