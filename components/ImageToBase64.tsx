import React, { useRef, useEffect, useState, useMemo } from 'react'
import { LazyLoadImage } from "react-lazy-load-image-component";
import * as htmlToImage from "html-to-image";

type Props = {
    url: string,
    onChange(e: string): any // e === string of base64
}

function ImageToBase64({ url, onChange }: Props) {
    const imageRef = useRef<HTMLDivElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showImage, setShowImage] = useState(true);
    const [base64Image, setBase64Image] = useState('');

    useEffect(() => {
        if (imageLoaded) {
            setTimeout(() => { // should be delay  because rendering dom take time.
                const imageElt = imageRef.current?.firstChild as HTMLImageElement;
                if (imageElt?.nodeName === 'IMG') {
                    htmlToImage.toPng(imageElt as HTMLElement).then((b) => {
                        setBase64Image(b)
                        setShowImage(false)
                    });
                } else {
                    setBase64Image('')
                    setShowImage(false)
                }
            }, 50)
        }
    }, [imageRef, imageLoaded]);

    useEffect(() => {
        onChange(base64Image)
    }, [base64Image])

    useEffect(() => {
        setShowImage(true)
        setBase64Image('')
    }, [url]);

    const imageElt = <LazyLoadImage
        src={url}
        beforeLoad={() => {
            setImageLoaded(false);
        }}
        afterLoad={() => {
            setImageLoaded(true);
        }}
        crossOrigin="anonymous"
    />

    return (
        <>
            {url
                ? <div ref={imageRef} style={{
                    position: 'absolute',
                    width: '100%',
                    display: showImage ? 'block' : 'none'
                }}>
                    {imageElt}
                </div>
                : null
            }
        </>

    )
}

export default ImageToBase64;