import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  LegacyRef,
  useMemo,
} from "react";
import { select } from "d3";
import ImageToBase64 from "./ImageToBase64";

const dataURLtoBlob = (dataURL: string) => {
  const binary = atob(dataURL.split(",")[1]);
  const array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
};

const DesignModule: React.FC<{ data: any }> = ({ data }) => {
  const radius = 250;
  const width = 500;
  const height = 500;
  const svgRef = useRef<SVGElement>(null);
  const [imageInBase64, setImageInBase64] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, sethistory] = useState<any>({});

  // const getPathData = (r: number, w: number, h: number, d: number) => {
  //   const radius = r * 0.75;
  //   const startX = w / 2 - radius;
  //   return `m${startX},${h / 2} a${radius},${radius} 0 0 ${d} ${2 * radius},0`;
  // };

  const convertSvg2Canvas = useCallback(() => {
    if (canvasRef.current && svgRef.current) {
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
      const base64Image =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
      img.setAttribute("src", base64Image);

      img.onload = () => {
        ctxImg?.drawImage(img, 0, 0);
        const imgsrc = imgCanvas.toDataURL("image/png");
        const file = dataURLtoBlob(imgsrc);
        const size = file.size;
        const sizeKBImg = size / 1000;
        // console.log(`Image is ${sizeKBImg}kb`);
      };
    }
  }, [canvasRef, svgRef]);

  const initSVG = useCallback(() => {
    if (svgRef.current) {
      const svgCanvas = svgRef.current;
      if (svgCanvas) {
        while (svgCanvas.firstChild) {
          svgCanvas.removeChild(svgCanvas.firstChild);
        }
      }
    }
  }, [svgRef]);

  const addBackGround = useCallback(() => {
    const svgCanvas = svgRef.current;
    if (svgCanvas) {
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
    }
  }, [svgRef, data])

  const addCircleFrame = useCallback(() => {
    const svgCanvas = svgRef.current;
    if (svgCanvas) {
      const svg = select(svgCanvas)
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
    }
  }, [svgRef, data]);

  const drawImage = () => {
    if (imageInBase64) {
      // Creation of the SVG
      const svgCanvas = svgRef.current;
      const svg = select(svgCanvas)
      addBackGround();
      svg
        .selectAll(".template-image")
        .data([null])
        .join("svg:image")
        .attr("xlink:href", imageInBase64)
        .attr("render-order", -1)
        .attr("width", 500)
        .attr("height", 500)
        .attr("x", 0)
        .attr("y", 0);
      addCircleFrame();
      convertSvg2Canvas();
    } else {
      addBackGround();
      addCircleFrame();
      convertSvg2Canvas();
    }

    return () => {
      initSVG();
    };
  };

  useEffect(() => {
    initSVG();
    drawImage();
  }, [imageInBase64, data.imageUrl, drawImage]);

  const elt = useMemo(() => {
    if (data.imageUrl && history[data.imageUrl]) {
      setImageInBase64(history[data.imageUrl])
      return <></>
    } else if(data.imageUrl) {
      return (
        <ImageToBase64 url={data.imageUrl} onChange={(e) => {
          setImageInBase64(e);
          if(data.imageUrl) {
            let _history = Object.assign(history, {});
            _history[data.imageUrl] = e
            sethistory(_history)
          }
        }} />
      )
    } else {
      setImageInBase64('')
    }
  }, [data.imageUrl, history])

  return (
    <>
      {elt}
      <div className="canvas">
        <div>
          <svg className="svgArt" ref={svgRef as LegacyRef<SVGSVGElement>}></svg>
          <canvas
            // style={{ display: "none" }}
            className="imageArt"
            ref={canvasRef}
          ></canvas>
        </div>
      </div>
    </>
  );
};

export default DesignModule;
