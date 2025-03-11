<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  const primaryColor = "#007bff";
  const secondaryColor = "#0056b3";

  let ventasData = [];
  let lineData = [];
  let genericData = { totalVentas: 0, ingresos: 0 };

  onMount(async () => {
    try {
      const response = await fetch('/data/dashboard-data.csv');
      const text = await response.text();
      const rows = text.trim().split('\n').map(row => row.split(','));
      let ventasRow = rows.find(row => row[0].trim().toLowerCase() === "ventas");
      if (ventasRow) {
        ventasData = ventasRow[3]
          ? ventasRow[3].replace(/"/g, '').split(';').map(Number)
          : [];
        lineData = [...ventasData];
        genericData = {
          totalVentas: parseFloat(ventasRow[1]) || ventasData.reduce((a, b) => a + b, 0),
          ingresos: parseFloat(ventasRow[2]) || 12000
        };
      }
      drawBarChart();
      drawLineChart();
    } catch (error) {
      console.error("Error al cargar CSV:", error);
    }
  });

  function drawBarChart() {
    const width = 500,
          height = 300,
          margin = { top: 20, right: 20, bottom: 30, left: 40 };

    d3.select('#bar-chart').selectAll('*').remove();

    const svg = d3.select('#bar-chart')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'bar-shadow');
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur');
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const gradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryColor);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.color(primaryColor).brighter(1.5));

    const x = d3.scaleBand()
      .domain(ventasData.map((_, i) => i))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(ventasData)]).nice()
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .selectAll('rect')
      .data(ventasData)
      .join('rect')
        .attr('x', (_, i) => x(i))
        .attr('y', d => y(d))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d))
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', 'url(#bar-gradient)')
        .attr('filter', 'url(#bar-shadow)')
        .on('mouseover', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', secondaryColor);
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', 'url(#bar-gradient)');
        })
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .attr('opacity', 1);

    const barLabels = svg.selectAll('.bar-label')
      .data(ventasData)
      .join('g')
      .attr('class', 'bar-label')
      .attr('transform', (_, i) => {
        return `translate(${x(i) + x.bandwidth() / 2}, ${y(ventasData[i]) - 5})`;
      });

    barLabels.each(function(d) {
      const g = d3.select(this);
      const text = g.append('text')
        .text(d)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#000');
      const bbox = text.node().getBBox();
      g.insert('rect', 'text')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', '#fff')
        .attr('opacity', 0.8);
    });

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(i => `Día ${i + 1}`))
      .attr('font-size', '12px')
      .attr('color', '#000');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .attr('font-size', '12px')
      .attr('color', '#000');
  }

  function drawLineChart() {
    const width = 500,
          height = 300,
          margin = { top: 20, right: 20, bottom: 30, left: 40 };

    d3.select('#line-chart').selectAll('*').remove();

    const svg = d3.select('#line-chart')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');
    const lineShadow = defs.append('filter')
      .attr('id', 'line-shadow');
    lineShadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur');
    lineShadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    const feMergeLine = lineShadow.append('feMerge');
    feMergeLine.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMergeLine.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const gradientLine = defs.append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    gradientLine.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', primaryColor);
    gradientLine.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.color(primaryColor).brighter(1.5));

    const x = d3.scaleLinear()
      .domain([0, lineData.length - 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(lineData)]).nice()
      .range([height - margin.bottom, margin.top]);

    const area = d3.area()
      .x((d, i) => x(i))
      .y0(y(0))
      .y1(d => y(d));

    svg.append('path')
      .datum(lineData)
      .attr('fill', d3.color(primaryColor).brighter(2))
      .attr('opacity', 0.2)
      .attr('d', area);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveCatmullRom);

    svg.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#line-shadow)')
      .attr('d', line);

    const points = svg.selectAll('.point')
      .data(lineData)
      .join('circle')
      .attr('class', 'point')
      .attr('cx', (_, i) => x(i))
      .attr('cy', d => y(d))
      .attr('r', 0)
      .attr('fill', secondaryColor);

    points.transition()
      .duration(800)
      .attr('r', 4);

    points.on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', d3.color(secondaryColor).brighter(1.2));
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4)
          .attr('fill', secondaryColor);
      });

    const pointLabels = svg.selectAll('.point-label')
      .data(lineData)
      .join('g')
      .attr('class', 'point-label')
      .attr('transform', (d, i) => `translate(${x(i)}, ${y(d) - 10})`);

    pointLabels.each(function(d) {
      const g = d3.select(this);
      const text = g.append('text')
        .text(d)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#000');
      const bbox = text.node().getBBox();
      g.insert('rect', 'text')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', '#fff')
        .attr('opacity', 0.8);
    });

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(lineData.length).tickFormat(i => `Día ${i + 1}`))
      .attr('font-size', '12px')
      .attr('color', '#000');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .attr('font-size', '12px')
      .attr('color', '#000');
  }
</script>

<style lang="scss" src="../styles/ventas.scss"></style>

<main class="ventas-container">
  <div class="generic-data">
    <h3>Datos de ventas</h3>
    <p>Total de ventas: {genericData.totalVentas}</p>
    <p>Ingresos: ${genericData.ingresos}</p>
  </div>
  <div class="charts">
    <svg id="bar-chart"></svg>
    <svg id="line-chart"></svg>
  </div>
</main>
