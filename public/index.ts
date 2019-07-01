import * as d3 from "d3";
import ArtistList from "../src/front/artists-list";
import { IMargin, IArtistListDataItem, IArtistsListProps } from "../src/types";

function verticalBarDemo(data: IArtistListDataItem[]) {
  let chart: ArtistList;
  function main(rawData: IArtistListDataItem[]): void {
    const margin: IMargin = {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10
    };
    const data = rawData;
    const mapProperties: IArtistsListProps = {
      width: document.body.clientWidth,
      height: 300,
      margin,
      data
    };
    chart = new ArtistList(mapProperties);
    chart.make(".container");
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
            const topArtistsData: IArtistListDataItem[] = data.topArtists
              .map((artist, index) => ({
                name: artist.name,
                rank: index + 1,
                image: artist.images[0].url,
                id: artist.id
              }))
              .filter(artist => artist.rank <= 10);
            verticalBarDemo(topArtistsData);
          });
      });
  });
};

main();
