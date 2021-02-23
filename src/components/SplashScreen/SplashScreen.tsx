// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect, useRef } from 'react';

import './SplashScreen.css';

type Props = {
  isAppInitializing: boolean,
};

const rayonSpinner = 48;
const internalBlue = '#7391bd';
const engineBlue = '#2c4c96';

const SplashScreen = ({ isAppInitializing }: Props) => {
  const previousIsAppInitializing = useRef<undefined | boolean>(undefined);
  const [visibilities, setVisibilities] = useState({ leftSegVis: false, rightSegVis: false, visible: isAppInitializing });

  useEffect(() => {
    if (isAppInitializing === true && previousIsAppInitializing.current === false) {
      setVisibilities({ leftSegVis: false, rightSegVis: false, visible: true });
    }

    if (isAppInitializing === false) {
      setVisibilities({ leftSegVis: true, rightSegVis: false, visible: true });
      setTimeout(() => setVisibilities({ leftSegVis: true, rightSegVis: true, visible: true }), 300);
      setTimeout(() => setVisibilities({ leftSegVis: false, rightSegVis: false, visible: false }), 1100);
    }

    previousIsAppInitializing.current = isAppInitializing;
  }, [isAppInitializing]);

  if (visibilities.visible) {
    return (
      <div className="overlay">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          id="Layer_1"
          x="0px"
          y="0px"
          width="100%"
          height="35%"
          viewBox="0 0 1024 1024"
          enableBackground="new 0 0 1024 1024"
        >
          <g>
            <g fill="none" fillRule="evenodd" stroke={internalBlue} className={isAppInitializing ? '' : 'fadeout'} transform="translate(430, 490)">
              <g strokeWidth="16">
                <circle strokeOpacity=".5" cx={rayonSpinner} cy={rayonSpinner} r={rayonSpinner} />
                <path d={`M${2 * rayonSpinner} ${rayonSpinner}c0-9.94-8.06-${rayonSpinner}-${rayonSpinner}-${rayonSpinner}`} transform={`rotate(73.2571 ${rayonSpinner} ${rayonSpinner})`}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${rayonSpinner} ${rayonSpinner}`} to={`360 ${rayonSpinner} ${rayonSpinner}`} dur="1s" repeatCount="indefinite" />
                </path>
              </g>
            </g>

            <path
              d="m 295.984,159.818 c 123.173,0 247.909,1.431 371.095,1.431 0,0 6.563,0.502 7.644,50.248 0.467,41.532 -78.722,2.791 -76.229,59.421 0.569,12.855 21.466,18.98 79.335,25.198 26.135,13.687 -0.715,37.364 21.774,51.644 114.567,11.745 87.792,46.893 100.319,92.026 48.55,7.484 30.146,-51.962 33.601,-89.585 29.867,0 59.721,0 89.587,0 101.735,79.114 119.644,516.173 -89.587,447.949 -3.486,-33.848 12.44,-87.092 -22.4,-89.587 -42.541,9.729 -9.639,94.896 -33.602,123.188 -124.879,43.213 -295.304,44.364 -405.527,-4.871 -39.683,-25.58 -47.806,-40.526 -77.775,-90.854 -98,-1.547 -116.51,-13.725 -143.837,-38.662 -7.015,-34.04 14.349,-96.456 -11.186,-111.987 -69.898,1.034 -17.268,124.587 -33.602,179.175 C 11.152,765.15 54.392,602.162 72.008,551.777 33.711,501.652 -20.234,313.566 109.721,318.671 c 12.673,50.81 -21.466,155.405 18.273,165.919 48.93,-10.807 2.975,-116.479 44.787,-134.388 161.879,-4.93 91.409,-66.997 190.389,-78.396 23.188,-60.521 -61.046,-13.612 -67.187,-44.792 -14.058,-25.479 -3.47,-41.018 10e-4,-67.196 z m 11.201,358.357 C 286.562,766.74 602.431,756.836 643.134,596.576 680.832,448.188 587.204,343.42 430.358,383.803 342.39,406.449 311.91,461.211 307.185,518.175 Z"
              id="path25"
              style={{ fill: engineBlue }}
            />
            <path
              id="polygon27"
              className={visibilities.leftSegVis ? 'fadein' : 'hidden'}
              style={{ display: 'inline', fill: internalBlue }}
              d="M 493.68089,607.41302 458.488,642.399 381.939,565.863 415.248,528.835 Z"
            />
            <path
              id="path46"
              className={visibilities.rightSegVis ? 'fadein' : 'hidden'}
              d="m 555.573,463.187 41.068,41.06 -104.38868,104.41602 -37.74896,-37.74853 z"
              style={{ display: 'inline', fill: internalBlue }}
            />
          </g>
        </svg>
      </div>
    );
  }

  return (<></>);
};

export default SplashScreen;
