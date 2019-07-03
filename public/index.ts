import axios from "axios";
import "babel-polyfill";
import ArtistList from "../src/front/artists-list";
import { IMargin, IArtistListDataItem, IArtistsListProps } from "../src/types";
import MainstreamMeter from "../src/front/mainstream-meter";

const margin: IMargin = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10
};
const width = document.body.clientWidth - margin.left - margin.right;
const height = 0.95 * document.documentElement.clientHeight;

function displayTopArtists(data: IArtistListDataItem[]) {
  const mapProperties: IArtistsListProps = {
    width,
    height: 0.2 * width,
    margin,
    data
  };
  const chart = new ArtistList(mapProperties);
  chart.make(".top-artists-list-container");
}

function displayMainstreamMeter(data: IArtistListDataItem[]) {
  const mapProperties: IArtistsListProps = {
    width: document.body.clientWidth - margin.left - margin.right,
    height: 0.2 * width,
    margin,
    data
  };
  const chart = new MainstreamMeter(mapProperties);
  chart.make(".mainstream-meter-container");
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
  displayMainstreamMeter(topArtists);
}
const main = () => {
  const button = document.getElementById("but");
  button.addEventListener("click", handleClick);
};

main();
