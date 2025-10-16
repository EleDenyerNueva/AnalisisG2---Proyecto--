document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;
  const mensaje = document.getElementById("mensaje");

  if (usuario === "admin" && clave === "1234") {
    mensaje.textContent = "Inicio de sesión exitoso.";
    mensaje.style.color = "green";
  } else {
    mensaje.textContent = "Usuario o contraseña incorrectos.";
    mensaje.style.color = "red";
  }
});
