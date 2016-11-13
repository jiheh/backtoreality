if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, scene, renderer, effect, element, context;
var mesh, group1, group2, group3, light;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();

function init() {

  container = document.getElementById( 'webglviewer' );

  scene = new THREE.Scene();
  ARscene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(0, 15, 1800);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0xffffff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;

  element = renderer.domElement;
  container.appendChild(element);
  element.addEventListener('click', fullscreen, false);

  effect = new THREE.StereoEffect(renderer);
  effect.autoClear = false;


  // VIDEO ELEMENT
  video = document.createElement('video');
    video.setAttribute('autoplay', true);
    
    var options = {
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720,
          minFrameRate: 30
        },
        optional: [
          { minFrameRate: 60 },
          { minWidth: 1920 },
          { minHeight: 1080 },
          { facingMode: 'environment' }
        ]
      }
    };

    navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (typeof MediaStreamTrack === 'undefined' && navigator.getUserMedia) {
      alert('This browser doesn\'t support this demo :(');
    } else {
      MediaStreamTrack.getSources(function(sources) {
        for (var i = 0; i !== sources.length; ++i) {
          var source = sources[i];
          if (source.kind === 'video') {
            if (source.facing && source.facing === 'environment') {
              options.video.optional.push({sourceId: source.id});
            }
          }
        }
        
        navigator.getUserMedia(options, streamFound, streamError);
      });
    }

  function streamFound(stream) {
    document.body.appendChild(video);
    video.src = URL.createObjectURL(stream);
    video.style.width = '100%';
    video.style.height = '100%';
    video.play();

    canvas = document.createElement('canvas');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    canvas.width = nextPowerOf2(canvas.width);
    canvas.height = nextPowerOf2(canvas.height);

    function nextPowerOf2(x) { 
        return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2))); 
    }

    context = canvas.getContext('2d');
    texture = new THREE.Texture(canvas);
    texture.context = context;

    var cameraPlane = new THREE.PlaneBufferGeometry(3377, 1900);

    cameraMesh = new THREE.Mesh(cameraPlane, new THREE.MeshBasicMaterial({
      color: 0xffffff, opacity: 1, map: texture
    }));
    cameraMesh.position.z = 0;

    scene.add(cameraMesh);
  }

  function streamError(error) {
    console.log('Stream error: ', error);
  }

  ////

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 0, 1 );
  scene.add( light );

  ////

  var faceIndices = [ 'a', 'b', 'c' ];

  var color, f, f2, f3, p, vertexIndex,

    radius = 200,

    geometry  = new THREE.IcosahedronGeometry( radius, 1 ),
    geometry2 = new THREE.IcosahedronGeometry( radius, 1 ),
    geometry3 = new THREE.IcosahedronGeometry( radius, 1 );

  for ( var i = 0; i < geometry.faces.length; i ++ ) {

    f  = geometry.faces[ i ];
    f2 = geometry2.faces[ i ];
    f3 = geometry3.faces[ i ];

    for( var j = 0; j < 3; j++ ) {

      vertexIndex = f[ faceIndices[ j ] ];

      p = geometry.vertices[ vertexIndex ];

      color = new THREE.Color( 0xffffff );
      color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );

      f.vertexColors[ j ] = color;

      color = new THREE.Color( 0xffffff );
      color.setHSL( 0.0, ( p.y / radius + 1 ) / 2, 0.5 );

      f2.vertexColors[ j ] = color;

      color = new THREE.Color( 0xffffff );
      color.setHSL( 0.125 * vertexIndex/geometry.vertices.length, 1.0, 0.5 );

      f3.vertexColors[ j ] = color;

    }
  }


  var materials = [

    new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
    new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )

  ];

  group1 = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
  group1.position.x = -400;
  group1.position.z = 300;
  group1.rotation.x = -1.87;
  scene.add( group1 );

  group2 = THREE.SceneUtils.createMultiMaterialObject( geometry2, materials );
  group2.position.x = 400;
  group2.position.z = 300;
  group2.rotation.x = 0;
  scene.add( group2 );

  group3 = THREE.SceneUtils.createMultiMaterialObject( geometry3, materials );
  group3.position.x = 0;
  group3.position.z = 300;
  group3.rotation.x = 0;
  scene.add( group3 );


  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'deviceorientation', setOrientationControls, true);

  ////

  window.addEventListener( 'resize', onWindowResize, false );
  animate();
}

function onWindowResize() {

  var width = container.offsetWidth;
  var height = container.offsetHeight;
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function onDocumentMouseMove( event ) {

  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);

  window.removeEventListener('deviceorientation', setOrientationControls, true);

}

function setOrientationControls(e) {
  if (!e.alpha) { return; }
  controls = new THREE.DeviceOrientationControls(camera, true);
  controls.connect();
  controls.update();
}
//

function animate() {
  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      texture.needsUpdate = true;
    }
  }

  requestAnimationFrame( animate );
  camera.updateProjectionMatrix();
  render();
  stats.update();
}

function render(dt) {

  camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

  camera.lookAt(scene.position);



  // renderer.clear();
  // effect.render(ARscene, camera);
  // renderer.clearDepth();
  effect.render(scene, camera);

}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}
