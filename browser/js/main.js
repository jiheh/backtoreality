if (! Detector.webgl) Detector.addGetWebGLMessage();

// Defining all variables
var container;
var camera, scene, cssScene, renderer, cssRenderer, effect, element, context;
var group1, group2, group3, light;

// For mouse controls
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();

function init() {

  container = document.getElementById('webglviewer');

  scene = new THREE.Scene();
  cssScene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 15, 1800);
  scene.add(camera);
  cssScene.add(camera);

  // The WebGL Renderer
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.autoClear = false;
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  effect = new THREE.StereoEffect(renderer);

  // The CSS3D Stereo Renderer
  cssRenderer = new THREE.CSS3DStereoRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = 0;

  element = cssRenderer.domElement;
  container.appendChild(element);
  container.appendChild(renderer.domElement);

  // The css dom element sits on top of the web dom element, so events should be attached here
  element.addEventListener('click', fullscreen, false);


  // CAMERA ELEMENT
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

    // enumeratedDevices cannot current support a rear-view camera, so mediaStreamTrack used
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

    // Camera feed size
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


  // HTML ELEMENT (Video embed)

  // WebGL plane created first
  var material = new THREE.MeshBasicMaterial({ wireframe: true });
  var geometry = new THREE.PlaneGeometry();
  var planeMesh= new THREE.Mesh(geometry, material);
  // Added to the WebGL scene
  scene.add(planeMesh);

  // CSS3D object created
  var url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  var domElement  = document.createElement('iframe');
  domElement.src  = url;
  domElement.style.border = 'none';
  var cssObject = new THREE.CSS3DObject(domElement);
  // Same position and rotation specified as the WebGL plane above
  cssObject.position = planeMesh.position;
  cssObject.rotation = planeMesh.rotation;
  // added to the CSS scene
  cssScene.add(cssObject);


  // 3D Objects
  
  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 1);
  scene.add(light);

  var faceIndices = [ 'a', 'b', 'c' ];
  var color, f, f2, f3, p, vertexIndex,
    radius = 200,

    geometry  = new THREE.IcosahedronGeometry(radius, 1),
    geometry2 = new THREE.IcosahedronGeometry(radius, 1),
    geometry3 = new THREE.IcosahedronGeometry(radius, 1);


  for (var i = 0; i < geometry.faces.length; i ++) {
    f  = geometry.faces[ i ];
    f2 = geometry2.faces[ i ];
    f3 = geometry3.faces[ i ];

    for(var j = 0; j < 3; j++) {
      vertexIndex = f[ faceIndices[ j ] ];
      p = geometry.vertices[ vertexIndex ];

      color = new THREE.Color(0xffffff);
      color.setHSL((p.y / radius + 1) / 2, 1.0, 0.5);

      f.vertexColors[ j ] = color;
      color = new THREE.Color(0xffffff);
      color.setHSL(0.0, (p.y / radius + 1) / 2, 0.5);

      f2.vertexColors[ j ] = color;

      color = new THREE.Color(0xffffff);
      color.setHSL(0.125 * vertexIndex/geometry.vertices.length, 1.0, 0.5);

      f3.vertexColors[ j ] = color;
    }
  }

  var materials = [
    new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 }),
    new THREE.MeshBasicMaterial({ color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true })
  ];

  group1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
  group1.position.x = -400;
  group1.position.z = 300;
  group1.rotation.x = -1.87;
  // The three balls added to the WebGL scene
  scene.add(group1);

  group2 = THREE.SceneUtils.createMultiMaterialObject(geometry2, materials);
  group2.position.x = 400;
  group2.position.z = 300;
  group2.rotation.x = 0;
  scene.add(group2);

  group3 = THREE.SceneUtils.createMultiMaterialObject(geometry3, materials);
  group3.position.x = 0;
  group3.position.z = 300;
  group3.rotation.x = 0;
  scene.add(group3);

  // Event listener for mouse controls
  window.addEventListener('mousemove', onDocumentMouseMove, false);

  animate();
}

// Mouse controls
function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
}

function animate() {
  // Draws camera feed if available
  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      texture.needsUpdate = true;
    }
  }

  window.requestAnimationFrame(animate);

  resize();
  render();
}

function resize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
}

function render(dt) {

  camera.lookAt( scene.position );

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (- mouseY - camera.position.y) * 0.05;

  effect.render(scene, camera);
  cssRenderer.render(cssScene, camera);
}

// Make fullscreen on click
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
