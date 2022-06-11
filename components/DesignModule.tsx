import React, { useCallback, useEffect, useRef, useState, LegacyRef } from "react";
import { select } from "d3";
import * as htmlToImage from "html-to-image";
import { LazyLoadImage } from 'react-lazy-load-image-component';

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
  const svgRef = useRef<SVGElement>(null);
  // const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageId = "image-01"

  const getPathData = (r: number, w: number, h: number, d: number) => {
    const radius = r * 0.75;
    const startX = w / 2 - radius;
    return `m${startX},${h / 2} a${radius},${radius} 0 0 ${d} ${2 * radius},0`;
  };

  const convertSvg2Canvas = useCallback(() => {
    if(canvasRef.current && svgRef.current) {

      // Get SVG data
      const svgCanvas: Node | any = svgRef.current;
      let svgData: string = "";
      if (typeof window.XMLSerializer !== "undefined") {
        svgData = new XMLSerializer().serializeToString(svgCanvas);
      } else if (typeof svgCanvas.xml !== "undefined") {
        svgData = svgCanvas.xml;
      }
  
      // Creation of the Canvas for Image
      const imgCanvas = canvasRef.current;
      imgCanvas.width = width;
      imgCanvas.height = height;
      const ctxImg = imgCanvas.getContext("2d");
      const img = document.createElement("img");
      const base64Image = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      img.setAttribute("src", base64Image);
  
      console.log({
        base64Image
      });
  
  
      img.onload = () => {
        ctxImg?.drawImage(img, 0, 0);
        const imgsrc = imgCanvas.toDataURL("image/png");
        const file = dataURLtoBlob(imgsrc);
        const size = file.size;
        const sizeKBImg = size / 1000;
        console.log(`Image is ${sizeKBImg}kb`);
      };
    }
  }, [canvasRef, svgRef]);

  const initSVG = useCallback(() => {
    if(svgRef.current) {
      const svgCanvas = svgRef.current;
      if (svgCanvas) {
        while (svgCanvas.firstChild) {
          svgCanvas.removeChild(svgCanvas.firstChild);
        }
      }
    }
  }, [svgRef])

  useEffect(() => {
    const svgCanvas = svgRef.current;
    const refImage = document.querySelector(`#${imageId}`) as HTMLElement;

    if (imageLoaded && refImage) {
      // Creation of the SVG
      htmlToImage.toPng(refImage)
      .then((base64Image) => {
          initSVG();

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
            .attr("render-order", 1)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", data.background.color);

          svg
            .selectAll(".template-image")
            .data([null])
            .join("svg:image")
            .attr("xlink:href", base64Image)
            .attr("render-order", -1)
            .attr("width", 500)
            .attr("height", 500)
            .attr("x", 0)
            .attr("y", 0);

          svg
            .selectAll(".frame")
            .data([null])
            .join("circle")
            .classed("frame", true)
            .attr("render-order", 3)
            .attr("r", radius)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", "transparent")
            .style("stroke-width", data.frame.width)
            .style("stroke", data.frame.color);

          convertSvg2Canvas();
        })
    }

    return () => {
      initSVG();
    };
  }, [data, svgRef, imageLoaded]);


  return (
    <div className="canvas">
      <svg className="svgArt" ref={svgRef as LegacyRef<SVGSVGElement>}></svg>
      <canvas
        // style={{ display: "none" }}
        className="imageArt"
        ref={canvasRef}
      ></canvas>
      <LazyLoadImage 
        src={data.imageUrl}
        afterLoad={() => {
          setImageLoaded(true)
        }}
        crossOrigin="anonymous"
        id={imageId}
      />
    </div>
  );
};

export default DesignModule;
