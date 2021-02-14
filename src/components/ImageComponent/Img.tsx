// eslint-disable-next-line no-unused-vars
import React, {
  useRef, useState, useEffect, useCallback,
} from 'react';

type Props = {
  loader: any,
  src: string,
  storage: LocalForage,
  alt?: string,
  onClick?:()=>void,
  className?: string,
  style?: any,
}

export const canvasImageSourceToDataURL = (img: CanvasImageSource) => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width as number;
  canvas.height = img.height as number;

  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Error when creating a context 2d');
  }

  ctx.drawImage(img, 0, 0, img.width as number, img.height as number);
  return canvas.toDataURL('image/jpeg', 0.95);
};

const Img = ({
  storage, loader, src, alt, ...rest
}:Props) => {
  const image = useRef<HTMLImageElement | undefined>(undefined);
  const [state, setState] = useState({ isLoading: true, isLoaded: false });
  const [source, setSource] = useState(src);

  const onLoad = useCallback(async () => {
    /* istanbul ignore else */
    if (image.current) {
      const base64Image = canvasImageSourceToDataURL(image.current);
      if (base64Image !== undefined) {
        await storage.setItem(src, base64Image);
        setSource(base64Image);
      } else {
        setSource(src);
      }

      setState({ isLoaded: true, isLoading: false });
    }
  }, [src, storage]);

  const loadImg = useCallback(async () => {
    const keys = await storage.keys();
    if (keys.includes(src)) {
      const base64Image = await storage.getItem<string>(src) as string;
      setSource(base64Image);
      setState({ isLoaded: true, isLoading: false });
    } else {
      image.current = new Image();
      image.current.crossOrigin = 'anonymous';
      image.current.src = src;
      image.current.onload = onLoad;
    }
  }, [storage, src, onLoad]);

  const unloadImg = useCallback(() => {
    if (image.current) {
      image.current.onload = null;
      // abort any current downloads https://github.com/mbrevda/react-image/pull/223
      image.current.src = '';
      image.current = undefined;
    }
  }, []);

  useEffect(() => {
    loadImg();
    return (() => unloadImg());
  }, [loadImg, unloadImg]);

  if (state.isLoaded) {
    return <img src={source} alt={alt} {...rest} />;
  }

  if (!state.isLoaded && state.isLoading) {
    return loader || <div />;
  }

  return <div />;
};

export default Img;
