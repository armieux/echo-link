
import { useState, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import EmergencyForm from "./EmergencyForm";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [2.3522, 48.8566], // Paris coordinates
        zoom: 11
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    // Cleanup
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

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Floating Action Button to show/hide form */}
      <Button
        className="absolute top-4 right-4 rounded-full shadow-lg"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus className="h-4 w-4" />
        <span className="ml-2">Nouveau signalement</span>
      </Button>

      {/* Emergency Form Modal with reduced size */}
      {showForm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[80vh] bg-white rounded-lg shadow-xl overflow-y-auto">
            <EmergencyForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
