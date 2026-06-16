import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Award, Clock, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { DesignBrief } from '../types';

interface StudioInsightsProps {
  changeTrigger: number;
}

export default function StudioInsights({ changeTrigger }: StudioInsightsProps) {
  const donutSvgRef = useRef<SVGSVGElement>(null);
  const barSvgRef = useRef<SVGSVGElement>(null);
  const [metrics, setMetrics] = useState({
    totalProjects: 24,
    completedCount: 18,
    revisionsCount: 4,
    draftsCount: 2,
    totalHours: 123,
    hoursByCategory: [
      { name: 'Fitness', hours: 38 },
      { name: 'Fashion', hours: 28 },
      { name: 'Minimal', hours: 42 },
      { name: 'Offers', hours: 15 },
    ]
  });

  // Load and crunch metrics from localStorage to merge with default historical benchmarks
  useEffect(() => {
    const rawData = localStorage.getItem('creativenode_briefs');
    let briefsList: DesignBrief[] = [];
    if (rawData) {
      try {
        briefsList = JSON.parse(rawData);
      } catch (e) {
        console.error("Error parsing briefs for StudioInsights metrics:", e);
      }
    }

    // Baseline stats
    let completed = 18;
    let revisions = 4;
    let drafts = Math.max(2, briefsList.length);
    let fitnessHours = 38;
    let fashionHours = 28;
    let minimalHours = 42;
    let offersHours = 15;

    // Map new custom briefs into category design hours
    briefsList.forEach(brief => {
      completed += brief.deliverySpeed === 'express' ? 0 : 1;
      revisions += brief.deliverySpeed === 'express' ? 1 : 0;
      
      const category = brief.composition.bgType === 'color' ? 'minimalist' : 'fitness';
      const hoursToAdd = brief.selectedTier === 'professional' ? 8 : brief.selectedTier === 'standard' ? 4 : 2;
      
      if (category === 'fitness') fitnessHours += hoursToAdd;
      else if (category === 'minimalist' || brief.composition.theme.includes('Gold')) minimalHours += hoursToAdd;
      else fashionHours += hoursToAdd;
    });

    const totalCalculatedHours = fitnessHours + fashionHours + minimalHours + offersHours;

    setMetrics({
      totalProjects: completed + revisions + drafts,
      completedCount: completed,
      revisionsCount: revisions,
      draftsCount: drafts,
      totalHours: totalCalculatedHours,
      hoursByCategory: [
        { name: 'Cyber Fitness', hours: fitnessHours },
        { name: 'Fashion Edit', hours: fashionHours },
        { name: 'Minimal Gold', hours: minimalHours },
        { name: 'Offers/Retail', hours: offersHours }
      ]
    });
  }, [changeTrigger]);

  // Draw D3 Donut Chart (Project Completion Rates)
  useEffect(() => {
    const svgEl = donutSvgRef.current;
    if (!svgEl) return;

    // Clear previous drawing
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const data = [
      { label: 'Completed', value: metrics.completedCount, color: '#d4af37' }, // Gold
      { label: 'In Revision', value: metrics.revisionsCount, color: '#f59e0b' }, // Amber
      { label: 'Concept Draft', value: metrics.draftsCount, color: '#71717a' } // Zinc
    ];

    const width = 240;
    const height = 240;
    const radius = Math.min(width, height) / 2;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<any>()
      .value((d: any) => d.value)
      .sort(null);

    const arc = d3.arc<any>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius * 0.9);

    const hoverArc = d3.arc<any>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius * 0.98);

    const path = g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.color)
      .attr('stroke', '#09090b')
      .attr('stroke-width', '3px')
      .style('opacity', 0.88)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.25s ease-out');

    // Simple interaction
    path.on('mouseover', function (event, d) {
      d3.select(this)
        .style('opacity', 1)
        .attr('d', hoverArc);
      
      // Update middle text dynamically
      g.select('.donut-center-title').text(`${d.data.label}`);
      g.select('.donut-center-value').text(`${d.data.value} items`);
    })
    .on('mouseout', function () {
      d3.select(this)
        .style('opacity', 0.88)
        .attr('d', arc);
        
      g.select('.donut-center-title').text(`Status Ratio`);
      g.select('.donut-center-value').text(`${metrics.totalProjects} total`);
    });

    // Centered label markup
    g.append('text')
      .attr('class', 'donut-center-title')
      .attr('text-anchor', 'middle')
      .attr('dy', '-5px')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .text('Status Ratio');

    g.append('text')
      .attr('class', 'donut-center-value')
      .attr('text-anchor', 'middle')
      .attr('dy', '15px')
      .attr('fill', '#ffffff')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(`${metrics.totalProjects} total`);

  }, [metrics]);

  // Draw D3 Bar Chart (Design Hours Spent)
  useEffect(() => {
    const svgEl = barSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const data = metrics.hoursByCategory;
    const margin = { top: 15, right: 15, bottom: 35, left: 35 };
    const width = 360;
    const height = 240;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, chartWidth])
      .padding(0.35);

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { name: string; hours: number }) => d.hours) || 50])
      .nice()
      .range([chartHeight, 0]);

    // X Axis drawing
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g => g.select('.domain').attr('stroke', '#27272a'))
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '9px')
      .attr('dy', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace');

    // Y Axis drawing (subtle lines)
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#18181b').attr('stroke-dasharray', '2,2'))
      .selectAll('text')
      .attr('fill', '#71717a')
      .attr('font-size', '9px')
      .attr('dx', '-4px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace');

    // Create Bars with gradients
    const barGroups = g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    // Bars
    barGroups.append('rect')
      .attr('x', d => x((d as any).name) || 0)
      .attr('y', d => y((d as any).hours))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y((d as any).hours))
      .attr('fill', '#d4af37') // Gold primary
      .attr('rx', 4)
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease-in-out')
      .on('mouseover', function (event, d: any) {
        d3.select(this)
          .style('opacity', 1)
          .attr('fill', '#fbbf24'); // Brighter gold
        
        // Show indicator on hover
        g.append('text')
          .attr('class', 'hover-val')
          .attr('x', (x(d.name) || 0) + x.bandwidth() / 2)
          .attr('y', y(d.hours) - 6)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-weight', 'bold')
          .attr('font-size', '10px')
          .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
          .text(`${d.hours} hrs`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .style('opacity', 0.8)
          .attr('fill', '#d4af37');
        
        g.selectAll('.hover-val').remove();
      });

    // Static text metrics on top of bars
    barGroups.append('text')
      .attr('x', d => (x((d as any).name) || 0) + x.bandwidth() / 2)
      .attr('y', d => y((d as any).hours) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#71717a')
      .attr('font-size', '8px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .text(d => `${(d as any).hours}h`);

  }, [metrics]);

  return (
    <div id="studio-insights-panel" className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 mt-12 max-w-5xl mx-auto relative overflow-hidden">
      {/* Decorative glowing lines */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-gold-400 uppercase">Live Studio Metrics</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            Studio Insights Dashboard
          </h3>
          <p className="text-zinc-500 text-xs font-sans leading-relaxed">
            Real-time visual monitoring of production velocities and client briefs queues metrics.
          </p>
        </div>
        
        {/* Summed stats */}
        <div className="flex gap-4 items-center shrink-0">
          <div className="bg-zinc-900/40 border border-zinc-850 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Production Hours</span>
            <span className="font-mono text-sm font-extrabold text-gold-300 flex items-center gap-1 justify-center mt-0.5">
              <Clock className="w-3.5 h-3.5 text-gold-500/80 inline" />
              {metrics.totalHours} hrs
            </span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-850 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Projects</span>
            <span className="font-mono text-sm font-extrabold text-white flex items-center gap-1 justify-center mt-0.5">
              <Award className="w-3.5 h-3.5 text-zinc-400 inline" />
              {metrics.totalProjects} Units
            </span>
          </div>
        </div>
      </div>

      {/* D3 diagrams split view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Donut Chart visual */}
        <div className="flex flex-col items-center justify-center bg-zinc-900/20 border border-zinc-900/80 p-6 rounded-2xl relative text-center">
          <div className="absolute top-3.5 left-3.5 font-mono text-[9px] text-zinc-500 flex items-center gap-1.5">
            <PieChart className="w-3 h-3 text-gold-500/60" />
            <span>PROJECT COMPLETION STATUS</span>
          </div>
          <div className="py-4 flex justify-center items-center">
            <svg ref={donutSvgRef} className="mx-auto" />
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-1">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-zinc-900 shrink-0" />
              <span>Delivered ({Math.round((metrics.completedCount / metrics.totalProjects) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-600 border border-zinc-900 shrink-0" />
              <span>Revision ({Math.round((metrics.revisionsCount / metrics.totalProjects) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="w-2.5 h-2.5 rounded bg-zinc-600 border border-zinc-900 shrink-0" />
              <span>Drafting ({Math.round((metrics.draftsCount / metrics.totalProjects) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Bar chart visual */}
        <div className="flex flex-col items-center justify-center bg-zinc-900/20 border border-zinc-900/80 p-6 rounded-2xl relative text-center">
          <div className="absolute top-3.5 left-3.5 font-mono text-[9px] text-zinc-500 flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3 text-gold-500/60" />
            <span>DESIGN HOURS BY BRAND DIRECTIVE</span>
          </div>
          <div className="py-4 flex justify-center items-center w-full">
            <svg ref={barSvgRef} className="mx-auto overflow-visible" />
          </div>
          <p className="font-mono text-[9px] text-zinc-500 mt-1 uppercase">
            Hourly allocation mapped dynamically from active briefs
          </p>
        </div>
      </div>
    </div>
  );
}
