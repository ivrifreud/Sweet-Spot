type Pauseable = {
  pause: () => void;
};

export function safePauseVideoPlayer(player: Pauseable): void {
  try {
    player.pause();
  } catch {
    // Native SharedObject is already gone (overlay unmount / Fast Refresh).
  }
}
