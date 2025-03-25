import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import gsap from 'gsap';

// Scene setup
const scene = new THREE.Scene();

// Load HDRI environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/neurathen_rock_castle_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularRefractionMapping;
  scene.environment = texture;
});

// Camera setup
const camera = new THREE.PerspectiveCamera(
  35, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  100 // Far clipping plane
);
camera.position.z = 4;

let model;

// Load a model
const loader = new GLTFLoader();
loader.load('./DamagedHelmet.gltf', (gltf) => {
  model = gltf.scene;
  scene.add(model);
}, undefined, (error) => {
  console.error(error);
});

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha:true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.003; // Adjust the RGB shift amount as needed
composer.addPass(rgbShiftPass);



window.addEventListener("mousemove",function(e){
  if(model){
    const rotationX = (e.clientX/window.innerWidth - 0.5) * Math.PI * 0.13;
    const rotationY = (e.clientY/window.innerHeight - 0.5) * Math.PI * 0.13;

    gsap.to(model.rotation,{
      x : rotationY,
      y : rotationX,
      duration:0.3,
      ease:"power2.out"
    })
    
  }
})


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  composer.render();
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
