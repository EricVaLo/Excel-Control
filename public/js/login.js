document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');
  msg.textContent = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error');
    msg.textContent = 'Login correcto. Redirigiendo...';
    // aquí redirige según role si quieres
    setTimeout(() => window.location.href = '/public/dashboard.html', 700);
  } catch (err) {
    msg.textContent = err.message || 'Error en login';
  }
});