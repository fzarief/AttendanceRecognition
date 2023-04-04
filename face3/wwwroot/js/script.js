const video = document.getElementById('video');
const cameraList = document.getElementById('cameraList');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const detectButton = document.getElementById('detect');
let detecting = false;

async function setupCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${cameraList.length + 1}`;
        cameraList.add(option);
    });

    cameraList.addEventListener('change', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraList.value } });
        video.srcObject = stream;
    });

    if (videoDevices.length > 0) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraList.value } });
        video.srcObject = stream;
    }
}

async function setupFaceAPI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/lib/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/lib/weights');

    detectButton.addEventListener('click', () => {
        detecting = !detecting;
        if (detecting) {
            detectButton.textContent = 'Stop';
            video.style.display = 'block';
            detectFaces();
        } else {
            detectButton.textContent = 'Detect';
            video.style.display = 'none';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
}

async function detectFaces() {
    while (detecting) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);

        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

setupCamera().then(setupFaceAPI);
