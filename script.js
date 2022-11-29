
const btn = document.querySelector("button");

btn.addEventListener("click", () => {
    Notification.requestPermission().then( perm => {
        //alert(perm);
        if(perm === "granted"){
            new Notification("przykładowa", {
                body: "To jest dodatkowy tekst.",
                icon: "public/logo192.png",
                tag: "przykładowa"
            });
        }
    })
//alert("Klik");
});

function silnia(n) {
    if(n == 0) return 1;
    return silnia(n-1) * n;
}