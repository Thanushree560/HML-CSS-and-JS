const colors = [
    "red",
    "green",
    "blue",
    "purple",
    "orange",
    "pink",
    "yellow",
    "cyan"
];

const btn = document.getElementById("btn");

btn.addEventListener("click", () => {
    const random = Math.floor(Math.random() * colors.length);
    document.body.style.backgroundColor = colors[random];
});