import { useEffect, useState } from "react";
import Loader from "./loader";

const RouteWrapper = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setFadeOut(true), 1500); // empieza a desvanecer a los 2.5s
        const finish = setTimeout(() => setLoading(false), 2000); // termina de desaparecer a los 3s
        return () => {
            clearTimeout(timeout);
            clearTimeout(finish);
        };
    }, []);

    return (
        <>
            {loading ? (
                <div className={`loader-container ${fadeOut ? "fade-out" : ""}`}>
                    <Loader />
                </div>
            ) : (
                children
            )}
        </>
    );
};

export default RouteWrapper;