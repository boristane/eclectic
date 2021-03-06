import * as d3 from "d3";

import { IArtistListDataItem, IArtistsListProps, IMargin } from "../types";

import { Selection } from "d3";
import colors from "./colors";
import { playOrPause } from "./player";

export default class MainstreamMeter {
  width: number;
  height: number;
  margin: IMargin;
  xScale;
  data: IArtistListDataItem[];
  private chartHeight: number;
  private chartWidth: number;
  private svg: Selection<SVGSVGElement, {}, HTMLElement, any>;
  private radius: number;
  private fontSize: number;

  constructor(properties: IArtistsListProps) {
    this.width = properties.width;
    this.height = properties.height;
    this.margin = properties.margin;
    this.data = properties.data.sort((a, b) => a.popularity - b.popularity);
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    const minNumberOfItems = 20;
    const numItems = this.data.length >= minNumberOfItems ? this.data.length : minNumberOfItems;
    this.radius = this.chartWidth / (2 * numItems) - this.margin.left;
    this.fontSize = this.radius / 4;
  }

  public make(selector: string): void {
    this.buildSVG(selector);
    this.generateLabels();
    this.generateMainstreamMeter();
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
        .classed("mainstream-meter-chart", true);
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
    d3.select(circle).raise();
    d3.select(circle)
      .select(".artists")
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("stroke", colors.spotifyGreen);
    d3.select(circle)
      .select(".play-button")
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("fill", colors.spotifyGreen)
      .style("opacity", 1);
  }

  private handleMouseOut(
    d: IArtistListDataItem,
    index: number,
    circles: Selection<any, any, any, any>
  ) {
    const circle = circles[index];
    const textNode = d3.select(circle).select(".play-button");
    d3.select(circle)
      .select(".play-button")
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("opacity", 0.5);
    if (textNode.text() === "| |") return;
    d3.select(circle)
      .select(".artists")
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("stroke", "white");
    d3.select(circle)
      .select(".play-button")
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .style("fill", "white")
      .style("opacity", 0.5);
  }

  private handleClick(
    d: IArtistListDataItem,
    index: number,
    circles: Selection<any, any, any, any>
  ) {
    const circle = circles[index];
    const textNode = d3.select(circle).select(".play-button");
    const textValue = textNode.text();
    const newTextValue = textValue === "▶" ? "| |" : "▶";
    playOrPause(d.track, newTextValue === "▶");
    textNode.text(d => newTextValue);
    d3.select(circle)
      .select(".artists")
      .style("stroke", d => (newTextValue === "▶" ? colors.white : colors.spotifyGreen));
    textNode.style("fill", d => (newTextValue === "▶" ? colors.white : colors.spotifyGreen));
  }

  private generateMainstreamMeter(): void {
    let circlesGroup = this.svg
      .select(".chart-group")
      .selectAll(".artist")
      .data(this.data);

    const popularityTexts = this.svg
      .select(".chart-group")
      .selectAll(".popularity-name")
      .data(this.data);

    const fillImages = this.svg
      .select(".chart-group")
      .selectAll(".image-fill")
      .data(this.data);

    const img_id = d => `img_mainstream_meter_${d.id}`;
    const img_url = d => `url(#img_mainstream_meter_${d.id})`;
    const xPos = d => this.xScale(d.popularity) - this.radius / 2;
    const yPos = (d, index) => {
      const offset = 0;
      if (index % 2) {
        return this.height / 2 - (2 * this.radius + offset);
      }
      return this.height / 2 + (2 * this.radius + offset);
    };
    const textYPos = (d, index) => {
      if (index % 2) {
        return yPos(d, index) + (this.radius + 2 * this.fontSize);
      }
      return yPos(d, index) - (this.radius + 2 * this.fontSize);
    };

    fillImages
      .enter()
      .append("pattern")
      .attr("id", img_id)
      .attr("width", 1)
      .attr("height", 1)
      .attr("patternUnits", "objectBoundingBox")
      .append("image")
      .classed(".image-fill", true)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 2 * this.radius)
      .attr("height", 2 * this.radius)
      .attr("xlink:href", d => d.image);

    circlesGroup = circlesGroup
      .enter()
      .append("g")
      .on("mouseout", this.handleMouseOut.bind(this))
      .on("mouseover", this.handleMouseOver.bind(this))
      .on("click", this.handleClick.bind(this));

    circlesGroup
      .append("circle")
      .attr("r", this.radius)
      .attr("cx", xPos)
      .attr("cy", yPos)
      .style("fill", img_url)
      .style("stroke", "white")
      .style("stroke-width", this.fontSize / 4)
      .classed("artists", true);

    circlesGroup.append("title").text(d => `#${d.rank} ${d.name}`);

    popularityTexts
      .enter()
      .append("text")
      .attr("x", xPos)
      .attr("y", textYPos)
      .text(d => `${d.popularity}`)
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${this.fontSize}px`)
      .attr("fill", "white")
      .style("font-weight", "bold")
      .classed("artist-popularity", true);

    circlesGroup
      .append("text")
      .attr("x", xPos)
      .attr("y", yPos)
      .text(d => "▶")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${2 * this.fontSize}px`)
      .style("opacity", 0.5)
      .style("cursor", "pointer")
      .attr("fill", "white")
      .style("font-weight", "bold")
      .classed("play-button", true);
  }

  private generateLabels() {
    const left = 10 * this.fontSize + 2 * this.margin.left;
    const right = this.width - left;

    this.xScale = d3
      .scaleLinear()
      .rangeRound([left, right])
      .domain([0, 100]);

    const xLabel = this.svg.append("g").classed(".x-label-group", true);
    const lineHeight = 2;
    xLabel
      .append("rect")
      .attr("width", this.width - 2 * left)
      .attr("height", lineHeight)
      .attr("x", left)
      .style("fill", colors.white)
      .attr("y", this.height / 2 + this.fontSize);

    xLabel
      .append("rect")
      .attr("width", left)
      .attr("height", lineHeight)
      .attr("x", right)
      .style("fill", colors.white)
      .style("opacity", 0.5)
      .attr("y", this.height / 2 + this.fontSize);

    xLabel
      .append("rect")
      .attr("width", left)
      .attr("height", lineHeight)
      .attr("x", 2 * this.margin.left)
      .style("fill", colors.white)
      .style("opacity", 0.5)
      .attr("y", this.height / 2 + this.fontSize);

    xLabel
      .append("text")
      .attr("x", this.xScale(0))
      .attr("y", this.height / 2 + 3 * this.fontSize)
      .text("0")
      .style("text-anchor", "start")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${this.fontSize}px`)
      .attr("fill", "white")
      .style("font-weight", "bold");

    xLabel
      .append("text")
      .attr("x", this.xScale(100))
      .attr("y", this.height / 2 + 3 * this.fontSize)
      .text("100")
      .style("text-anchor", "end")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${this.fontSize}px`)
      .attr("fill", "white")
      .style("font-weight", "bold");

    xLabel
      .append("text")
      .attr("x", 2 * this.margin.left)
      .attr("y", this.height / 2 - this.fontSize)
      .text("obscure")
      .style("text-anchor", "start")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${2 * this.fontSize}px`)
      .attr("fill", "white")
      .style("font-weight", "bold");

    xLabel
      .append("text")
      .attr("x", this.chartWidth + 2 * this.margin.left)
      .attr("y", this.height / 2 - this.fontSize)
      .text("mainstream")
      .style("text-anchor", "end")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${2 * this.fontSize}px`)
      .attr("fill", "white")
      .style("font-weight", "bold");

    const titleLabel = this.svg.append("g").classed(".title-label-group", true);

    titleLabel
      .append("text")
      .attr("x", 20)
      .attr("y", 60)
      .text("Your Top 20 Artists Mainstream Meter")
      .style("text-anchor", "start")
      .style("dominant-baseline", "central")
      .style("font-size", () => `${4 * this.fontSize}px`)
      .classed("chart-title", true)
      .attr("fill", "white");
  }
}
