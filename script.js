const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const objectNameElement = document.getElementById('object-name');

// Solicita acesso à câmera com resolução reduzida
navigator.mediaDevices.getUserMedia({
  video: { width: 320, height: 240 }
}).then((stream) => {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
    detectObjects();
  };
}).catch((err) => {
  console.error('Erro ao acessar a câmera: ', err);
});

// Carrega o modelo COCO-SSD e inicia a detecção de objetos
async function detectObjects() {
  const model = await cocoSsd.load();
  console.log('Modelo COCO-SSD carregado!');

  setInterval(async () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const predictions = await model.detect(video);

    // Limpa a canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Log das previsões para depuração
    console.log('Predictions:', predictions);

    // Desenha as previsões
    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;
        context.strokeStyle = 'lime';
        context.lineWidth = 4;
        context.strokeRect(x, y, width, height);
        context.font = '18px Arial';
        context.fillStyle = 'lime';
        context.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x, y > 10 ? y - 5 : y + 15);

        // Adiciona sombra ao texto
        context.shadowColor = 'black';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        // Exibe o nome do objeto detectado
        objectNameElement.textContent = `Objeto detectado: ${prediction.class} (${Math.round(prediction.score * 100)}%)`;
      });
    } else {
      objectNameElement.textContent = 'Nenhum objeto detectado';
    }
  }, 200); // Intervalo ajustado para 200ms
}