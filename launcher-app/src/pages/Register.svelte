<script>
	import { auth, googleProvider } from '../main.js';
	import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
	import { user } from '../store.js';
  
	let email = "";
	let password = "";
	let confirmPassword = "";
	let errorMessage = "";
  
	const handleRegister = async (event) => {
	  event.preventDefault();
	  if (password !== confirmPassword) {
		errorMessage = "Las contraseñas no coinciden";
		return;
	  }
	  try {
		const res = await createUserWithEmailAndPassword(auth, email, password);
		// Cierra la sesión para que el usuario no quede logueado automáticamente
		await signOut(auth);
		user.set(null);
		alert("Registro exitoso, por favor inicie sesión");
		location.hash = '#login';
	  } catch (error) {
		errorMessage = error.message;
	  }
	};
  
	const handleGoogleSignUp = async () => {
	  try {
		const res = await signInWithPopup(auth, googleProvider);
		user.set({ email: res.user.email, uid: res.user.uid });
		console.log("Registro/Inicio con Google exitoso:", res.user);
		// Si prefieres que el login con Google vaya al dashboard, redirige así
		location.hash = '#dashboard';
	  } catch (error) {
		errorMessage = error.message;
	  }
	};
  </script>
  
  <style lang="scss" src="../styles/register.scss"></style>
  
  <main class="register-container">
	<div class="register-box">
	  <h2>Registrarse</h2>
	  {#if errorMessage}
		<p class="error">{errorMessage}</p>
	  {/if}
	  <form on:submit={handleRegister}>
		<div class="form-group">
		  <label for="email"></label>
		  <input type="email" id="email" bind:value={email} placeholder="Correo electrónico" required />
		</div>
		<div class="form-group">
		  <label for="password"></label>
		  <input type="password" id="password" bind:value={password} placeholder="Contraseña" required />
		</div>
		<div class="form-group">
		  <label for="confirmPassword"></label>
		  <input type="password" id="confirmPassword" bind:value={confirmPassword} placeholder="Confirmar contraseña" required />
		</div>
		<button type="submit" class="btn">Registrarse</button>
	  </form>
	  <div class="divider">o</div>
	  <button class="btn google-btn" on:click={handleGoogleSignUp}>
		Continua con
		<img src="/img/Google_2015_logo.png" alt="Google logo" style="margin-top: 5px; height: 30px; margin-left: 0.5rem;"/>
	  </button>
	</div>
  </main>
  