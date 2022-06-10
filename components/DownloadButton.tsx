import { v4 as uuidv4 } from "uuid";

const DownloadButton = () => {
  const handleOnClick = () => {
    // let svg = document.body.getElementsByClassName("svgArt")[0];
    // let svgData: string;

    // if (typeof window.XMLSerializer != "undefined") {
    //   svgData = new XMLSerializer().serializeToString(svg);
    // }

    const canvas = document.getElementsByClassName("imageArt")[0];
    // const svgSize = svg.getBoundingClientRect();
    // canvas.width = svgSize.width;
    // canvas.height = svgSize.height;
    // const ctx = canvas.getContext("2d");

    // const img = document.createElement("img");
    // img.setAttribute(
    //   "src",
    //   "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    // );

    // img.onload = () => {
      // ctx.drawImage(img, 0, 0);
      const imgsrc = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${uuidv4()}.png`;
      a.href = imgsrc;
      a.click();
    // };
  };

  return (
    <button onClick={handleOnClick} style={{ padding: "16px 32px" }}>
      Download Image
    </button>
  );
};

export default DownloadButton;
