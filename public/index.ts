import axios from "axios";
import "babel-polyfill";
import ArtistList from "../src/front/artists-list";
import { IMargin, IArtistListDataItem, IArtistsListProps } from "../src/types";
import MainstreamMeter from "../src/front/mainstream-meter";
import Network from "../src/front/network";
import GenreChart from "../src/front/genres";

const margin: IMargin = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10
};

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

function displayTopArtists(data: IArtistListDataItem[]) {
  const mapProperties: IArtistsListProps = {
    width: 0.95 * document.body.clientWidth,
    height: 0.35 * h,
    margin,
    data
  };
  const chart = new ArtistList(mapProperties);
  chart.make(".top-artists-list-container");
}

function displayMainstreamMeter(data: IArtistListDataItem[]) {
  const mapProperties: IArtistsListProps = {
    width: 0.95 * document.body.clientWidth,
    height: 0.65 * h,
    margin,
    data
  };
  const chart = new MainstreamMeter(mapProperties);
  chart.make(".mainstream-meter-container");
}

function displayNetwork(data) {
  const mapProperties = {
    width: 0.95 * document.body.clientWidth,
    height: h,
    margin,
    data
  };
  const chart = new Network(mapProperties);
  chart.make(".network-container");
}

function displayGenres(data) {
  const duration = 10000;
  const mapProperties = {
    width: 0.95 * document.body.clientWidth,
    height: h,
    margin,
    data,
    duration
  };
  const chart = new GenreChart(mapProperties);
  chart.make(".genres-container");
  setInterval(() => {
    chart.update(data);
  }, duration);
}

async function handleClick(e) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const { access_token: token } = (await axios.get(`/get-token/?code=${code}&state=${state}`)).data;
  const { data } = await axios.get(`/top-artists/?token=${token}`);

  console.log(data);
  const { topArtists } = data;
  console.log(topArtists);
  displayTopArtists(topArtists.filter(artist => artist.rank <= 10));
  displayMainstreamMeter(topArtists.filter(artist => artist.rank <= 20));
  displayNetwork(data.connections);
  displayGenres(data.genreClusters);
}
const main = () => {
  const button = document.getElementById("but");
  button.addEventListener("click", handleClick);
};

main();
