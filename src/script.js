import GUI from 'lil-gui'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})

gui.close();
gui.hide();

if(window,location.hash === '#debug'){
    gui.show()
}

const debugObject = {};

const loadingBarBackground = document.querySelector('.loading-background')
const loadingBarElement = document.querySelector('.loading-bar')
const percentage = document.querySelector('.percentage')

let sceneReady = false
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // ...
        window.setTimeout(() =>
        {
            loadingBarBackground.classList.add('ended')
            loadingBarBackground.style.transform = ''
            loadingBarElement.classList.add('ended')
            percentage.classList.add('ended')
            loadingBarElement.style.transform = ''
            percentage.style.transform = ''
            window.setTimeout(() =>
            {
                loadingBarBackground.remove();
                loadingBarElement.remove();
                percentage.remove();
            }, 5000);
        }, 500);
        window.setTimeout(() =>
        {
            sceneReady = true
        }, 3500)
    },
    (itemUrl, itemsLoaded, itemsTotal) =>
        {
            const progressRatio = itemsLoaded / itemsTotal
            loadingBarElement.style.transform = `scaleX(${progressRatio})`
            percentage.innerText = (progressRatio * 100).toFixed(0) + ' %'
        }

    // ...
)


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const bakedTexture1 = textureLoader.load('/textures/baked_5.jpg');
bakedTexture1.flipY = false;
bakedTexture1.colorSpace = THREE.SRGBColorSpace;

const textureGuy = textureLoader.load('/textures/outline.png');
textureGuy.colorSpace = THREE.SRGBColorSpace;

const textureBlood = textureLoader.load('/textures/bloodstain.png');
textureBlood.colorSpace = THREE.SRGBColorSpace;

const blanketTexture = textureLoader.load('/textures/burnthewitch.jpg');
blanketTexture.flipY = false;
blanketTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */

//Baked Material
const material1 = new THREE.MeshBasicMaterial({
    map: bakedTexture1
});

const materialGuy = new THREE.MeshBasicMaterial({
    map: textureGuy,
    transparent: true
});

const materialBlood = new THREE.MeshBasicMaterial({
    map: textureBlood,
    transparent: true
});

const materialBlanket = new THREE.MeshBasicMaterial({
    map: blanketTexture
});

const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

const greyMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

const redEmission = new THREE.MeshBasicMaterial({color: 0xff0000,});

const blueEmission = new THREE.MeshBasicMaterial({color: 0x0000ff,});

const whiteEmmision = new THREE.MeshBasicMaterial({color: 0xffffff,});

const yellowEmmision = new THREE.MeshBasicMaterial({color: 0xFFE36A,});



let mixer;
let animationObject = {
    actions: {},
};

let gltf
gltfLoader.load('/models/baking-777.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material = material1;
        }
    });



    const chalkLineMesh = gltf.scene.children.find(child => child.name === 'chalk_line');
    const bloodMesh = gltf.scene.children.find(child => child.name === 'blood');
    const blanketMesh = gltf.scene.children.find(child => child.name === 'blanket');
    const queensMesh = gltf.scene.children.find(child => child.name === 'queens');
    const bridgeMesh = gltf.scene.children.find(child => child.name === 'bridge');
    const murderesMesh = gltf.scene.children.find(child => child.name === 'murderers');
    const proofCardOne = gltf.scene.children.find(child => child.name === 'proof_card_number_1');
    const proofCardTwo = gltf.scene.children.find(child => child.name === 'proof_card_number_3');
    const neonSign = gltf.scene.children.find(child => child.name === 'diner_text_REDUX');
    const copLightCenter = gltf.scene.children.find(child => child.name === 'carlights');
    const copLightRed = gltf.scene.children.find(child => child.name === 'carlight_red');
    const copLightBlue = gltf.scene.children.find(child => child.name === 'carlights_blue');
    const dinerLight = gltf.scene.children.find(child => child.name === 'diner_building_light');
    const lantern = gltf.scene.children.find(child => child.name === 'lanternlight');


    // Apply materials
    if (proofCardOne &&
        queensMesh &&
        bridgeMesh &&
        murderesMesh &&
        proofCardTwo &&
        neonSign &&
        copLightCenter && 
        copLightBlue &&
        copLightRed &&
        dinerLight &&
        lantern) {
            proofCardOne.material = blackMaterial;
            queensMesh.material = blackMaterial;
            bridgeMesh.material = blackMaterial;
            murderesMesh.material = blackMaterial;
            proofCardTwo.material = blackMaterial;
            neonSign.material = redEmission;
            copLightCenter.material = greyMaterial;
            copLightBlue.material = blueEmission;
            copLightRed.material = redEmission;
            dinerLight.material = yellowEmmision;
            lantern.material = whiteEmmision;
    }


    // Apply materials to specific meshes
    if (chalkLineMesh) {
        chalkLineMesh.material = materialGuy;
        mirrorMeshUVs(chalkLineMesh);
    }

    if (bloodMesh) {
        bloodMesh.material = materialBlood;
        mirrorMeshUVs(bloodMesh);
    }

    if (blanketMesh) {
        // blanketMesh.material = materialBlanket;
        blanketMesh.material = greyMaterial;

    }

    mixer = new THREE.AnimationMixer(gltf.scene);
    animationObject.actions = gltf.animations.map((clip) => {
        mixer.clipAction(clip).play();
    });


    // Add loaded GLTF scene to the main scene
    scene.add(gltf.scene);
});


/**
 * Function to mirror the UV coordinates of a mesh diagonally.
 * @param {THREE.Mesh} mesh - The mesh whose UVs need to be mirrored diagonally.
 */
function mirrorMeshUVs(mesh) {
    const geometry = mesh.geometry;

    if (geometry.attributes.uv) {
        const uvs = geometry.attributes.uv.array;

        // Rotate by 180 degrees
        for (let i = 1; i < uvs.length; i += 2) {
            uvs[i] = 1 - uvs[i];
        }

        geometry.attributes.uv.needsUpdate = true;
    }
}




/**
 * POI
 */

const points = [
    {
        position: new THREE.Vector3(-3.98, 1.69, -3.66),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(2.8, 2.28, -2.87),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(3.9, 0.78, 4.56),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(-3.8, 1.69, 3.66),
        element: document.querySelector('.point-3')
    }
]


debugObject.poi = true;
gui.add(debugObject, 'poi').onChange((val) => {
        for(const point of points) {
            if(!val){
                point.element.classList.remove('visible')
            }
            else{
                point.element.classList.add('visible')
            }
        }
}).name('Points of Interest')

points.forEach((point, index) => {
    gui.add(point.position, 'x').min(-5).max(5).step(0.01).name(`Point ${index} X`)
    gui.add(point.position, 'y').min(-5).max(5).step(0.01).name(`Point ${index} Y`)
    gui.add(point.position, 'z').min(-5).max(5).step(0.01).name(`Point ${index} Z`)
})


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

// Audio loader
const audioLoader = new THREE.AudioLoader();

// Load a sound and set it as the Audio object's buffer
audioLoader.load('/music/music.m4a', function(buffer) {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.5);
    backgroundMusic.play();
}); 

// Create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// Create a global audio source
const backgroundMusic = new THREE.Audio(listener);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Limits for the rotation
controls.minPolarAngle = Math.PI / 4; 
controls.maxPolarAngle = Math.PI / 2; 

// Allow more rotation to the right and less to the left
controls.minAzimuthAngle = -Math.PI / 8; 
controls.maxAzimuthAngle = Math.PI / 2;  

// Limits for zooming
controls.minDistance = 7;  
controls.maxDistance = 30; 

controls.enablePan = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const raycaster = new THREE.Raycaster()

const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    if(sceneReady){

        // Update mixer
        if (mixer) {
            mixer.update(deltaTime);
        }
        for(const point of points)
            {
                const screenPosition = point.position.clone()
                screenPosition.project(camera)
    
                raycaster.setFromCamera(screenPosition, camera)
                const intersects = raycaster.intersectObjects(scene.children, true)
    
                if(intersects.length === 0 && debugObject.poi)
                    {
                        point.element.classList.add('visible')
                    }
                    else
                    {
                        const intersectionDistance = intersects[0].distance
                        const pointDistance = point.position.distanceTo(camera.position)
            
                        if(intersectionDistance < pointDistance)
                        {
                            point.element.classList.remove('visible')
                        }
                        else if(intersectionDistance > pointDistance && debugObject.poi)
                        {
                            point.element.classList.add('visible')
                        }
                    }
        
                const translateX = screenPosition.x * sizes.width * 0.5
                const translateY = - screenPosition.y * sizes.height * 0.5
                point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
            }
    }
    

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()