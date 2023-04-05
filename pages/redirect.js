import { useEffect } from 'react'

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export default function Redirect() {
    useEffect(() => {
        //window.location.replace(getParameterByName("confurl"))
        window.top.location.href = getParameterByName("confurl");
    }, []);

    return (
        <div>Loading...</div>
    );
}