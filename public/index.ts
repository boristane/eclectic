import * as d3 from "d3";
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
  function main(rawData: IArtistListDataItem[]): void {
    const data = rawData;
    const mapProperties: IArtistsListProps = {
      width,
      height: 0.3 * height,
      margin,
      data
    };
    const chart = new ArtistList(mapProperties);
    chart.make(".top-artists-list-container");
  }

  main(data);
}
function displayMainstreamMeter(data: IArtistListDataItem[]) {
  function main(rawData: IArtistListDataItem[]): void {
    const data = rawData;
    const mapProperties: IArtistsListProps = {
      width: document.body.clientWidth - margin.left - margin.right,
      height: 0.7 * height,
      margin,
      data
    };
    const chart = new MainstreamMeter(mapProperties);
    chart.make(".mainstream-meter-container");
  }

  main(data);
}

const main = () => {
  const button = document.getElementById("but");
  button.addEventListener("click", e => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    fetch(`/get-token/?code=${code}&state=${state}`)
      .then(res => res.json())
      .then(data => {
        const { access_token: token } = data;
        fetch(`/top-artists/?token=${token}`)
          .then(res => res.json())
          .then(data => {
            console.log(data);
            const { artistsTopTracks } = data;
            const topArtistsData: IArtistListDataItem[] = data.topArtists.map((artist, index) => ({
              name: artist.name,
              rank: index + 1,
              image: artist.images[0].url,
              id: artist.id,
              track: artistsTopTracks.find(a => a.artistID === artist.id).track,
              popularity: artist.popularity
            }));
            console.log(topArtistsData);
            displayTopArtists(topArtistsData.filter(artist => artist.rank <= 10));
            displayMainstreamMeter(topArtistsData);
          });
      });
  });
};

main();
