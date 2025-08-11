// Manejo de autenticación
document.addEventListener('DOMContentLoaded', () => {
  // Login
  if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('loginMessage');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Guardar token en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          
          // Redirigir según el rol
          if (data.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'user.html';
          }
        } else {
          showMessage(messageDiv, data.message, 'error');
        }
      } catch (error) {
        showMessage(messageDiv, 'Error de conexión con el servidor', 'error');
      }
    });
  }
  
  // Logout
  const logoutBtns = document.querySelectorAll('#logoutBtn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = 'login.html';
    });
  });
  
  // Panel de administrador
  if (document.getElementById('registerForm')) {
    // Cargar usuarios registrados
    loadUsers();
    
    // Registrar nuevo usuario
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('registerMessage');
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newEmail = document.getElementById('newEmail').value;
      const newPassword = document.getElementById('newPassword').value;
      const token = localStorage.getItem('token');
      
      if (!token) {
        showMessage(messageDiv, 'Sesión expirada. Por favor inicie sesión nuevamente.', 'error');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            adminToken: token,
            newUser: {
              email: newEmail,
              password: newPassword
            }
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          showMessage(messageDiv, 'Usuario registrado con éxito', 'success');
          registerForm.reset();
          loadUsers(); // Recargar lista de usuarios
        } else {
          showMessage(messageDiv, data.message, 'error');
        }
      } catch (error) {
        showMessage(messageDiv, 'Error de conexión con el servidor', 'error');
      }
    });
  }
  
  // Panel de usuario (gestor de Excel)
  if (document.getElementById('fileInput')) {
    // Aquí iría el código del gestor de Excel que creamos anteriormente
  }
});

// Función para cargar usuarios registrados (solo admin)
async function loadUsers() {
  const token = localStorage.getItem('token');
  const usersList = document.getElementById('usersList');
  
  if (!token || !usersList) return;
  
  try {
    const response = await fetch('http://localhost:5000/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      usersList.innerHTML = '';
      
      if (data.users.length === 0) {
        usersList.innerHTML = '<tr><td colspan="3">No hay usuarios registrados</td></tr>';
        return;
      }
      
      data.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            <button class="delete-user" data-email="${user.email}">Eliminar</button>
          </td>
        `;
        usersList.appendChild(row);
      });
      
      // Agregar event listeners para botones de eliminar
      document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const email = e.target.dataset.email;
          // Aquí implementarías la lógica para eliminar usuarios
          alert(`Funcionalidad de eliminar usuario para ${email}`);
        });
      });
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
}

// Función para mostrar mensajes
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
  element.style.display = 'block';
  
  // Ocultar mensaje después de 5 segundos
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}