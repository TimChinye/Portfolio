import { type NavigationDirection } from '../../shared/Navbar/config';

type ProgressBarEvents = {
  start: [direction: NavigationDirection];
  finish: []; // No arguments for the 'finish' event
};

type Listener<T extends unknown[]> = (...args: T) => void;

/**
 * A type-safe, generic event emitter class.
 */
class EventEmitter<Events extends Record<string, unknown[]>> {
  private events: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event]!.push(listener);

    // Return a function to unsubscribe
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter(l => l !== listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    if (!this.events[event]) return;
    this.events[event]!.forEach(listener => listener(...args));
  }
}

export const progressBarEvents = new EventEmitter<ProgressBarEvents>();