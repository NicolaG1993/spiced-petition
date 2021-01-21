const canvas = $("canvas");
const picture = canvas.getContext("2d");

let drawing = false;
let x = 0;
let y = 0;

draw = (picture, x1, y1, x2, y2) => {
    picture.strokeStyle = "white";
    picture.lineWidth = 1;

    picture.beginPath();
    picture.moveTo;
};

canvas.on("mousedown", draw);
canvas.on("mousemove");
window.on("mouseup");
