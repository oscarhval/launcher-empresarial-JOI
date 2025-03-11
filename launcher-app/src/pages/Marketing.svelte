<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  const primaryBlue = "#007bff";  
  const lightBlue   = "#85c7ff";   
  const darkBlue    = "#0056b3";   

  let leads = 0;
  let conversionRate = 0;
  let roi = 0;
  let engagement = 0;
  let campaigns = [];

  onMount(async () => {
    try {
      const response = await fetch('/data/dashboard-data.csv');
      const text = await response.text();
      const rows = text.trim().split('\n').map(row => row.split(','));
      let marketingRow = rows.find(row => row[0].trim().toLowerCase() === "marketing");

      if (marketingRow) {
        leads = parseFloat(marketingRow[11]) || 0;
        conversionRate = parseFloat(marketingRow[12]) || 0;
        roi = parseFloat(marketingRow[13]) || 0;
        engagement = parseFloat(marketingRow[14]) || 0;
      }

      drawSegmentedBarChart();
      generateCampaignsData();
      drawScatterPlot();
    } catch (error) {
      console.error("Error al cargar CSV:", error);
    }
  });

  function drawSegmentedBarChart() {
    const canales = [
      { canal: "RRSS", leads: Math.round(leads * 0.4) },
      { canal: "Email", leads: Math.round(leads * 0.3) },
      { canal: "SEO", leads: Math.round(leads * 0.3) }
    ];
    
    const width = 500, height = 150, margin = { left: 50, right: 50, top: 20, bottom: 50 };

    d3.select('#chart1').selectAll('*').remove();

    const svg = d3.select('#chart1')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const x = d3.scaleLinear()
      .domain([0, leads])
      .range([margin.left, width - margin.right]);

    let acumulado = 0;
    canales.forEach(d => {
      d.inicio = acumulado;
      acumulado += d.leads;
      d.fin = acumulado;
    });

    svg.selectAll('rect')
      .data(canales)
      .join('rect')
      .attr('x', d => x(d.inicio))
      .attr('y', height / 2 - 20)
      .attr('width', d => x(d.fin) - x(d.inicio))
      .attr('height', 40)
      .attr('fill', (d, i) => i % 2 === 0 ? primaryBlue : lightBlue)
      .attr('rx', 6)
      .attr('ry', 6);

    svg.selectAll('text')
      .data(canales)
      .join('text')
      .attr('x', d => x(d.inicio) + (x(d.fin) - x(d.inicio)) / 2)
      .attr('y', height / 2 + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .text(d => x(d.fin) - x(d.inicio) > 50 ? `${d.canal}: ${d.leads}` : "");

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text')
      .style('font-size', '12px')
      .attr('dy', '1em');
  }

  function generateCampaignsData() {
    campaigns = [
      { conversion: conversionRate - 2, engagement: engagement - 5 },
      { conversion: conversionRate, engagement: engagement },
      { conversion: conversionRate + 3, engagement: engagement + 4 },
      { conversion: conversionRate - 1, engagement: engagement + 2 },
      { conversion: conversionRate + 2, engagement: engagement - 3 }
    ];
  }

  function drawScatterPlot() {
    const width = 400, height = 300, margin = { top: 20, right: 20, bottom: 40, left: 50 };

    d3.select('#chart2').selectAll('*').remove();

    const svg = d3.select('#chart2')
      .attr('width', width)
      .attr('height', height);

    const x = d3.scaleLinear()
      .domain([d3.min(campaigns, d => d.conversion) - 5, d3.max(campaigns, d => d.conversion) + 5])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(campaigns, d => d.engagement) - 5, d3.max(campaigns, d => d.engagement) + 5])
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'));

    svg.selectAll('circle')
      .data(campaigns)
      .join('circle')
      .attr('cx', d => x(d.conversion))
      .attr('cy', d => y(d.engagement))
      .attr('r', 10)
      .attr('fill', primaryBlue)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this).attr('fill', darkBlue);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', primaryBlue);
      });

    svg.selectAll('text.label')
      .data(campaigns)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => x(d.conversion))
      .attr('y', d => y(d.engagement) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text((d, i) => `Campaña ${i+1}`);
  }
</script>

<style lang="scss" src="../styles/marketing.scss"></style>

<main class="marketing-container">

  <div class="generic-data">
    <h3>Datos de marketing</h3>
    <p>Leads generados: {leads}</p>
    <p>Tasa de conversión: {conversionRate}%</p>
    <p>Retorno de inversión: {roi}%</p>
    <p>Índice de compromiso: {engagement}%</p>
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
