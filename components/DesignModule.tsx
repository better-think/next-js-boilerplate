import React, { useEffect, useRef, useState } from "react";
import { select, svg } from "d3";

const dataURLtoBlob = (dataURL: string) => {
  const binary = atob(dataURL.split(",")[1]);
  const array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
};

function parseHTML(html: any) {
  var div = document.createElement('div');
  div.innerHTML = html.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

const DesignModule = ({ data }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
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
      .attr("href", data.imageUrl)
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

  const onReady = () => {
      // imgRef.current.setAttribute('crossorigin', 'anonymous');
      // const imgsrc = imgRef.current.toDataURL("image/png");
      //   const file = dataURLtoBlob(imgsrc);
      //   const size = file.size;
      //   const sizeKBImg = size / 1000;
      //   console.log(`Image is ${sizeKBImg}kb`);
  }

  useEffect(() => {
    // Get SVG data
    const svgCanvas: Node | any = svgRef.current;

    
    let svgData: string = "";
    if (typeof window.XMLSerializer !== "undefined") {
      svgData = new XMLSerializer().serializeToString(svgCanvas);
    } else if (typeof svgCanvas.xml !== "undefined") {
      svgData = svgCanvas.xml;
    }
    // If there is a image tag inside svg, It will not work.
    // So we need to take the image out of svg and draw separately
    let _img = (svgData.includes('image')) ? (svgData.match('<image[^>]*>') ?? null) : null;
    if (img !== null) {
      svgData = svgData.replace(_img[0], '');
      _img = _img[0].replace('image', 'img');
      _img = parseHTML(_img);
    }

    // Move the circle frame out of the svg and extra it seperatly.
    let circle = svgData.match('<circle class="frame"[^>]*>') ?? null;
    let _newSVG = svgData.match('<svg[^>]*>') ?? null;
    let borderImage;
    if (circle && _newSVG) {
      circle = circle[0];
      svgData = svgData.replace(circle, '');
      _newSVG += circle+'</svg>';
      borderImage = document.createElement("img");
    }
    console.log('Check => ', svgCanvas, svgData, _img);

      // Creation of the Canvas for Image
      const imgCanvas = imgRef.current;
      imgCanvas.width = width;
      imgCanvas.height = height;
      const ctxImg = imgCanvas.getContext("2d");
      const img = document.createElement("img");
      img.setAttribute(
        "src",
        "data:image/svg+xml;base64," + btoa(svgData)
      );
  
      img.onload = () => {
        ctxImg.drawImage(img, 0, 0);
        if (_img) {
          const inImg = document.createElement("img");
          inImg.setAttribute('id', _img.id);
          inImg.setAttribute('crossorigin', 'anonymous');
          const _inMemory = new Image();
          _inMemory.onload = () => {
            const _height = _img.height * (_inMemory.height/_inMemory.width);
            inImg.src = _img.getAttribute('href');
            ctxImg.save();
            ctxImg.beginPath();
            ctxImg.arc(250, 250, 250, 0, Math.PI * 2, true);
            ctxImg.closePath();
            ctxImg.clip();

            ctxImg.drawImage(inImg, 0, (img.height - _height )/2, _img.width, _height);

            ctxImg.beginPath();
            ctxImg.arc(0, 0, 250, 0, Math.PI * 2, true);
            ctxImg.clip();
            ctxImg.closePath();
            ctxImg.restore();
            if (borderImage) {
              borderImage.onload = () => {
                ctxImg.drawImage(borderImage, 0, 0);
                onReady();
              }
              borderImage.setAttribute(
                "src",
                "data:image/svg+xml;base64," + btoa(_newSVG)
              )
            } else {
              onReady();
            }
          }

          _inMemory.src = _img.getAttribute('href');
        } else {
          onReady();
        }
        
      };
      // document.body.appendChild(img);
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
