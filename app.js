import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { add } from 'ol/coordinate';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';

let buttonGonder = document.querySelector('#gonder');
let buttonGetir = document.querySelector('#getir');
var form = document.getElementById('myForm');
var okul_adi = document.getElementById('name');
var geom = document.getElementById('geom');

var xmlHttp = new XMLHttpRequest();

// form'un sayfayı refresh ettirmemesi için yazılan function
function handleForm(event) {
    //  console.log('event: ', event);
    event.preventDefault();
}

// form içinde gerçekleşen olayları dinler biz submit olayını dinledik.
form.addEventListener('submit', handleForm);


var rasterLayer = new TileLayer({
    source: new OSM(),  //OpenStreetMap
});

var source = new VectorSource();

var vectorLayer = new VectorLayer({
    source: source,
});



var map = new Map({
    layers: [rasterLayer, vectorLayer],
    target: "map",
    view: new View({
        center: fromLonLat([35.24, 38.96]),
        zoom: 5,
    }),
});

//hangi işaret tipini seçtiğini alıyoruz
var selectedType = document.getElementById("type");
var draw;

var value = selectedType.value;

if (value !== "None") {
    draw = new Draw({
        source: source,
        type: value,
    });
    map.addInteraction(draw);
}

function addInteraction() {

    draw.on("drawend", (arg) => {
        let parser = new GeoJSON();
        let area = parser.writeFeatureObject(arg.feature);
        //console.log(area);   // feature'lar geojson formatında console'a yazdırıldı.

        geom.innerHTML = "Koordinatlar ~ " + area.geometry.coordinates;
        geom.style.display = "flex";
        geom.value = area.geometry.coordinates;

    });

}

selectedType.onchange = function () {
    map.removeInteraction(draw);
    addInteraction();
};

addInteraction();



buttonGonder.addEventListener('click', () => {
    gonder();
})

buttonGetir.addEventListener('click', () => {
    getir();
});


function gonder() {
    //Post request
    xmlHttp.open('POST', 'http://localhost:3000/', true);
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(
        {
            "geom": geom.value,
            "okul_adi": okul_adi.value
        }
    ));

    console.log("geom: ", geom.value, "okul_adi: ", okul_adi.value);
    //  console.log(xmlHttp.responseText);
    return xmlHttp.responseText;
}

function getir() {
    //Get request
    xmlHttp.open('GET', 'http://localhost:3000/', true);
    xmlHttp.send();
    xmlHttp.onload = () => {
        var data = JSON.parse(xmlHttp.responseText);
        console.log(data);


     //featureları(noktaları) harita üzerinde gösterme
        for(let i = 0; i < data.length; i++) {
            var feature = new Feature({
                geometry: new Point(data[i].geometry.coordinates),
            });
            source.addFeature(feature);
        }

    }

}


