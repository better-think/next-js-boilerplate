import React, { useEffect, useRef } from "react";
import { select } from "d3";

const dataURLtoBlob = (dataURL: string) => {
  const binary = atob(dataURL.split(",")[1]);
  const array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
};

const DesignModule = ({ data }) => {
  const radius = 250;
  const width = 500;
  const height = 500;
  const svgRef = useRef(null);
  const imgRef = useRef(null);

  const getPathData = (r: number, w: number, h: number, d: number) => {
    const radius = r * 0.75;
    const startX = w / 2 - radius;
    return `m${startX},${h / 2} a${radius},${radius} 0 0 ${d} ${2 * radius},0`;
  };

  useEffect(() => {
    // Creation of the SVG
    const svgCanvas = svgRef.current;

    const svg = select(svgCanvas)
      .data([null])
      .join("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent")
      .style("border-radius", "50%");

    svg
      .selectAll(".background")
      .data([null])
      .join("circle")
      .classed("background", true)
      .attr("r", radius)
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill",data.background.color);

    svg
      .selectAll(".template-image")
      .data([null])
      .join("svg:image")
      .attr("xlink:href", data.imageUrl)
      .attr("id", "template-image")
      .attr("width", 500)
      .attr("height", 500)
      .attr("x", 0)
      .attr("y", 0);

    svg
      .selectAll(".frame")
      .data([null])
      .join("circle")
      .classed("frame", true)
      .attr("r", radius)
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", "transparent")
      .style("stroke-width", data.frame.width)
      .style("stroke", data.frame.color);

    return () => {
      if (svgCanvas) {
        while (svgCanvas.firstChild) {
          svgCanvas.removeChild(svgCanvas.firstChild);
        }
      }
    };
  }, [data]);

  useEffect(() => {
    // Get SVG data
    const svgCanvas: Node | any = svgRef.current;
    let svgData: string = "";
    if (typeof window.XMLSerializer !== "undefined") {
      svgData = new XMLSerializer().serializeToString(svgCanvas);
    } else if (typeof svgCanvas.xml !== "undefined") {
      svgData = svgCanvas.xml;
    }

    // Creation of the Canvas for Image
    const imgCanvas = imgRef.current;
    imgCanvas.width = width;
    imgCanvas.height = height;
    const ctxImg = imgCanvas.getContext("2d");
    const img = document.createElement("img");
    img.setAttribute(
      "src",
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    );

    img.onload = () => {
      ctxImg.drawImage(img, 0, 0);
      const imgsrc = imgCanvas.toDataURL("image/png");
      const file = dataURLtoBlob(imgsrc);
      const size = file.size;
      const sizeKBImg = size / 1000;
      console.log(`Image is ${sizeKBImg}kb`);
    };
  }, [data]);

  return (
    <div className="canvas">
      <svg className="svgArt" ref={svgRef}></svg>
      <canvas
        // style={{ display: "none" }}
        className="imageArt"
        ref={imgRef}
      ></canvas>
    </div>
  );
};

export default DesignModule;
