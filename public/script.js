document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const button = document.querySelector('button');
    
    // Deshabilitar botón mientras procesa
    button.disabled = true;
    button.textContent = 'Verificando...';
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar usuario y usuarioId en localStorage
            localStorage.setItem('usuario', data.usuario);
            localStorage.setItem('usuarioId', data.usuarioId);
            
            // Redirigir al dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert('❌ ' + data.message);
        }
        
    } catch (error) {
        alert('❌ Error al conectar con el servidor');
        console.error('Error:', error);
    } finally {
        // Rehabilitar botón
        button.disabled = false;
        button.textContent = 'Entrar';
    }
});