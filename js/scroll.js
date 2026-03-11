export function initScroll(updateMap){

const sections = document.querySelectorAll("section")

const progressBar = document.getElementById("progress-bar")

const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(!entry.isIntersecting) return

const step = parseInt(entry.target.dataset.step)

updateMap(step)

progressBar.style.width = (step/4)*100 + "%"

})

},{threshold:0.6})

sections.forEach(s=>observer.observe(s))

}