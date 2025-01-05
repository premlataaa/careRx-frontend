const hamburger = document.querySelector(".hamburger");
const navPages = document.getElementById("nav-pages");

hamburger.addEventListener("click",()=>{
    navPages.classList.toggle('show');
});

const slides = document.querySelectorAll(".slide"); 
var counter = 0;

// Position each slide
slides.forEach((slide, index) => {
    slide.style.left = `${index * 100}%`;
});

const goPrev = () => {
    if (counter > 0) {
        counter--;
        slideImage();
    }
};

const goNext = () => {
   if(counter<slides.length-1){
    counter++;
    slideImage();
   } 
};

const slideImage = () => {
    slides.forEach((slide) => {
        slide.style.transform = `translateX(-${counter * 100}%)`;
    });
};