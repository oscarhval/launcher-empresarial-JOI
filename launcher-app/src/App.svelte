<script>
	import { onMount } from 'svelte';
	import Login from './pages/Login.svelte';
	import Register from './pages/Register.svelte';
	import Dashboard from './pages/Dashboard.svelte';
	import { user } from './store.js';
	import Fa from 'svelte-fa';
	import { faDollarSign, faFileInvoiceDollar, faBoxes, faBullhorn } from '@fortawesome/free-solid-svg-icons';
	
	let currentPage = 'welcome';
  
	let modules = [
	  { name: 'Ventas', icon: faDollarSign },
	  { name: 'Facturación', icon: faFileInvoiceDollar },
	  { name: 'Inventario', icon: faBoxes },
	  { name: 'Marketing', icon: faBullhorn },
	];
  
	// Si hay un usuario y la página actual NO es login ni register, redirige al dashboard.
	$: if ($user && currentPage !== 'dashboard' && currentPage !== 'login' && currentPage !== 'register') {
	  location.hash = '#dashboard';
	}
  
	onMount(() => {
	  if (location.hash) {
		currentPage = location.hash.slice(1);
	  }
	  window.addEventListener('hashchange', () => {
		currentPage = location.hash.slice(1) || 'welcome';
	  });
	});
  
	function goToLogin() {
	  location.hash = '#login';
	}
	
	function showLogin() {
	  location.hash = '#login';
	}
	
	function showRegister() {
	  location.hash = '#register';
	}
	
	function handleLogout() {
	  user.set(null);
	  location.hash = '#login';
	}
	
	function selectModule(module) {
	  console.log("Seleccionado:", module.name);
	}
  </script>
  
  {#if currentPage !== 'welcome'}
	<nav>
	  {#if currentPage === 'login'}
		<button on:click={showRegister}>Registrarse</button>
	  {:else if currentPage === 'register'}
		<button on:click={showLogin}>Iniciar sesión</button>
	  {:else}
		<button on:click={handleLogout}>Cerrar sesión</button>
	  {/if}
	</nav>
  {/if}
  
  {#if currentPage === 'welcome'}
	<section class="welcome">
	  <div class="welcome-content">
		<h1>Bienvenido al Launcher de Aplicaciones</h1>
		<p>Gestiona tu negocio con el dashboard JOI.</p>
		<button class="action-btn" on:click={goToLogin}>Comenzar</button>
		<div class="modules">
		  {#each modules as module}
			<div class="module" on:click={() => selectModule(module)}>
			  <Fa icon={module.icon} class="icon" /> <br>
			  <span class="module-name">{module.name}</span>
			</div>
		  {/each}
		</div>
	  </div>
	</section>
  {:else}
	<div id="login-section">
	  {#if currentPage === 'login'}
		<Login />
	  {:else if currentPage === 'register'}
		<Register />
	  {:else if currentPage === 'dashboard'}
		<Dashboard />
	  {/if}
	</div>
  {/if}
  
  <style lang="scss">
	:global(html, body) {
	  margin: 0;
	  padding: 0;
	  width: 100%;
	  height: 100%;
	  overflow: hidden;
	}
	* {
	  box-sizing: border-box;
	}
	@keyframes fadeIn {
	  from { opacity: 0; transform: translateY(20px); }
	  to { opacity: 1; transform: translateY(0); }
	}
	nav {
	  padding: 1rem;
	  background-color: #f5f5f5;
	  display: flex;
	  justify-content: flex-end;
	  align-items: center;
	  button {
		margin: 0 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		background-color: #000;
		color: #fff;
		border: none;
		border-radius: 8px;
		transition: background-color 0.3s ease;
		&:hover { background-color: #333; }
	  }
	}
	.welcome {
	  position: relative;
	  height: 100vh;
	  width: 100vw;
	  background-color: #e0e0e0;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  text-align: center;
	  color: #000;
	  overflow: hidden;
	}
	.welcome-content {
	  position: relative;
	  z-index: 2;
	  animation: fadeIn 1s ease-out;
	  max-width: 800px;
	  padding: 0 1rem;
	  h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		font-weight: 700;
	  }
	  p {
		font-size: 1.25rem;
		margin-bottom: 2rem;
	  }
	  .action-btn {
		background-color: #000;
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
		&:hover { background-color: #333; }
	  }
	  .modules {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 2rem;
		.module {
		  background: #fff;
		  border: 1px solid #ccc;
		  border-radius: 8px;
		  padding: 1rem;
		  width: 120px;
		  text-align: center;
		  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		  transition: transform 0.3s ease;
		  &:hover { transform: translateY(-2px); }
		  .icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; }
		  .module-name { font-size: 1rem; color: #333; }
		}
	  }
	}
  </style>
  