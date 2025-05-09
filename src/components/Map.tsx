import { useState, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import EmergencyForm from "./EmergencyForm";
import { supabase } from "@/integrations/supabase/client";
import {useAuth} from "@/contexts/AuthContext.tsx";

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

const Map = () => {

  const [showForm, setShowForm] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  let latitude = 0;
  let longitude = 0;
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowForm(false);
      }
    };

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowForm(false);
      }
    };

    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showForm]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create the map only once
    if (!map.current) {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) {
        console.error('Mapbox token not found in environment variables');
        return;
      }

      mapboxgl.accessToken = token;

      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [5.3522, 42.8566], // default coordinates (Paris)
        zoom: 11
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Get user's geolocation
      navigator.geolocation.getCurrentPosition(
          async (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            map.current?.setCenter([longitude, latitude]);

            // Fetch the user's profile
            const { data: data, error: userError } = await supabase.auth.getUser();
            if (userError) {
              console.error('Error fetching user:', userError);
              return;
            }

            // Update the user's profile with the new location
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ location: `POINT(${longitude} ${latitude})` })
                .eq('id', data.user.id);

            if (updateError) {
              console.error('Error updating user location:', updateError);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            // You can leave the map centered on Paris or handle a fallback
          }
      );
    }

    // Cleanup when the component is unmounted
    return () => {
      map.current?.remove();
    };
  }, []);

  // Fetch initial reports
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      setReports(data);
    };

    fetchReports();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
        .channel('reports-channel')
        .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'reports'
            },
            async (payload) => {
              // Fetch all reports again to ensure consistency
              const { data, error } = await supabase
                  .from('reports')
                  .select('*')
                  .order('created_at', { ascending: false });

              if (error) {
                console.error('Error fetching reports:', error);
                return;
              }

              setReports(data);
            }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    reports.forEach((report) => {
      const getPriorityColor = (priority: number) => {
        if (priority >= 75) return '#FF0000';
        if (priority >= 50) return '#FFA500';
        if (priority >= 25) return '#FFFF00';
        return '#00FF00';
      };

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getPriorityColor(report.priority);
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${report.title}</h3>
          <p class="text-sm text-gray-600">${report.description}</p>
          <p class="text-xs text-gray-500 mt-1">
            Catégorie: ${report.category}<br>
            Priorité: ${report.priority}
          </p>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
          .setLngLat([report.longitude, report.latitude])
          .setPopup(popup)
          .addTo(map.current!);
    });
  }, [reports]);

  // Center map on current location
  const centerOnCurrentLocation = () => {
    //if latitude and longitude are not null
    if (latitude && longitude) {
      map.current?.setCenter([longitude, latitude]);
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          map.current?.setCenter([longitude, latitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
    );
  };

  return (
      <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Center on Current Location Button */}
        <button
            onClick={centerOnCurrentLocation}
            className="absolute top-4 left-4 z-10 p-2 bg-white rounded shadow-md"
        >
          Centrer sur ma position
        </button>

        {/* Emergency Form Modal */}
        {showForm && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div ref={modalRef} className="w-full max-w-md max-h-[80vh] bg-white rounded-lg shadow-xl overflow-y-auto">
                <EmergencyForm onClose={() => setShowForm(false)} />
              </div>
            </div>
        )}
      </div>
  );
};

export default Map;