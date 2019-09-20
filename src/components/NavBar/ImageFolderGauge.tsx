import React, { useState, useEffect, useCallback } from "react";
import { Progress } from "reactstrap";

type Props = {
    storageSizeInMB: number,
    storageSizeLimitInMB: number
};

const getColorProgress = (size: number, sizeLimit: number):string  => {
    const ratio = size / sizeLimit;

    if (ratio < 0.5){
        return "success";
    }
    else if (ratio >=0.5 && ratio < 0.75){
        return "warning";
    }
    else{
        return "danger";
    }
}

const ImageFolderGauge = ({storageSizeInMB, storageSizeLimitInMB}:Props) => {
    const [color, setColor] = useState(getColorProgress(storageSizeInMB, storageSizeLimitInMB));

    useEffect(() => {
        setColor(getColorProgress(storageSizeInMB, storageSizeLimitInMB));
    }, [storageSizeInMB, storageSizeLimitInMB]);

    const getStorageSizeInMBFormated = () => {
        return formatMbInCurrentCulture(storageSizeInMB);
    }

    const getStorageSizeLimitInMBFormated = () => {
        return formatMbInCurrentCulture(storageSizeLimitInMB);
    }

    const formatMbInCurrentCulture = (sizeInMb: number):string => {
        return new Intl.NumberFormat(window.navigator.languages[0], { maximumSignificantDigits: 2 }).format(sizeInMb);
    }

    return <Progress color={color} value={storageSizeInMB} max={storageSizeLimitInMB}>{getStorageSizeInMBFormated()} of {getStorageSizeLimitInMBFormated()}MB</Progress>
}

export default React.memo(ImageFolderGauge);