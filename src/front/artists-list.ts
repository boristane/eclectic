import * as d3 from "d3";

import { IArtistListDataItem, IArtistsListProps, IMargin } from "../types";

import { Selection } from "d3";

export default class ArtistList {
  width: number;
  height: number;
  margin: IMargin;
  xScale;
  data: IArtistListDataItem[];
  private chartHeight: number;
  private chartWidth: number;
  private svg: Selection<SVGSVGElement, {}, HTMLElement, any>;

  constructor(properties: IArtistsListProps) {
    this.width = properties.width;
    this.height = properties.height;
    this.margin = properties.margin;
    this.data = properties.data;
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;
  }

  public make(selector: string): void {
    this.buildSVG(selector);
    this.generateLabels();
    this.generateArtists();
  }

  private generateContainerGroups(): void {
    const container = this.svg
      .append("g")
      .classed("container-group", true)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    container.append("g").classed("chart-group", true);
    container
      .select(".chart-group")
      .append("g")
      .classed("metadata-group", true);
  }

  private buildSVG(selector: string): void {
    if (!this.svg) {
      this.svg = d3
        .select(selector)
        .append("svg")
        .classed("artists-list-chart", true);
      this.generateContainerGroups();
    }
    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
  }

  private handleMouseOver(
    d: IArtistListDataItem,
    index: number,
    circles: Selection<any, any, any, any>
  ) {
    const circle = circles[index];
    d3.select(circle)
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("stroke", "#4ef087");
  }

  private handleMouseOut(
    d: IArtistListDataItem,
    index: number,
    circles: Selection<any, any, any, any>
  ) {
    const circle = circles[index];
    d3.select(circle)
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("stroke", "white");
  }

  private generateArtists(): void {
    const radius = this.chartWidth / (2 * this.data.length) - this.margin.left;
    const fontSize = radius / 4;
    const circles = this.svg
      .select(".chart-group")
      .selectAll(".artist")
      .data(this.data);

    const nameTexts = this.svg
      .select(".chart-group")
      .selectAll(".value")
      .data(this.data);

    const fillImages = this.svg
      .select(".chart-group")
      .selectAll(".image-fill")
      .data(this.data);

    const img_id = d => `img_${d.id}`;
    const img_url = d => `url(#img_${d.id})`;
    const xPos = d => this.xScale(d.rank) - radius - this.margin.left;

    fillImages
      .enter()
      .append("pattern")
      .attr("id", img_id)
      .attr("width", 1)
      .attr("height", 1)
      .attr("patternUnits", "objectBoundingBox")
      .append("image")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 2 * radius)
      .attr("height", 2 * radius)
      .attr("xlink:href", d => d.image);

    circles
      .enter()
      .append("circle")
      .attr("r", radius)
      .attr("cx", xPos)
      .attr("cy", this.chartHeight / 2)
      .style("fill", img_url)
      .style("stroke", "white")
      .style("stroke-width", fontSize / 4)
      .classed("artists", true)
      .on("mouseover", this.handleMouseOver.bind(this))
      .on("mouseout", this.handleMouseOut.bind(this));

    nameTexts
      .enter()
      .append("text")
      .attr("x", xPos)
      .attr("y", this.chartHeight / 2 + radius + 2 * fontSize)
      .text(d => `#${d.rank} ${d.name}`)
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${fontSize}px`)
      .attr("fill", "white")
      .style("font-weight", "bold")
      .classed("name", true);
  }

  private generateLabels() {
    this.xScale = d3
      .scaleLinear()
      .rangeRound([this.chartWidth, 0])
      .domain([Math.max(...this.data.map(a => a.rank)), 0]);
  }
}
