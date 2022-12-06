import { useEffect, useMemo, useState } from "react";
import "./App.css";
// import * as dotenv from "dotenv";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "xmldom";
import {
  GoogleMap,
  useLoadScript,
  Polygon,
  Polyline,
  InfoWindow,
  Marker,
} from "@react-google-maps/api";

// import pinIcon from "./logo.svg";
import axios from "axios";
// const API_KEY_MAP = "AIzaSyBWP0TswCunJgkXvKVeckoSB6CIdPAGwbw";

const pathPolygon = [
  {
    "lat": -22.41506553680307,
    "lng": -47.56184082280392,
  },
  {
    "lat": -22.4293694206333,
    "lng": -47.77344771345059,
  },
  {
    "lat": -22.54985458983811,
    "lng": -47.8078515946494,
  },
  {
    "lat": -22.62991949498801,
    "lng": -47.73517065221973,
  },
  {
    "lat": -22.72592212296158,
    "lng": -47.64478207135223,
  },
  {
    "lat": -22.63158898891042,
    "lng": -47.48832907683472,
  },
  {
    "lat": -22.41506553680307,
    "lng": -47.56184082280392,
  },
];

let activities = [
  {
    id: 1,
    description: "Activity 1",
    observation: "Observation 1",
    value: 10,
  },
  {
    id: 2,
    description: "Activity 2",
    observation: "Observation 2",
    value: 1,
  },
  {
    id: 3,
    description: "Activity 3",
    observation: "Observation 3",
    value: 3.5,
  },
  {
    id: 4,
    description: "Activity 4",
    observation: "Observation 4",
    value: 5,
  },
  {
    id: 5,
    description: "Activity 5",
    observation: "Observation 5",
    value: 3,
  },
  {
    id: 6,
    description: "Activity 6",
    observation: "Observation 6",
    value: 5.9,
  },
  {
    id: 7,
    description: "Activity 7",
    observation: "Observation 7",
    value: 9,
  },
];

interface DataProps {
  id: number;
  description: string;
  observation: string;
  value: number;
}

interface CoordinatesProps {
  lat: number;
  lng: number;
}

interface PolygonDataProps {
  data: DataProps[];
  coordinates: CoordinatesProps[];
}

function App() {
  const [place, setPlace] = useState<any[]>([]);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean[]>([]);
  const [latLng, setLatLng] = useState<CoordinatesProps>({
    lat: 0,
    lng: 0,
  });
  const [polygonData, setPolygonData] = useState<PolygonDataProps[]>([]);
  const { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: String(process.env.REACT_APP_GOOGLE_MAPS_API_KEY),
  });

  const center = useMemo(() => ({ lat: -22, lng: -48 }), []);

  useEffect(() => {
    fetchDataURL();
  }, []);

  useEffect(() => {
    getCoordinates();
  }, [place]);

  if (!isLoaded) return <div>Loading...</div>;

  async function fetchDataURL() {
    // Link is received from the database
    const URL =
      "https://gist.githubusercontent.com/devgl96/aabffe6cd971a7feb9e7813a0af9950c/raw/794b86818db1f43aecc68de4a9043f25a69c923a/Saneamento_example_2.kml";
    // const URL =
    //   "https://gist.githubusercontent.com/devgl96/6eff238e291c62664269477613c7e918/raw/8a3342bd048dbf19f93b879c3d711956236082ff/Saneamento_example_1.kml";
    const result = await axios
      .get(URL)
      .then((res) => res.data)
      .catch((err) => {
        console.error(err);
        return null;
      });

    if (result !== null) {
      const theKML = new DOMParser().parseFromString(result);
      const converted = kml(theKML);
      setPlace([converted.features]);
    }
  }

  console.log("place: ", place);

  function handleShowInfoWindow(index: number, ...rest: any) {
    console.log("rest: ", rest);
    const latLng = rest.latLng;
    const latitude = latLng.lat();
    const longitude = latLng.lng();

    setLatLng({ lat: latitude, lng: longitude });

    const getInfoWindowData = showInfoWindow.map((info, indexArr) => {
      if (indexArr === index) {
        return !info;
      }

      return info;
    });

    setShowInfoWindow(getInfoWindowData);
  }

  function handleCloseInfoWindow(index: number) {
    const getInfoWindowData = showInfoWindow.map((info, indexArr) => {
      if (indexArr === index) {
        return !info;
      }

      return info;
    });

    setShowInfoWindow(getInfoWindowData);
  }

  function getCoordinates() {
    if (!Object.keys(place).length) return;

    let coordArr: CoordinatesProps[] = [];
    let coordinatesData: PolygonDataProps[] = [];
    let infoWindowDataArr = [];
    let auxData: DataProps[] = [];

    place.forEach((region: any, index: number) => {
      let coordinates = region.geometry.coordinates[0];
      if (typeof coordinates === "object") {
        coordinates.map((coordinate: any, index: number) => {
          coordArr.push({ lat: coordinate[1], lng: coordinate[0] });
          auxData.push(activities[index]);
          infoWindowDataArr.push(false);
        });
      }

      coordArr.push({
        lat: region.geometry.coordinates[1],
        lng: region.geometry.coordinates[0],
      });
      auxData.push(activities[0]);
      infoWindowDataArr.push(false);
    });
    coordinatesData.push({ data: auxData, coordinates: coordArr });
    if (coordArr) {
      setPolygonData(coordinatesData);
    }
  }

  function renderMarkers() {
    if (!polygonData.length) return;

    return (
      <>
        {polygonData[0]?.coordinates.map((coord, index) => (
          <Marker
            position={coord}
            onClick={() => handleShowInfoWindow(index)}
            onLoad={(marker) => {
              const customIcon = (opts: any) =>
                Object.assign(
                  {
                    fillColor: "#00F",
                    fillOpacity: 1,
                    strokeColor: "#000",
                    strokeWeight: 1,
                  },
                  opts
                );

              marker.setIcon(
                customIcon({
                  fillColor: "blue",
                  strokeColor: "white",
                })
              );
              return;
            }}
          >
            {showInfoWindow[index] && (
              <InfoWindow
                position={{
                  lat: latLng.lat,
                  lng: latLng.lng,
                }}
                onCloseClick={() => handleCloseInfoWindow(index)}
              >
                <>
                  <h1>{polygonData[0].data[index].description}</h1>
                  <i>{polygonData[0].data[index].observation}</i>
                  <p>{`Latitude: ${latLng.lat} e Longitude: ${latLng.lng}`}</p>
                </>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </>
    );
  }

  console.log("Place: ", place);
  console.log("polygonData: ", polygonData);

  return (
    <>
      {polygonData && (
        <GoogleMap
          zoom={7}
          center={center}
          mapContainerClassName="map-container"
        >
          <>
            {polygonData?.map((data: any, index: number) => {
              return (
                <>
                  <Polyline
                    key={index}
                    path={data.coordinates}
                    options={{
                      strokeColor: "#341221",
                      strokeOpacity: 1,
                      strokeWeight: 2,
                    }}
                    // onClick={handleShowInfoWindow}
                  />
                </>
              );
            })}
          </>
          {renderMarkers()}
        </GoogleMap>
      )}
    </>
  );
}

export default App;
