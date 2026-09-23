export type PlaybackPhase =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'seeking'
  | 'playing'
  | 'firstFrame'
  | 'error'
  | 'fallback'
  | 'disposed';

export type PlaybackState = {
  generation: number;
  phase: PlaybackPhase;
  duration: number | null;
  sought: boolean;
  muted: boolean;
  showPoster: boolean;
};

export type PlaybackEvent =
  | { type: 'request'; generation: number; muted: boolean }
  | { type: 'status'; generation: number; status: 'loading' | 'readyToPlay' | 'error'; duration?: number }
  | { type: 'sourceLoad'; generation: number; duration?: number }
  | { type: 'firstFrame'; generation: number }
  | { type: 'playing'; generation: number }
  | { type: 'timeout'; generation: number }
  | { type: 'dispose'; generation: number };

export type PlaybackCommand = {
  ignore: boolean;
  seekTo: number | null;
  shouldPlay: boolean;
  muted: boolean | null;
  showPoster: boolean;
  fallback: boolean;
};

const IDLE: PlaybackState = {
  generation: 0,
  phase: 'idle',
  duration: null,
  sought: false,
  muted: true,
  showPoster: true,
};

export function initialPlaybackState(): PlaybackState {
  return { ...IDLE };
}

export function seekOnce(
  duration: number | null,
  sought: boolean,
  resolveSeek: (duration: number) => number | null
): { seekTo: number | null; nextSought: boolean } {
  if (sought || duration == null || duration <= 0) {
    return { seekTo: null, nextSought: sought };
  }
  const seekTo = resolveSeek(duration);
  if (seekTo == null) return { seekTo: null, nextSought: false };
  return { seekTo, nextSought: true };
}

function ignore(state: PlaybackState): { state: PlaybackState; command: PlaybackCommand } {
  return {
    state,
    command: {
      ignore: true,
      seekTo: null,
      shouldPlay: false,
      muted: null,
      showPoster: state.showPoster,
      fallback: state.phase === 'fallback',
    },
  };
}

export function planPlayback(
  state: PlaybackState,
  event: PlaybackEvent,
  resolveSeek: (duration: number) => number | null = () => 0
): { state: PlaybackState; command: PlaybackCommand } {
  if (event.type !== 'request' && event.generation !== state.generation) {
    return ignore(state);
  }

  if (event.type === 'dispose') {
    if (event.generation !== state.generation) return ignore(state);
    return {
      state: { ...state, phase: 'disposed', showPoster: true },
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: null,
        showPoster: true,
        fallback: false,
      },
    };
  }

  if (event.type === 'request') {
    const next: PlaybackState = {
      generation: event.generation,
      phase: 'loading',
      duration: null,
      sought: false,
      muted: event.muted,
      showPoster: true,
    };
    return {
      state: next,
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: event.muted,
        showPoster: true,
        fallback: false,
      },
    };
  }

  if (state.phase === 'disposed') return ignore(state);

  if (event.type === 'timeout') {
    const alreadyPlaying =
      state.phase === 'playing' ||
      state.phase === 'firstFrame' ||
      state.phase === 'seeking' ||
      !state.showPoster;
    if (alreadyPlaying) {
      return {
        state,
        command: {
          ignore: false,
          seekTo: null,
          shouldPlay: false,
          muted: null,
          showPoster: state.showPoster,
          fallback: false,
        },
      };
    }
    const next: PlaybackState = { ...state, phase: 'fallback', showPoster: true };
    return {
      state: next,
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: null,
        showPoster: true,
        fallback: true,
      },
    };
  }

  if (event.type === 'status' && event.status === 'error') {
    const next: PlaybackState = { ...state, phase: 'fallback', showPoster: true };
    return {
      state: next,
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: null,
        showPoster: true,
        fallback: true,
      },
    };
  }

  if (event.type === 'status' && event.status === 'loading') {
    return {
      state: { ...state, phase: 'loading', showPoster: true },
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: state.muted,
        showPoster: true,
        fallback: false,
      },
    };
  }

  const duration =
    event.type === 'status' || event.type === 'sourceLoad'
      ? event.duration && event.duration > 0
        ? event.duration
        : state.duration
      : state.duration;

  if (event.type === 'playing') {
    return {
      state: { ...state, phase: 'playing', showPoster: false },
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: null,
        showPoster: false,
        fallback: false,
      },
    };
  }

  if (event.type === 'firstFrame') {
    if (state.phase !== 'playing' && state.phase !== 'seeking' && state.phase !== 'ready') {
      return ignore(state);
    }
    return {
      state: { ...state, phase: 'firstFrame', showPoster: false },
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: null,
        showPoster: false,
        fallback: false,
      },
    };
  }

  const ready =
    (event.type === 'status' && event.status === 'readyToPlay') || event.type === 'sourceLoad';
  if (!ready) return ignore(state);

  if (duration == null || duration <= 0) {
    return {
      state: { ...state, phase: 'playing', duration },
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: true,
        muted: state.muted,
        showPoster: true,
        fallback: false,
      },
    };
  }

  const seek = seekOnce(duration, state.sought, resolveSeek);
  if (!seek.nextSought && seek.seekTo == null) {
    return {
      state: { ...state, phase: 'ready', duration },
      command: {
        ignore: false,
        seekTo: null,
        shouldPlay: false,
        muted: state.muted,
        showPoster: true,
        fallback: false,
      },
    };
  }

  return {
    state: {
      ...state,
      phase: seek.seekTo != null ? 'seeking' : 'playing',
      duration,
      sought: seek.nextSought,
    },
    command: {
      ignore: false,
      seekTo: seek.seekTo,
      shouldPlay: true,
      muted: state.muted,
      showPoster: true,
      fallback: false,
    },
  };
}
