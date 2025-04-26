"use client";

import { useEffect, useState } from 'react';
import L from 'leaflet';
import { point } from '@turf/turf'; 
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { useRouter } from "next/navigation";
interface Location {
  _id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
interface ProvinceFeatureProps {
  gid: number;
  ten_tinh: string;
}


interface PulseIconOptions extends L.DivIconOptions {
  heartbeat?: number;
  animate?: boolean;
  color?: string;
  fillColor?: string;
}

declare global {
  interface LIconExtended {
    pulse: (options: PulseIconOptions) => L.Icon;
  }
}

interface LocationMarkersProps {
  provinceGid: number | null;
  map: L.Map;
  shouldClear?: boolean;
  geojsonLayer: L.GeoJSON | null;
  locationsVersionDeleted?: number;
  onLocationAdded?: () => void;
}

const LocationMarkers = ({ provinceGid, map, shouldClear, geojsonLayer, onLocationAdded,locationsVersionDeleted  }: LocationMarkersProps) => {
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const router = useRouter();
  const checkLocationInDatabase = async (lat: number, lng: number, gid: number) => {
    try {
      const res = await fetch(`/api/locations?gid=${gid}`);
      const json = await res.json();
      const locations: Location[] = json.data;

      const existingLocation = locations.find(loc =>
        loc.coordinates.lat === lat && loc.coordinates.lng === lng
      );

      return existingLocation;
    } catch (error) {
      console.error('Error checking location in database:', error);
      return null;
    }
  };

  const addLocationToDatabase = async (
    lat: number,
    lng: number,
    provinceGid: number,
  ): Promise<string | null> => {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({lat, lng, provinceGid }),
      });
  
      const result = await response.json();
  
      if (result.error) {
        alert('Có lỗi khi thêm địa điểm.');
        return null;
      } else {
        alert('Địa điểm đã được thêm thành công!');
        return result.data._id; // 🟢 Trả về id
      }
    } catch (error) {
      console.error('Error adding location to database:', error);
      alert('Có lỗi khi thêm địa điểm.');
      return null;
    }
  };
  
  

  const isLatLngInProvince = (lat: number, lng: number): boolean => {
    if (!geojsonLayer || !provinceGid) return false;
  
    let found = false;
  
    geojsonLayer.eachLayer((layer: L.Layer) => {
      const typedLayer = layer as L.Layer & {
        feature?: GeoJSON.Feature<GeoJSON.Geometry, ProvinceFeatureProps>;
      };
  
      const feature = typedLayer.feature;
  
      if (
        feature &&
        feature.properties.gid === provinceGid &&
        (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon")
      ) {
        // Cast geometry to correct type
        const polygonFeature = feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, ProvinceFeatureProps>;
        const turfPoint = point([lng, lat]);
        if (booleanPointInPolygon(turfPoint, polygonFeature)) {
          found = true;
        }
      }
    });
  
    return found;
  };
  

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
  
    if (!provinceGid || !isLatLngInProvince(lat, lng)) {
      alert('Bạn chỉ được phép thêm địa điểm trong khu vực tỉnh đã chọn!');
      return;
    }
  
    if (!popupVisible) {
      const existingLocation = await checkLocationInDatabase(lat, lng, provinceGid);
  
      if (!existingLocation) {
        const isConfirmed = window.confirm('Vị trí này chưa có trong cơ sở dữ liệu. Bạn có muốn thêm địa điểm không?');
            const locationId = await addLocationToDatabase( lat, lng, provinceGid);
            console.log(locationId);
            router.push(`/admin/locations/new/${locationId}`);
      } else {
        alert('Vị trí này đã có trong cơ sở dữ liệu.');
      }
  
      setPopupVisible(true);
    }
  };
  
  useEffect(() => {
    if (!map || !provinceGid) return;

    map.on('click', handleMapClick);

    const fetchLocations = async () => {
      try {
        const res = await fetch(`/api/locations?gid=${provinceGid}`);
        const json = await res.json();
        const locations: Location[] = json.data;

        markers.forEach(marker => map.removeLayer(marker));

        const newMarkers = locations.map((loc) => {
          const pulseIcon = ((L.icon as unknown as LIconExtended).pulse({
            iconSize: [20, 20],
            color: 'black',
            heartbeat: 1
          })) as L.Icon;

          const marker = L.marker(
            [loc.coordinates.lat, loc.coordinates.lng],
            { icon: pulseIcon }
          )
            .addTo(map)
            .bindPopup(`<strong>${loc.name}</strong><br/>${loc.description || ''}
              <button class="view-posts-btn" data-location-id="${loc._id}">Xem bài viết</button>
            `);
            marker.on('popupopen', () => {
              setTimeout(() => {
                const btn = document.querySelector('.view-posts-btn');
                if (btn) {
                  btn.addEventListener('click', (e) => {
                    const locationId = (e.target as HTMLElement).getAttribute('data-location-id');
                    router.push(`/spaceshare?location_id=${locationId}`);
                  });
                }
              }, 100);
            });
          return marker;
        });

        setMarkers(newMarkers);
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };

    fetchLocations();

    return () => {
      map.off('click', handleMapClick);
      markers.forEach(marker => map.removeLayer(marker));
      setMarkers([]);
    };
  }, [provinceGid, map, locationsVersionDeleted, router]);

  useEffect(() => {
    if (shouldClear && markers.length > 0) {
      markers.forEach(marker => map.removeLayer(marker));
      setMarkers([]);
    }
  }, [shouldClear]);

  return null;
};

export default LocationMarkers;
