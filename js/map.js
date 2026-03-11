export function initMap(){

var map = L.map('map',{
 zoomControl:false,
 attributionControl:false,
 scrollWheelZoom:false,
 dragging:false
}).setView([28,50],4)

L.tileLayer(
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
).addTo(map)

return map
}


export function updateMap(step){

if(step === 1){

map.flyTo([32,53],5,{duration:1.6})

}

if(step === 2){

map.flyTo([30,50],4.5,{duration:1.6})

}

if(step === 3){

map.flyTo([18,60],3.5,{duration:1.8})

}

if(step === 4){

map.flyTo([26.5,56.5],7,{duration:1.8})

}

}