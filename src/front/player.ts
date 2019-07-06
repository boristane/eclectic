import * as d3 from "d3";

let isPlaying: boolean;
const audioElt = document.getElementById("player") as HTMLAudioElement;
const visualPlayer = document.getElementById("visual-player") as HTMLDivElement;

export function playOrPause(track, isPause: boolean) {
  d3.selectAll(".play-button").text("▶");
  audioElt.src = audioElt.src === track.preview_url ? audioElt.src : track.preview_url;
  if (isPause) {
    audioElt.pause();
    isPlaying = false;
  } else {
    audioElt.play();
    isPlaying = true;
  }
  animate();
  updateVisualPlayer(track);
}

function animate() {
  const fps = 5;
  let now;
  let then = Date.now();
  const interval = 1000 / fps;
  let delta;
  function renderFrame() {
    if (!isPlaying) return;
    const anim = requestAnimationFrame(renderFrame);
    now = Date.now();
    delta = now - then;
    if (delta > interval) {
      then = now - (delta % interval);
      const bars = document.querySelectorAll(".visualasation-bar");
      bars.forEach((bar: HTMLDivElement) => {
        const h = Math.random() * 35;
        bar.style.height = `${h}px`;
        bar.style.marginTop = `${0.5 * (45 - h)}px`;
      });
    }
    return anim;
  }
  return renderFrame();
}

function updateVisualPlayer(track) {
  visualPlayer.style.opacity = "0.5";
  const image = document.getElementById("visual-player-photo") as HTMLImageElement;
  const title = document.getElementById("visual-player-title") as HTMLDivElement;
  const artist = document.getElementById("visual-player-artist") as HTMLDivElement;

  image.src = track.album.images[0].url;
  let t: string = track.name;
  let a: string = track.artists.map(artist => artist.name).join(", ");
  if (t.length > 20) t = t.substring(0, 20) + "...";
  if (a.length > 25) a = a.substring(0, 25) + "...";
  title.textContent = t;
  artist.textContent = a;
}

visualPlayer.addEventListener("click", e => {
  if (isPlaying) {
    audioElt.pause();
  } else {
    audioElt.play();
  }
  isPlaying = !isPlaying;
  animate();
});
