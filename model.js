(() => {
  'use strict';
  let initialized = false;
  let engineRef = null;

  function initModel() {
    if (initialized) {
      if (engineRef) setTimeout(() => engineRef.resize(), 0);
      return;
    }
    const canvas = document.getElementById('renderCanvas');
    if (!canvas || !window.BABYLON) return;
    initialized = true;


    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true
    });
    engineRef = engine;

    let orbitEnabled = false;
    let wireframeEnabled = false;
    let subjectRoot;

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.005, 0.025, 0.045, 1);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.028;
    scene.fogColor = new BABYLON.Color3(0.01, 0.05, 0.08);

    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.25,
      7.5,
      new BABYLON.Vector3(0, 1.15, 0),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4.6;
    camera.upperRadiusLimit = 11;
    camera.wheelPrecision = 48;
    camera.panningSensibility = 75;
    camera.lowerBetaLimit = 0.45;
    camera.upperBetaLimit = 2.25;

    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.75;
    hemi.diffuse = new BABYLON.Color3(0.4, 0.7, 0.9);
    hemi.groundColor = new BABYLON.Color3(0.02, 0.04, 0.07);

    const rim = new BABYLON.PointLight('rim', new BABYLON.Vector3(-3, 3.5, -3), scene);
    rim.diffuse = new BABYLON.Color3(0.1, 0.65, 1);
    rim.intensity = 30;
    rim.range = 12;

    const warm = new BABYLON.PointLight('warm', new BABYLON.Vector3(3, 2.5, 2), scene);
    warm.diffuse = new BABYLON.Color3(0.8, 0.3, 0.12);
    warm.intensity = 12;
    warm.range = 10;

    const skin = new BABYLON.PBRMaterial('skin', scene);
    skin.albedoColor = new BABYLON.Color3(0.26, 0.18, 0.15);
    skin.roughness = 0.78;
    skin.metallic = 0.02;

    const metal = new BABYLON.PBRMaterial('metal', scene);
    metal.albedoColor = new BABYLON.Color3(0.055, 0.075, 0.09);
    metal.metallic = 0.92;
    metal.roughness = 0.28;

    const darkMetal = new BABYLON.PBRMaterial('darkMetal', scene);
    darkMetal.albedoColor = new BABYLON.Color3(0.015, 0.025, 0.035);
    darkMetal.metallic = 0.82;
    darkMetal.roughness = 0.42;

    const blueGlow = new BABYLON.StandardMaterial('blueGlow', scene);
    blueGlow.diffuseColor = new BABYLON.Color3(0.04, 0.35, 0.68);
    blueGlow.emissiveColor = new BABYLON.Color3(0.05, 0.72, 1.0);

    const redGlow = new BABYLON.StandardMaterial('redGlow', scene);
    redGlow.diffuseColor = new BABYLON.Color3(0.45, 0.02, 0.03);
    redGlow.emissiveColor = new BABYLON.Color3(0.8, 0.03, 0.05);

    const glowLayer = new BABYLON.GlowLayer('glow', scene, { blurKernelSize: 48 });
    glowLayer.intensity = 0.7;

    subjectRoot = new BABYLON.TransformNode('subjectRoot', scene);

    // Torso / shoulders
    const torso = BABYLON.MeshBuilder.CreateSphere('torso', { diameterX: 3.3, diameterY: 2.2, diameterZ: 1.45, segments: 48 }, scene);
    torso.position.y = -0.35;
    torso.scaling.y = 0.8;
    torso.material = darkMetal;
    torso.parent = subjectRoot;

    // Neck
    const neck = BABYLON.MeshBuilder.CreateCylinder('neck', { height: 1.0, diameterTop: 0.9, diameterBottom: 1.15, tessellation: 36 }, scene);
    neck.position.y = 0.72;
    neck.material = skin;
    neck.parent = subjectRoot;

    // Head base
    const head = BABYLON.MeshBuilder.CreateSphere('head', { diameterX: 2.15, diameterY: 2.65, diameterZ: 1.75, segments: 64 }, scene);
    head.position.y = 2.05;
    head.material = skin;
    head.parent = subjectRoot;

    // Cybernetic half-mask on viewer's right side
    const cyberHalf = BABYLON.MeshBuilder.CreateSphere('cyberHalf', { diameterX: 2.18, diameterY: 2.68, diameterZ: 1.79, segments: 64, slice: 0.5 }, scene);
    cyberHalf.position.y = 2.05;
    cyberHalf.rotation.y = Math.PI;
    cyberHalf.material = metal;
    cyberHalf.parent = subjectRoot;

    // Face plate strips
    for (let i = 0; i < 5; i++) {
      const strip = BABYLON.MeshBuilder.CreateBox(`faceStrip${i}`, {
        width: 0.78 - i * 0.05,
        height: 0.08,
        depth: 0.06
      }, scene);
      strip.position.set(0.58, 2.62 - i * 0.23, -0.84 + i * 0.03);
      strip.rotation.z = -0.08 + i * 0.02;
      strip.material = darkMetal;
      strip.parent = subjectRoot;
    }

    // Human eye + cyber eye
    const eyeWhite = new BABYLON.StandardMaterial('eyeWhite', scene);
    eyeWhite.diffuseColor = new BABYLON.Color3(0.8, 0.82, 0.78);

    const leftEye = BABYLON.MeshBuilder.CreateSphere('leftEye', { diameter: 0.20, segments: 24 }, scene);
    leftEye.position.set(-0.43, 2.35, -0.85);
    leftEye.scaling.z = 0.45;
    leftEye.material = eyeWhite;
    leftEye.parent = subjectRoot;

    const rightEye = BABYLON.MeshBuilder.CreateSphere('rightEye', { diameter: 0.28, segments: 32 }, scene);
    rightEye.position.set(0.43, 2.35, -0.87);
    rightEye.scaling.z = 0.38;
    rightEye.material = blueGlow;
    rightEye.parent = subjectRoot;
    glowLayer.addIncludedOnlyMesh(rightEye);

    const eyeRing = BABYLON.MeshBuilder.CreateTorus('eyeRing', { diameter: 0.48, thickness: 0.055, tessellation: 40 }, scene);
    eyeRing.position.set(0.43, 2.35, -0.91);
    eyeRing.rotation.x = Math.PI / 2;
    eyeRing.material = metal;
    eyeRing.parent = subjectRoot;

    // Temple circuitry
    for (let i = 0; i < 6; i++) {
      const node = BABYLON.MeshBuilder.CreateSphere(`node${i}`, { diameter: 0.055 + (i % 2) * 0.02, segments: 12 }, scene);
      node.position.set(0.88, 2.8 - i * 0.25, -0.36 + Math.sin(i) * 0.13);
      node.material = i === 2 ? redGlow : blueGlow;
      node.parent = subjectRoot;
      glowLayer.addIncludedOnlyMesh(node);
    }

    // Collar armor
    const collar = BABYLON.MeshBuilder.CreateTorus('collar', { diameter: 2.0, thickness: 0.18, tessellation: 64 }, scene);
    collar.position.y = 0.6;
    collar.scaling.z = 0.72;
    collar.rotation.x = Math.PI / 2;
    collar.material = metal;
    collar.parent = subjectRoot;

    // Display pedestal
    const pedestal = BABYLON.MeshBuilder.CreateCylinder('pedestal', { height: 0.3, diameterTop: 4.1, diameterBottom: 4.6, tessellation: 64 }, scene);
    pedestal.position.y = -1.35;
    pedestal.material = darkMetal;

    const ring1 = BABYLON.MeshBuilder.CreateTorus('ring1', { diameter: 4.0, thickness: 0.045, tessellation: 96 }, scene);
    ring1.position.y = -1.15;
    ring1.rotation.x = Math.PI / 2;
    ring1.material = blueGlow;
    glowLayer.addIncludedOnlyMesh(ring1);

    const ring2 = BABYLON.MeshBuilder.CreateTorus('ring2', { diameter: 3.45, thickness: 0.022, tessellation: 96 }, scene);
    ring2.position.y = -1.07;
    ring2.rotation.x = Math.PI / 2;
    ring2.material = blueGlow;
    glowLayer.addIncludedOnlyMesh(ring2);

    // Vertical hologram lines
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const line = BABYLON.MeshBuilder.CreateCylinder(`holo${i}`, { height: 3.4, diameter: 0.012, tessellation: 6 }, scene);
      line.position.set(Math.cos(angle) * 1.75, 0.4, Math.sin(angle) * 1.1);
      line.material = blueGlow;
      line.visibility = 0.18;
    }

    // Ground grid
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 20, height: 20, subdivisions: 20 }, scene);
    ground.position.y = -1.52;
    const gridMat = new BABYLON.StandardMaterial('gridMat', scene);
    gridMat.diffuseColor = new BABYLON.Color3(0.01, 0.04, 0.065);
    gridMat.specularColor = BABYLON.Color3.Black();
    gridMat.alpha = 0.85;
    ground.material = gridMat;

    const resetView = () => {
      camera.alpha = -Math.PI / 2;
      camera.beta = Math.PI / 2.25;
      camera.radius = 7.5;
      camera.target = new BABYLON.Vector3(0, 1.15, 0);
    };

    document.querySelectorAll('.viewer-controls button').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;

        if (action === 'orbit') {
          orbitEnabled = !orbitEnabled;
          button.classList.toggle('active', orbitEnabled);
        }

        if (action === 'wireframe') {
          wireframeEnabled = !wireframeEnabled;
          [skin, metal, darkMetal].forEach((mat) => { mat.wireframe = wireframeEnabled; });
          button.classList.toggle('active', wireframeEnabled);
        }

        if (action === 'scan') {
          const bar = document.querySelector('.scan-bar');
          const text = document.getElementById('scanText');
          bar.classList.remove('scanning');
          void bar.offsetWidth;
          bar.classList.add('scanning');
          text.textContent = 'Scanning neural interface, ocular implant, and synthetic tissue...';
          setTimeout(() => { text.textContent = 'Scan complete: augmentation signature confirmed.'; }, 2700);
        }

        if (action === 'reset') resetView();
      });
    });

    scene.onBeforeRenderObservable.add(() => {
      if (orbitEnabled) subjectRoot.rotation.y += 0.0038 * engine.getDeltaTime() / 16.67;
      ring1.rotation.z += 0.0015 * engine.getDeltaTime() / 16.67;
      ring2.rotation.z -= 0.0022 * engine.getDeltaTime() / 16.67;
    });

    /*
      TO LOAD YOUR OWN GLB/GLTF MODEL:

      1. Put your file at: assets/your-model.glb
      2. Include Babylon's loader script in model.html:
         <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
      3. Replace the procedural subject meshes above with:

         BABYLON.SceneLoader.Append("assets/", "your-model.glb", scene, () => {
           console.log("Custom model loaded");
         });
    */

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
  }

  window.addEventListener('hsc:viewchange', event => {
    if (event.detail?.route === 'model') {
      initModel();
      setTimeout(() => engineRef?.resize(), 50);
    }
  });

  if ((location.hash || '#home') === '#model') initModel();
})();
