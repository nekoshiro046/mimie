var map_101;
var thisAddress;
var thisLatitude,thisLongitude;

function init() {
    map_101 = L.map('map_101').setView([35.15, 136.9], 12);
    mapLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; ' + mapLink,
        maxZoom: 20
    }).addTo(map_101);

    var noiseName = ["car_noise","human_noise","crowds_noise","animal_noise","construction_noise","rain_noise"];
    for(var i = 0; i < noiseName.length; i++){
    	takeOutData(noiseName[i]);
    }
    // takeOutData(noiseName);


}
function takeOutData(noiseName){
  	var database = firebase.database();
  	var dataRef = database.ref("/noise/"+ noiseName);
  	dataRef.once("value", function(snapshot) {
	    // console.log(snapshot.val());
	    var markCol;
	    if(noiseName == 'car_noise'){
	    	markCol = 'blue';
	    }else if(noiseName == 'human_noise'){
	    	markCol = 'red';
	    }else if(noiseName == 'crowds_noise'){
	    	markCol = 'orange';
	    }else if(noiseName == 'animal_noise'){
	    	markCol = 'green';
	    }else if(noiseName == 'construction_noise'){
	    	markCol = 'purple';
	    }else if(noiseName == 'rain_noise'){
	    	markCol = 'violet';
	    }
	    snapshot.forEach(function(children) {
	        //children.val().userIdとかで必要な値を取ればOK
	        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.3.1/dist/images/';
	        var marker = L.marker([children.val().thisLatitude, children.val().thisLongitude], {icon: L.spriteIcon(markCol)}).addTo(map_101);
	        marker.bindPopup(noiseName);
	    });
	});
}

function setMarkerHere(noiseTag){



	navigator.geolocation.getCurrentPosition(getThisAddress);

	// マーカーを作成する
	var marker = L.marker([thisLatitude, thisLongitude]).addTo(map_101);
	 
	// クリックした際にポップアップメッセージを表示する
	marker.bindPopup(noiseTag);

	//-----------------------upload_firebase------------------------
	var db = firebase.database();
	var noiseLabel = db.ref("/noise/" + noiseTag);

	// var text = Math.random();

	noiseLabel.once("value", function(snapshot) {
		noiseLabel.push({thisLatitude:thisLatitude,thisLongitude:thisLongitude});

		snapshot.forEach(function(children) {
	        //children.val().userIdとかで必要な値を取ればOK
	        if(children.val().thisLatitude == thisLatitude && children.val().thisLongitude == thisLongitude){
	        	marker.setMap(null);
	        }
	    });
	    // noiseLabel.set({});
	});
}

function getThisAddress(position){
	thisLatitude = position.coords.latitude;
	thisLongitude = position.coords.longitude;
}