const track = document.getElementById('imageTrack');
const nextBtn = document.getElementById('nextBtn');

let index = 0;
const imageWidth = 530; 
const maxIndex = 5;    

nextBtn.addEventListener('click', () => {
  if (index < maxIndex) {
    index++;
    
    track.style.transform = `translateX(-${index * imageWidth}px)`;
  } else {
    
    index = 0;
    track.style.transform = `translateX(0px)`;
  }
});
