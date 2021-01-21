const canvas = $("canvas");
// console.log(canvas);
const picture = canvas[0].getContext("2d");

let isDrawing = false;
let x = 0;
let y = 0;

drawing = (picture, xA, yA, xB, yB) => {
    picture.strokeStyle = "white";
    picture.lineWidth = 1;

    picture.beginPath();
    picture.moveTo(xA, yA);
    picture.lineTo(xB, yB);
    picture.stroke();
    picture.closePath();
};

draw = (e) => {
    isDrawing = true;
    x = e.offsetX;
    y = e.offsetY;
};

canvas.on("mousedown", (e) => {
    console.log("mousedown!");
    draw(e);
});
canvas.on("mousemove", (e) => {
    if (isDrawing === true) {
        console.log("mousemove!");
        drawing(picture, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});
$(window).on("mouseup", (e) => {
    if (isDrawing === true) {
        console.log("mouseup!");
        drawing(picture, x, y, e.offsetX, e.offsetY);
        isDrawing = false;
        x = 0;
        y = 0;
    }
});
