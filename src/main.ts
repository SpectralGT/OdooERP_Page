import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
// import { FXAAShader } from 'three/examples/jsm/Addons.js';
import { VignetteShader } from 'three/examples/jsm/Addons.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

// Constants for window dimensions
const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;


// Mouse movement variables
let mouseX: number = 0;
let mouseY: number = 0;

// Scene setup
const scene: THREE.Scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xBAD8B6, 10, 100);


//Camera setup
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50, WINDOW_WIDTH / WINDOW_HEIGHT, 0.1, 1000);

//Renderer setup
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });

//Pivot for Camera to Move Around
const pivot: THREE.Group = new THREE.Group();
scene.add(pivot);
pivot.add(camera);

pivot.position.set(3, 5, 0);
pivot.rotation.set(0 * Math.PI / 180, 90 * Math.PI / 180, 0 * Math.PI / 180);
//Initialising Everything
function init(): void {
    renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
    document.getElementById('container3D')?.append(renderer.domElement);
    scene.background = new THREE.Color(0xBAD8B6);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    loadModel();
    setupLighting();
    setupGround();
    setupEventListeners();
}

//Loading office Model
function loadModel(): void {
    const loader: GLTFLoader = new GLTFLoader();
    loader.load('/model.glb', (gltf: any) => {
        const office = gltf.scene;
        office.position.set(5, 0, -5);
        office.castShadow = true;
        office.receiveShadow = true;

        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(office);
    });
}

//Light setup
function setupLighting(): void {
    // const createLight = (x: number, y: number, z: number): THREE.DirectionalLight => {
    //     const light = new THREE.DirectionalLight(0xffffff, 1);
    //     light.position.set(x, y, z);
    //     light.shadow.mapSize.width = 4096;
    //     light.shadow.mapSize.height = 4096;
    //     // light.shadow.camera.top=100;
    //     // light.shadow.camera.bottom=100;
    //     // light.shadow.camera.left=100;
    //     // light.shadow.camera.right=100;
    //     light.shadow.normalBias = 0;
    //     light.shadow.bias = 0.002;
    //     light.shadow.intensity = 1;
    //     light.shadow.radius = 1;
    //     light.castShadow = true;
    //     return light;
    // };
    scene.add(new THREE.AmbientLight(0xaaaaaa, 5));
    // scene.add(createLight(5, 5, 7.5));
    // scene.add(createLight(-5, 5, 7.5));
    // scene.add(createLight(0, 5, -7.5));
    // scene.add(createLight(0, 5, 7.5));
}

//Ground plane setup
function setupGround(): void {
    const plane: THREE.Mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshPhongMaterial({ color: 0xBAD8B6, depthWrite: false })
    );
    plane.receiveShadow = true;
    plane.position.set(-3, -0.9, 0);
    plane.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(plane);
}

//Adding Post Processing
function postProcessing(): void {
    const composer: EffectComposer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.2, 0, 0));
    composer.addPass(new ShaderPass(VignetteShader));
    composer.addPass(new GTAOPass( scene, camera, WINDOW_WIDTH,WINDOW_HEIGHT ));


    composer.addPass(new OutputPass());
    composer.renderTarget1.samples = 8;
    composer.renderTarget2.samples = 8;
    renderLoop(composer);
}

//EventListener setup
function setupEventListeners(): void {

    window.addEventListener('scroll', modelMove);

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        modelMove();
    });
}

function modelMove(): void {
    const sections = document.querySelectorAll('section');
    let currentSection = '';

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });

    const arrPositionModel = [
        { id: 'hero', position: new THREE.Vector3(3, 5, 0), rotation: new THREE.Euler(0 * Math.PI / 180, 90 * Math.PI / 180, 0 * Math.PI / 180) },
        { id: '1', position: new THREE.Vector3(-1.2, 2.1, 5), rotation: new THREE.Euler(0 * Math.PI / 180, 35 * Math.PI / 180, 0 * Math.PI / 180) },
        { id: '2', position: new THREE.Vector3(3.2, 1.5, 5), rotation: new THREE.Euler(0 * Math.PI / 180, 35 * Math.PI / 180, 0 * Math.PI / 180) },
        { id: '3', position: new THREE.Vector3(4, 1.5, 0.5), rotation: new THREE.Euler(0 * Math.PI / 180, 90 * Math.PI / 180, 0 * Math.PI / 180) },
        { id: '4', position: new THREE.Vector3(4, 1, -2), rotation: new THREE.Euler(0 * Math.PI / 180, 35 * Math.PI / 180, 0 * Math.PI / 180) }
    ];
    const positionActive = arrPositionModel.find((val) => val.id === currentSection);

    if (positionActive) {
        gsap.to(pivot.rotation, { x: positionActive.rotation.x, y: positionActive.rotation.y, z: positionActive.rotation.z, duration: 1, ease: "power1.out" });
        gsap.to(pivot.position, { x: positionActive.position.x, y: positionActive.position.y, z: positionActive.position.z, duration: 1, ease: "power1.out" });
        gsap.to(camera.rotation, { x: mouseY * 0.05, y: mouseX * 0.05, duration: 1, ease: "power1.out" });
        console.log('changed pos');
    }
}

function renderLoop(composer: EffectComposer): void {

    const clock: THREE.Clock = new THREE.Clock();
    const controls: FlyControls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 10;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;

    function rerender3D(): void {
        requestAnimationFrame(rerender3D);
        controls.update(clock.getDelta());
        composer.render();
    }
    rerender3D();
}

init();
postProcessing();