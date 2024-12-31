const marker = document.getElementById('marker');
const container = document.getElementById('container');
const model = document.getElementById('model');
const rotateButton = document.getElementById('rotateButton');

let isRotating = true; // Trạng thái tự động xoay
let isPersistent = false; // Trạng thái giữ mô hình khi mất marker
let rotation = { x: 0, y: 0, z: 0 };
let lastTouchX = 0;
let lastTouchY = 0;
let lastDistance = 0;
let scale = 0.1;
let isTouching = false;

// Lưu vị trí và góc của mô hình
let savedPosition = { x: 0, y: 0, z: 0 };
let savedRotation = { x: 0, y: 0, z: 0 };

// Khi marker được phát hiện
marker.addEventListener('markerFound', () => {
    console.log('Marker found!');
    isPersistent = true;
    savedPosition = container.getAttribute('position');
    savedRotation = container.getAttribute('rotation');
});

// Khi marker mất
marker.addEventListener('markerLost', () => {
    console.log('Marker lost!');
    if (isPersistent) {
        container.setAttribute('position', savedPosition);
        container.setAttribute('rotation', savedRotation);
        container.setAttribute('visible', 'true'); // Đảm bảo mô hình vẫn hiển thị
        model.setAttribute('position', { x: 0, y: 0, z: 0 }); // Đảm bảo mô hình vẫn hiển thị
        model.setAttribute('rotation', { x: 0, y: 0, z: 0 }); // Đảm bảo mô hình vẫn hiển thị
        model.setAttribute('visible', 'true'); // Đảm bảo mô hình vẫn hiển thị
        container.object3D.visible = true;
        model.object3D.visible = true;
    }
});

// Tự động xoay mô hình
function autoRotate() {
    if (isRotating && !isTouching) {
        rotation.y += 1; // Xoay quanh trục Y
        if (rotation.y >= 360) rotation.y = 0;
        container.setAttribute('rotation', rotation);
    }
}

// Tự động xoay với tốc độ 20ms
setInterval(autoRotate, 20);

// Tính khoảng cách giữa 2 ngón tay (cho phóng to/thu nhỏ)
function getDistance(touch1, touch2) {
    let dx = touch2.clientX - touch1.clientX;
    let dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Xử lý thao tác vuốt và phóng to/thu nhỏ
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        isTouching = true;
    } else if (e.touches.length === 2) {
        lastDistance = getDistance(e.touches[0], e.touches[1]);
    }
});

document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        let deltaX = e.touches[0].clientX - lastTouchX;
        let deltaY = e.touches[0].clientY - lastTouchY;

        rotation.y += deltaX * 0.2; // Xoay theo trục Y khi vuốt ngang
        rotation.x -= deltaY * 0.2; // Xoay theo trục X khi vuốt dọc
        container.setAttribute('rotation', rotation);

        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        let newDistance = getDistance(e.touches[0], e.touches[1]);
        let scaleFactor = newDistance / lastDistance;

        scale *= scaleFactor; // Thay đổi tỷ lệ mô hình
        model.setAttribute('scale', `${scale} ${scale} ${scale}`);
        lastDistance = newDistance;
    }
});

document.addEventListener('touchend', () => {
    isTouching = false;
});

// Nút bật/tắt tự động xoay
rotateButton.addEventListener('click', () => {
    isRotating = !isRotating;
    rotateButton.textContent = isRotating ? 'Dừng xoay' : 'Bật xoay';
});
