import * as d3 from "d3";

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
          });
      });
  });
};

main();
