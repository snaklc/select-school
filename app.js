import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Tile, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';

let button = document.querySelector('button');
var form = document.getElementById('myForm');

var xmlHttp = new XMLHttpRequest();

var okul_adi = document.getElementById('name');
var geom = document.getElementById('geom');


// form'un sayfayı refresh ettirmemesi için yazılan function
function handleForm(event) {
    //  console.log('event: ', event);
    event.preventDefault();
}

// form içinde gerçekleşen olayları dinler biz submit olayını dinledik.
form.addEventListener('submit', handleForm);

button.addEventListener('click', () => {
    gonder();
})

function gonder() {
    xmlHttp.open('POST', 'http://localhost:3000/', true);

    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify({ "geom": geom.value, "okul_adi": okul_adi.value }));

    // xmlHttp.onload = function () {
    //     console.log(this.responseText);
    // }
    // xmlHttp.send(
    //     {
    //         geom: geom.value,
    //         okul_adi: okul_adi.value
    //     })
    console.log("geom: ", geom.value, "okul_adi: ", okul_adi.value);
    console.log(xmlHttp.responseText);
    return xmlHttp.responseText;
}

var raster = new TileLayer({
    source: new OSM(),  //OpenStreetMap
});

var source = new VectorSource();
var vector = new VectorLayer({
    source: source,
});

var map = new Map({
    layers: [raster, vector],
    target: "map",
    view: new View({
        center: fromLonLat([35.24, 38.96]),
        zoom: 5,
    }),
});

var selectedType = document.getElementById("type");
var draw;

function addInteraction() {
    var value = selectedType.value;

    if (value !== "None") {
        draw = new Draw({
            source: source,
            type: value,
        });
        map.addInteraction(draw);
    }

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

