
function show() {
   let p = document.getElementById('pwd');
   p.setAttribute('type', 'text');
}

function hide() {
   let p = document.getElementById('pwd');
   p.setAttribute('type', 'password');
}

var pwShown = 0;

document.getElementById("eye").addEventListener("click", () => {
   if (pwShown == 0) {
      pwShown = 1;
      show();
   } else {
      pwShown = 0;
      hide();
   }
}, false);
