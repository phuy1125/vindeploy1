"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/plugins/L.Icon.Pulse.js";
import "@/lib/plugins/L.Icon.Pulse.css";

import { MapFeature, ProvinceProperties, ProvinceStyle } from "@/types/map";
import LocationMarkers from "./LocationMarkers";

const VietnamMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [geojsonLayer, setGeojsonLayer] = useState<L.GeoJSON | null>(null);
  const [clickedLayer, setClickedLayer] = useState<string | null>(null);
  const [clickedLayerGid, setClickedLayerGid] = useState<number | null>(null);
  const originalStylesRef = useRef<Record<string, ProvinceStyle>>({});
  const [isMounted, setIsMounted] = useState(false);

  const lockMapInteraction = (map: L.Map) => {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
  };

  const unlockMapInteraction = (map: L.Map) => {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.touchZoom.enable();
  };

  const handleProvinceClick = (
    layer: L.Layer,
    feature: MapFeature,
    mapObj: L.Map,
    gjLayer: L.GeoJSON
  ) => {
    const polygon = layer as unknown as L.Polygon;
    const layerAsPath = layer as L.Path;

    if (polygon.getBounds) {
      const bounds = polygon.getBounds();
      const center = bounds.getCenter();
      setClickedLayer(feature.properties.ten_tinh);
      if (feature.properties.gid !== undefined) {
        setClickedLayerGid(feature.properties.gid);
      }
      mapObj.setView(center, 8);
      lockMapInteraction(mapObj);

      gjLayer.eachLayer((l) => {
        if (l !== layer) {
          (l as L.Path).off("click");
          (l as L.Path).setStyle({ fillColor: "#ffffff", color: "#ffffff" });
        }
      });

      layerAsPath.setStyle({
        fillColor: "#ff0000",
        color: "#ff7800",
      });

      layer.openPopup();
    }
  };

  useEffect(() => {
    setIsMounted(true);

    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    if (!isMounted || !mapRef.current || map) return;

    const initMap = () => {
      const mapInstance = L.map(mapRef.current!).setView(
        [14.0583, 108.2772],
        6
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      setMap(mapInstance);

      fetch("/province.json")
        .then((res) => res.json())
        .then(
          (
            data: GeoJSON.FeatureCollection<
              GeoJSON.Geometry,
              ProvinceProperties
            >
          ) => {
            const gjLayer = L.geoJSON(data, {
              onEachFeature: (feature: MapFeature, layer: L.Layer) => {
                const layerAsPath = layer as L.Path;

                originalStylesRef.current[feature.properties.ten_tinh] = {
                  color: layerAsPath.options.color || "#ff7800",
                  fillColor: layerAsPath.options.fillColor || "#ff0000",
                  fillOpacity: layerAsPath.options.fillOpacity || 0.4,
                };

                const popupContent = `
                <h3>${feature.properties.ten_tinh}</h3>
                ${
                  feature.properties.gid
                    ? `<p><strong>Mã tỉnh:</strong> ${feature.properties.gid}</p>`
                    : ""
                }
              `;
                layer.bindPopup(popupContent);

                layer.on("click", () =>
                  handleProvinceClick(layer, feature, mapInstance, gjLayer)
                );
              },
              style: () => ({
                color: "#ff7800",
                weight: 2,
                opacity: 0.6,
                fillColor: "#ff0000",
                fillOpacity: 0.4,
              }),
            }).addTo(mapInstance);

            setGeojsonLayer(gjLayer);
          }
        );
    };

    setTimeout(initMap, 100);
  }, [isMounted, map]);

  const handleBackClick = () => {
    if (!map || !geojsonLayer) return;

    map.setView([14.0583, 108.2772], 6);
    unlockMapInteraction(map);

    geojsonLayer.eachLayer((layer) => {
      const layerAsPath = layer as L.Path;
      const feature = (layer as L.Layer & { feature?: MapFeature }).feature;
      if (!feature) return;

      const featureName = feature.properties.ten_tinh;
      const originalStyle = originalStylesRef.current[featureName];
      if (originalStyle) {
        layerAsPath.setStyle({
          color: originalStyle.color,
          fillColor: originalStyle.fillColor,
          fillOpacity: originalStyle.fillOpacity,
        });
      }

      const popupContent = `
        <h3>${feature.properties.ten_tinh}</h3>
        ${
          feature.properties.gid
            ? `<p><strong>Mã tỉnh:</strong> ${feature.properties.gid}</p>`
            : ""
        }
      `;
      layer.bindPopup(popupContent);

      layer.on("click", () =>
        handleProvinceClick(layer, feature, map, geojsonLayer)
      );
    });

    // ✅ Reset state
    setClickedLayer(null);
    setClickedLayerGid(null); // 👈 Dòng bạn cần
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <button
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "18px",
          boxShadow: "0 6px 14px rgba(0, 123, 255, 0.6)",
          display: clickedLayer ? "block" : "none",
        }}
        onClick={handleBackClick}
      >
        Back
      </button>

      <div
        ref={mapRef}
        style={{
          height: "100vh",
          width: "100%",
          border: "0",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      />

      {map && (
        <LocationMarkers
          provinceGid={clickedLayerGid}
          map={map}
          shouldClear={clickedLayer === null}
        />
      )}
    </div>
  );
};

export default VietnamMap;
