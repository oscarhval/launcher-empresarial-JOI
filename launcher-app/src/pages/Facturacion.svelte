<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  const primaryBlue = "#007bff";  
  const lightBlue   = "#85c7ff";   
  const darkBlue    = "#0056b3";   

  let ingresos = 0;
  let numFacturas = 0;
  let porcentajePagadas = 0;
  let facturasPagadas = 0;
  let facturasNoPagadas = 0;

  onMount(async () => {
    try {
      const response = await fetch('/data/dashboard-data.csv');
      const text = await response.text();
      const rows = text.trim().split('\n').map(row => row.split(','));
      let facturacionRow = rows.find(row => row[0].trim().toLowerCase() === "facturación");

      if (facturacionRow) {
        ingresos = parseFloat(facturacionRow[2]) || 0;
        numFacturas = parseFloat(facturacionRow[4]) || 0;
        porcentajePagadas = parseFloat(facturacionRow[5]) || 0;
        facturasPagadas = Math.round(numFacturas * (porcentajePagadas / 100));
        facturasNoPagadas = numFacturas - facturasPagadas;
      }

      drawPieChart();
      drawHorizontalPointChart();
    } catch (error) {
      console.error("Error al cargar CSV:", error);
    }
  });

  function drawPieChart() {
    const width = 340;
    const height = 340;
    const radius = Math.min(width, height) / 2;

    d3.select('#chart1').selectAll('*').remove();

    const svg = d3.select('#chart1')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const defs = svg.append('defs');

    const arcFilter = defs.append('filter')
      .attr('id', 'drop-shadow');
    arcFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');
    arcFilter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    const feMerge = arcFilter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const labelFilter = defs.append('filter')
      .attr('id', 'label-shadow');
    labelFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1)
      .attr('result', 'blur');
    labelFilter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');
    const feMergeLabel = labelFilter.append('feMerge');
    feMergeLabel.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMergeLabel.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const data = {
      "Pagadas": facturasPagadas,
      "No pagadas": facturasNoPagadas
    };

    const pie = d3.pie().value(d => d[1]);
    const data_ready = pie(Object.entries(data));

    const color = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range([primaryBlue, lightBlue]);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius - 10);

    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data[0]))
      .attr('stroke', '#fff')
      .style('stroke-width', '2px')
      .attr('filter', 'url(#drop-shadow)')
      .on('mouseover', function(event, d) {
        const hoverColor = d.data[0] === "Pagadas"
          ? darkBlue
          : d3.color(lightBlue).darker(0.5);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', hoverColor)
          .attr('transform', function(d) {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.05}, ${y * 0.05})`;
          })
          .attr('opacity', 0.8);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', color(d.data[0]))
          .attr('transform', 'translate(0,0)')
          .attr('opacity', 1);
      });

    const labelArc = d3.arc()
      .innerRadius(radius - 40)
      .outerRadius(radius - 40);

    const labels = svg.selectAll('.label')
      .data(data_ready)
      .join('g')
      .attr('class','label')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`);

    labels.each(function(d) {
      const g = d3.select(this);
      const text = g.append('text')
        .text(`${d.data[0]}: ${d.data[1]}`)
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#000')
        .style('font-weight', 'bold');
      const bbox = text.node().getBBox();
      g.insert('rect','text')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)
        .attr('fill', '#fff')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('filter', 'url(#label-shadow)');
    });
  }

  function drawHorizontalPointChart() {
    const width = 500;
    const height = 140;
    const margin = { left: 40, right: 40 };

    d3.select('#chart2').selectAll('*').remove();

    const svg = d3.select('#chart2')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryBlue);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', lightBlue);

    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([margin.left, width - margin.right]);

    const barHeight = 15;
    const barY = height / 2 - barHeight / 2;

    svg.append('rect')
      .attr('x', x(0))
      .attr('y', barY)
      .attr('width', x(100) - x(0))
      .attr('height', barHeight)
      .attr('fill', '#e6e6e6')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('filter', 'url(#drop-shadow)');

    svg.append('rect')
      .attr('x', x(0))
      .attr('y', barY)
      .attr('width', 0)
      .attr('height', barHeight)
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 4)
      .attr('ry', 4)
      .transition()
      .duration(1000)
      .attr('width', x(porcentajePagadas) - x(0));

    svg.append('line')
      .attr('x1', x(porcentajePagadas))
      .attr('x2', x(porcentajePagadas))
      .attr('y1', barY - 20)
      .attr('y2', barY + barHeight + 10)
      .attr('stroke', darkBlue)
      .attr('stroke-dasharray', '4 2')
      .attr('stroke-width', 1);

    const labelGroup = svg.append('g')
      .attr('transform', `translate(${x(porcentajePagadas)}, ${barY - 30})`);

    const labelText = labelGroup.append('text')
      .text(`${porcentajePagadas}%`)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#000')
      .style('font-weight', 'bold');

    const bbox = labelText.node().getBBox();
    labelGroup.insert('rect', 'text')
      .attr('x', bbox.x - 4)
      .attr('y', bbox.y - 2)
      .attr('width', bbox.width + 8)
      .attr('height', bbox.height + 4)
      .attr('fill', '#fff')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('filter', 'url(#label-shadow)');

    const marker = svg.append('circle')
      .attr('cx', x(porcentajePagadas))
      .attr('cy', barY + barHeight / 2)
      .attr('r', 0)
      .attr('fill', darkBlue);

    marker.transition()
      .duration(1000)
      .attr('r', 6)
      .transition()
      .duration(500)
      .attr('r', 8)
      .transition()
      .duration(500)
      .attr('r', 6);
  }
</script>

<style lang="scss" src="../styles/facturacion.scss"></style>

<main class="facturacion-container">

  <div class="generic-data">
    <h3>Datos de facturación</h3>
    <p>Número de facturas: {numFacturas}</p>
    <p>Porcentaje pagadas: {porcentajePagadas}%</p>
  </div>
  
  <div class="charts">
    <div class="chart1-container">
      <svg id="chart1"></svg>
    </div>
    <div class="chart2-container">
      <svg id="chart2"></svg>
    </div>
  </div>

</main>
