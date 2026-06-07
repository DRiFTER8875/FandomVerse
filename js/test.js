const track = document.getElementById('imageTrack');
const nextBtn = document.getElementById('nextBtn');

let index = 0;
const imageWidth = 530; // This must match your CSS image width
const maxIndex = 5;    // 10 total images - 5 visible = 5 shifts possible

nextBtn.addEventListener('click', () => {
  if (index < maxIndex) {
    index++;
    // Move the track to the left
    track.style.transform = `translateX(-${index * imageWidth}px)`;
  } else {
    // Optional: Reset to the beginning if you reach the end
    index = 0;
    track.style.transform = `translateX(0px)`;
  }
});
