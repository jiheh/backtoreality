
var scene,
    camera,
    sphere,
    renderer,
    element,
    container,
    effect,
    video,
    canvas,
    context,
    currentTheme = 0,
    lookingAtGround = false,
    image;

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
  camera.position.set(0, 15, 0);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({antialias: true});
  element = renderer.domElement;
  container = document.getElementById('webglviewer');

  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);

  element.addEventListener('click', fullscreen, false);

  // if (window.DeviceOrientationEvent) {
  //   window.addEventListener('deviceorientation', function(evt) {
  //     if (evt.gamma > -1 && evt.gamma < 1 && !lookingAtGround) {
  //       lookingAtGround = true;
  //       currentTheme = (themes.length > currentTheme+1) ? currentTheme+1 : 0;

  //       setTimeout(function() {
  //         lookingAtGround = false;
  //       }, 4000);
  //     }
  //   }.bind(this));
  // }

  video = document.createElement('video');
  video.setAttribute('autoplay', true);
  
  var options = {
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720,
        minFrameRate: 60
      },
      optional: [
        { minFrameRate: 120 },
        // {minWidth: 1920},
        // {minHeight: 1080},
        {facingMode: "environment"}
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
          if (source.facing && source.facing === "environment") {
            options.video.optional.push({'sourceId': source.id});
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
    
    // If you do not use powersOf2, or you want to adjust things more, you could use these:
    // texture.minFilter = THREE.LinearMipMapLinearFilter;
    // texture.magFilter = THREE.NearestFilter;

    var cameraPlane = new THREE.PlaneBufferGeometry(1280, 720);

    cameraMesh = new THREE.Mesh(cameraPlane, new THREE.MeshBasicMaterial({
      color: 0xffffff, opacity: 1, map: texture
    }));
    cameraMesh.position.z = -600;

    scene.add(cameraMesh);
  }

  function streamError(error) {
    console.log('Stream error: ', error);
  }

  animate();
}


function animate() {
  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);


    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      texture.needsUpdate = true;
    }
  }

  requestAnimationFrame(animate);

  update();
  render();
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();
}

function render(dt) {
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
