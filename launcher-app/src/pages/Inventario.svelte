<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  const primaryBlue = "#007bff";
  const lightBlue   = "#85c7ff";
  const darkBlue    = "#0056b3";

  let totalProductos = 0;
  let productosCriticos = 0;
  let productosNoCriticos = 0;

  onMount(async () => {
    try {
      const response = await fetch('/data/dashboard-data.csv');
      const text = await response.text();
      const rows = text.trim().split('\n').map(row => row.split(','));
      let inventarioRow = rows.find(row => row[0].trim().toLowerCase() === "inventario");

      if (inventarioRow) {
        totalProductos = parseFloat(inventarioRow[5]) || 0;
        productosCriticos = parseFloat(inventarioRow[6]) || 0;
        productosNoCriticos = totalProductos - productosCriticos;
      }

      drawDonutChart();
      drawVerticalBarChart();
    } catch (error) {
      console.error("Error al cargar CSV:", error);
    }
  });

  function drawDonutChart() {
    const width = 340, height = 340;
    const radius = Math.min(width, height) / 2 - 10;
    d3.select('#chart1').selectAll('*').remove();

    const svg = d3.select('#chart1')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const defs = svg.append('defs');

    const arcShadow = defs.append('filter')
      .attr('id', 'arc-shadow');
    arcShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');
    arcShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 3)
      .attr('dy', 3)
      .attr('result', 'offsetBlur');
    const feMergeArc = arcShadow.append('feMerge');
    feMergeArc.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMergeArc.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const labelShadow = defs.append('filter')
      .attr('id', 'label-shadow');
    labelShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1.5)
      .attr('result', 'blur');
    labelShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    const feMergeLabel = labelShadow.append('feMerge');
    feMergeLabel.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMergeLabel.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const data = { "Críticos": productosCriticos, "No críticos": productosNoCriticos };
    const pie = d3.pie().value(d => d[1]);
    const data_ready = pie(Object.entries(data));

    const color = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range([primaryBlue, lightBlue]);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius)
      .cornerRadius(5);

    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data[0]))
      .attr('stroke', '#fff')
      .style('stroke-width', '2px')
      .attr('filter', 'url(#arc-shadow)')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d.data[0] === "Críticos" ? darkBlue : d3.color(lightBlue).darker(0.5))
          .attr('opacity', 0.85);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', color(d.data[0]))
          .attr('opacity', 1);
      });

    const labels = svg.selectAll('.label')
      .data(data_ready)
      .join('g')
      .attr('class','label')
      .attr('transform', d => `translate(${arc.centroid(d)})`);

    labels.each(function(d) {
      const g = d3.select(this);
      g.append('text')
        .text(`${d.data[0]}: ${d.data[1]}`)
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#000')
        .style('font-weight', 'bold');
    });
  }

  function drawVerticalBarChart() {
    const width = 340, height = 300, margin = { top: 20, right: 20, bottom: 40, left: 40 };
    d3.select('#chart2').selectAll('*').remove();

    const svg = d3.select('#chart2')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');

    const gradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryBlue);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.color(primaryBlue).brighter(1.5));

    const barShadow = defs.append('filter')
      .attr('id', 'bar-shadow');
    barShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur');
    barShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    const feMergeBar = barShadow.append('feMerge');
    feMergeBar.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMergeBar.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const labelShadow = defs.append('filter')
      .attr('id', 'label-shadow');
    labelShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1.5)
      .attr('result', 'blur');
    labelShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    const feMergeLabel = labelShadow.append('feMerge');
    feMergeLabel.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMergeLabel.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const categories = ["Críticos", "No Críticos"];
    const values = [productosCriticos, productosNoCriticos];

    const x = d3.scaleBand()
      .domain(categories)
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const bars = svg.selectAll('rect')
      .data(values)
      .join('rect')
      .attr('x', (d, i) => x(categories[i]))
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d))
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'url(#bar-gradient)')
      .attr('filter', 'url(#bar-shadow)')
      .attr('opacity', 0)
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', darkBlue);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', 'url(#bar-gradient)');
      });

    bars.transition()
      .duration(800)
      .attr('opacity', 1);

    const barLabels = svg.selectAll('.bar-label')
      .data(values)
      .join('g')
      .attr('class', 'bar-label')
      .attr('transform', (d, i) => `translate(${x(categories[i]) + x.bandwidth() / 2}, ${y(d) - 5})`);

    barLabels.each(function(d) {
      const g = d3.select(this);
      g.append('text')
        .text(d)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#000');
    });

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#000');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#000');
  }
</script>

<style lang="scss" src="../styles/inventario.scss"></style>

<main class="inventario-container">
  <div class="generic-data">
    <h3>Datos de inventario</h3>
    <p>Total de productos: {totalProductos}</p>
    <p>Productos críticos: {productosCriticos}</p>
  </div>
  <div class="charts">
    <div class="chart2-container">
      <svg id="chart2"></svg>
    </div>
    <div class="chart1-container">
      <svg id="chart1"></svg>
    </div>
  </div>
</main>
