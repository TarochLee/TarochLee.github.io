const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultText = document.getElementById("gender-result");

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(video);
    });
}

async function loadModels() {
    window.faceModel = await blazeface.load();
    window.genderModel = await mobilenet.load(); // 使用 MobileNet 进行性别分类
}

async function detectGender() {
    if (!window.faceModel || !window.genderModel) return;

    const predictions = await window.faceModel.estimateFaces(video, false);
    
    if (predictions.length > 0) {
        const face = predictions[0];
        
        // 获取摄像头画面
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 裁剪人脸区域
        const faceImageData = ctx.getImageData(
            face.topLeft[0], face.topLeft[1],
            face.bottomRight[0] - face.topLeft[0],
            face.bottomRight[1] - face.topLeft[1]
        );

        // 进行性别分类
        const tensor = tf.browser.fromPixels(faceImageData).resizeNearestNeighbor([224, 224]).toFloat().expandDims();
        const prediction = await window.genderModel.classify(tensor);

        // 识别性别
        const gender = prediction[0].className.includes("man") ? "Male" : "Female";
        resultText.innerText = `检测结果：${gender}`;
    } else {
        resultText.innerText = "未检测到人脸";
    }

    requestAnimationFrame(detectGender);
}

async function main() {
    await setupCamera();
    await loadModels();
    detectGender();
}

main();