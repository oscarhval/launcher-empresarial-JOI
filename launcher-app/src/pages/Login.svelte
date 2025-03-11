<script>
  import { auth, googleProvider } from '../main.js';
  import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
  import { user } from '../store.js';

  let email = "";
  let password = "";
  let errorMessage = "";

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      user.set({ email: res.user.email, uid: res.user.uid });
      console.log("Login exitoso:", res.user);
      location.hash = '#dashboard';
    } catch (error) {
      errorMessage = error.message;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      user.set({ email: res.user.email, uid: res.user.uid });
      console.log("Login con Google exitoso:", res.user);
      location.hash = '#dashboard';
    } catch (error) {
      errorMessage = error.message;
    }
  };
</script>

<style lang="scss" src="../styles/login.scss"></style>

<main class="login-container">
  <div class="login-box">
    <h2>Iniciar sesión</h2>
    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}
    <form on:submit={handleLogin}>
      <div class="form-group">
        <label for="email"></label>
        <input type="email" id="email" bind:value={email} placeholder="Correo electrónico" required />
      </div>
      <div class="form-group">
        <label for="password"></label>
        <input type="password" id="password" bind:value={password} placeholder="Contraseña" required />
      </div>
      <button type="submit" class="btn">Entrar</button>
    </form>
    <div class="divider">o</div>
    <button class="btn google-btn" on:click={handleGoogleLogin}>
      Inicia sesión con
      <img src="/img/Google_2015_logo.png" alt="Google logo" style="margin-top: 5px; height: 30px; margin-left: 0.5rem;"/>
    </button>
  </div>
</main>
