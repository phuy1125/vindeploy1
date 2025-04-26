"use client";

import { useEffect, useState } from 'react';
import L from 'leaflet';
import { useRouter } from 'next/navigation';



interface Location {
  _id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
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
}

const LocationMarkers = ({
  provinceGid,
  map,
  shouldClear,
}: LocationMarkersProps) => {
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const router = useRouter();  // Hook để điều hướng trang

  useEffect(() => {
    if (!map || !provinceGid) return;

    const fetchLocations = async () => {
      try {
        const res = await fetch(`/api/locations?gid=${provinceGid}`);
        const json = await res.json();
        const locations: Location[] = json.data;

        // Clear existing markers
        markers.forEach((marker) => map.removeLayer(marker));

        const newMarkers = locations.map((loc) => {
          const pulseIcon = (L.icon as unknown as LIconExtended).pulse({
            iconSize: [20, 20],
            color: "black",
            heartbeat: 1,
          }) as L.Icon;

          const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
            icon: pulseIcon,
          })
            .addTo(map)
            .bindPopup(`<strong>${loc.name}</strong><br/>${loc.description || ''}`)
            .on('click', () => {
              // Khi click vào marker, điều hướng tới trang bài viết theo location
              router.push(`/location/post/${loc._id}?provinceGid=${provinceGid}`);  // Điều hướng đến trang bài viết của location
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
      markers.forEach((marker) => map.removeLayer(marker));
      setMarkers([]);
    };
  }, [provinceGid, map]);

  useEffect(() => {
    if (shouldClear && markers.length > 0) {
      markers.forEach((marker) => map.removeLayer(marker));
      setMarkers([]);
    }
  }, [shouldClear]);

  return null;
};

export default LocationMarkers;
