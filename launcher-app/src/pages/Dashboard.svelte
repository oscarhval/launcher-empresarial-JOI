<script>
  import Fa from 'svelte-fa';
  import { faDollarSign, faFileInvoiceDollar, faBoxes, faBullhorn } from '@fortawesome/free-solid-svg-icons';
  
  import Ventas from '../pages/Ventas.svelte';
  import Facturacion from '../pages/Facturacion.svelte';
  import Inventario from '../pages/Inventario.svelte';
  import Marketing from '../pages/Marketing.svelte';
  
  let modules = [
    { name: 'Ventas', icon: faDollarSign },
    { name: 'Facturación', icon: faFileInvoiceDollar },
    { name: 'Inventario', icon: faBoxes },
    { name: 'Marketing', icon: faBullhorn },
  ];
  
  const moduleComponents = {
    Ventas,
    "Facturación": Facturacion,
    Inventario,
    Marketing
    
    
  };
  
  let selectedModule = null;
  
  function selectModule(module) {
    selectedModule = module;
    console.log("Seleccionado:", module.name);
  }



</script>
  
<style lang="scss" src="../styles/dashboard.scss"></style>
    
  <nav class="dashboard-nav">
      <h3>Dashboard JOI</h3>
    <hr class="divider" />
  {#each modules as module}
    <div 
      class="dashboard-module" 
      role="button"
      tabindex="0"
      on:click={() => selectModule(module)}
      on:keydown={(e) => e.key === 'Enter' && selectModule(module)}>
      <Fa icon={module.icon} class="icon" /><br>
      <span class="module-name">{module.name}</span>
    </div>
  {/each}
</nav>
    
<main class="dashboard-content">
  {#if selectedModule}
    <svelte:component this={moduleComponents[selectedModule.name]} />
  {:else}
    <div class="empty-state">
      <h2>¡Bienvenido al Dashboard JOI!</h2>
      <p>Seleccione un módulo para ver su contenido</p>
    </div>
  {/if}
</main>

