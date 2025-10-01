interface LocationData {
  zip?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

interface HardinessZoneData {
  zone: string;
  temperature_range?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export async function detectUserLocation(): Promise<LocationData | null> {
  try {
    const response = await fetch('http://ip-api.com/json/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.error('Failed to detect location');
      return null;
    }
    
    const data = await response.json();
    
    return {
      zip: data.zip,
      city: data.city,
      region: data.regionName,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
}

export async function getHardinessZoneByZip(zipCode: string): Promise<string | null> {
  try {
    const response = await fetch(`https://phzmapi.org/${zipCode}.json`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.error(`Failed to get hardiness zone for ZIP ${zipCode}`);
      return null;
    }
    
    const data: HardinessZoneData = await response.json();
    
    // Return just the zone number (e.g., "6a" -> "6")
    // or the full zone if it matches our format
    if (data.zone) {
      const zoneMatch = data.zone.match(/^(\d+)[ab]?$/i);
      return zoneMatch ? zoneMatch[1] : data.zone;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting hardiness zone:', error);
    return null;
  }
}

export async function autoDetectUSDAZone(): Promise<string | null> {
  try {
    console.log('[Zone Detection] Starting auto-detection...');
    
    // Step 1: Get user's location from IP
    const location = await detectUserLocation();
    
    if (!location) {
      console.log('[Zone Detection] Could not detect location');
      return null;
    }
    
    console.log('[Zone Detection] Location detected:', location.city, location.region, location.zip);
    
    // Step 2: If we have a ZIP code, get hardiness zone
    if (location.zip && location.country === 'United States') {
      const zone = await getHardinessZoneByZip(location.zip);
      
      if (zone) {
        console.log('[Zone Detection] Detected USDA zone:', zone);
        return zone;
      }
    }
    
    console.log('[Zone Detection] Could not determine hardiness zone (non-US location or ZIP unavailable)');
    return null;
  } catch (error) {
    console.error('[Zone Detection] Error in auto-detection:', error);
    return null;
  }
}
