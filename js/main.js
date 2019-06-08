var map_101;
var thisAddress;
var thisLatitude,thisLongitude;
var noiseName ;

var data = [
  {"loc":[35.167188, 136.947688], "title":"池下"},
  {"loc":[35.181524, 136.948154], "title":"名古屋市立大学 北千種キャンパス"},
  {"loc":[35.171167, 136.881970], "title":"名古屋駅"}
];


function init(){
	navigator.geolocation.getCurrentPosition(getThisAddress);
	init1();
}
function init1() {
    map_101 = L.map('map_101',{
    // center:[35.15,136.9],
    center:[35.15,136.9],
    zoom: 12,
    zoomControl:false,
	});

    mapLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; ' + mapLink,
        maxZoom: 20,
    }).addTo(map_101);

    var noiseName = ["car_noise","human_noise","crowds_noise","animal_noise","construction_noise","weather_noise"];
    for(var i = 0; i < noiseName.length; i++){
    	takeOutData(noiseName[i]);
    }
    // takeOutData(noiseName);

    var searchboxControl = createSearchboxControl();
    var control = new searchboxControl({
    });
    // 検索ボタンが押された時のコールバック
    control._searchfunctionCallBack = function (srhkeywords)
    {
        if (!srhkeywords) {
            alert("検索ワードを入力してください");
            return;
        } 
       // 表示データのタイトルに検索ワードが含まれているかチェック（前方一致）
        for(i in data) {
            if(data[i].title.indexOf(srhkeywords) === 0){
                // 地図の座標を移動
                map_101.setView(data[i].loc, 15);
                return;
            }
        }
        alert("検索ワードに該当するデータはありません。");
    }
    map_101.addControl(control);

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
	    	markCol = 'yellow';
	    }else if(noiseName == 'crowds_noise'){
	    	markCol = 'purple';
	    }else if(noiseName == 'animal_noise'){
	    	markCol = 'green';
	    }else if(noiseName == 'construction_noise'){
	    	markCol = 'red';
	    }else if(noiseName == 'weather_noise'){
	    	markCol = 'darkcyan';
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
	noiseName = noiseTag;
	map_101.setView([thisLatitude, thisLongitude], 15);

	// マーカーを作成する
	var marker = L.marker([thisLatitude, thisLongitude]).addTo(map_101);
		 
	// クリックした際にポップアップメッセージを表示する
	marker.bindPopup(noiseName);

	//-----------------------upload_firebase------------------------
	var db = firebase.database();
	var noiseLabel = db.ref("/noise/" + noiseName);

	// var text = Math.random();

	noiseLabel.once("value", function(snapshot) {
		noiseLabel.push({thisLatitude:thisLatitude,thisLongitude:thisLongitude});

		snapshot.forEach(function(children) {
	        //children.val().userIdとかで必要な値を取ればOK
	        if(children.val().thisLatitude == thisLatitude && children.val().thisLongitude == thisLongitude){
                map_101.removeLayer(marker);
	        	// marker.setMap(null);
	        }
	    });
	    // noiseLabel.set({});
	});

	// sendNoise(noiseName);
	// navigator.mediaDevices.getUserMedia({ audio: true, video: false })
 //    .then(handleSuccess);
}

function getThisAddress(position){
	thisLatitude = position.coords.latitude;
	thisLongitude = position.coords.longitude;
}



//--------------------------------------------send noise sound---------------------------------------------
var audioData = []; // 録音データ
var bufferSize =1024;

var AudioContext;  // Safari and old versions of Chrome
this.audioContext;
var context;

    //マイク機能の使用許可が出たときの処理
function handleSuccess(stream) {

    var source = context.createMediaStreamSource(stream);
    console.log(source);
    //処理を行うプロセッサーを出力先とするために作成する
    var processor = context.createScriptProcessor(bufferSize,1,1);
    //直接destinationに繋ぐとスピーカーからそのまま音が出てしまう

    setTimeout(function () {

        source.connect(processor);
        processor.connect(context.destination);
    }, 1000);


    //1024bitのバッファサイズに達するごとにaudioDataにデータを追加する
    processor.onaudioprocess = function(e){

        var input = e.inputBuffer.getChannelData(0);
        var bufferData = new Float32Array(bufferSize);
        for (var i = 0; i < bufferSize; i++) {
            bufferData[i] = input[i];
        }
        audioData.push(bufferData);
    };



        //1秒間音を拾って録音する
    timer = setTimeout(function () {
            //接続の停止
        processor.disconnect();
        source.disconnect();

            //取得した音声データをwavファイルに変換する
        exportWAV(audioData);

    }, 2000);
};

function sendNoise(nn){
    noiseName = nn;
    AudioContext = window.AudioContext          // Default
              || window.webkitAudioContext;  // Safari and old versions of Chrome
    this.audioContext = new AudioContext();

    context = new AudioContext();
        //マイクデバイスの利用許可の確認を行う
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(handleSuccess);
}

    //wavファイルを作成する
function exportWAV(audioData) {

    var encodeWAV = function(samples, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);

        var writeString = function(view, offset, string) {
            for (var i = 0; i < string.length; i++){
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        var floatTo16BitPCM = function(output, offset, input) {
            for (var i = 0; i < input.length; i++, offset += 2){
                var s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };

        writeString(view, 0, 'RIFF');  // RIFFヘッダ
        view.setUint32(4, 32 + samples.length * 2, true); // これ以降のファイルサイズ
        writeString(view, 8, 'WAVE'); // WAVEヘッダ
        writeString(view, 12, 'fmt '); // fmtチャンク
        view.setUint32(16, 16, true); // fmtチャンクのバイト数
        view.setUint16(20, 1, true); // フォーマットID
        view.setUint16(22, 1, true); // チャンネル数
        view.setUint32(24, sampleRate, true); // サンプリングレート
        view.setUint32(28, sampleRate * 2, true); // データ速度
        view.setUint16(32, 2, true); // ブロックサイズ
        view.setUint16(34, 16, true); // サンプルあたりのビット数
        writeString(view, 36, 'data'); // dataチャンク
        view.setUint32(40, samples.length * 2, true); // 波形データのバイト数
        floatTo16BitPCM(view, 44, samples); // 波形データ

        return view;
    };

    var mergeBuffers = function(audioData) {
        var sampleLength = 0;
            for (var i = 0; i < audioData.length; i++) {
                sampleLength += audioData[i].length;
            }
        var samples = new Float32Array(sampleLength);
        var sampleIdx = 0;
            for (var i = 0; i < audioData.length; i++) {
                for (var j = 0; j < audioData[i].length; j++) {
                    samples[sampleIdx] = audioData[i][j];
                    sampleIdx++;
                }
            }
        return samples;
    };

    var dataview = encodeWAV(mergeBuffers(audioData), context.sampleRate);
        //できあがったwavデータをBlobにする
    var audioBlob = new Blob([dataview], { type: 'audio/wav' });

    // var downloadLink = document.getElementById('download');
    //     //BlobへのアクセスURLをダウンロードリンクに設定する
    // downloadLink.href = URL.createObjectURL(audioBlob);
    // downloadLink.download = 'test.wav';



    sendNoiseSound(audioBlob);
};
function sendNoiseSound (audioBlob){
    var storageRef = firebase.storage().ref("/noise/"+ noiseName + "/" + thisLatitude + "/" + thisLongitude);
    // var storageRef = firebase.storage().ref();

    storageRef.put(audioBlob).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
    });
}
