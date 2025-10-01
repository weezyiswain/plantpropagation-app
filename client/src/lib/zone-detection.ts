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

export async function detectUserLocation(retryCount = 0): Promise<LocationData | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.error(`[Zone Detection] Failed to detect location, status: ${response.status}`);
      
      // Retry once on failure
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return detectUserLocation(1);
      }
      return null;
    }
    
    const data = await response.json();
    
    return {
      zip: data.postal,
      city: data.city,
      region: data.region,
      country: data.country_name,
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch (error) {
    console.error('[Zone Detection] Error detecting location:', error);
    
    // Retry once on network error
    if (retryCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return detectUserLocation(1);
    }
    return null;
  }
}

export async function getHardinessZoneByZip(zipCode: string, retryCount = 0): Promise<string | null> {
  try {
    const response = await fetch(`https://phzmapi.org/${zipCode}.json`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.error(`[Zone Detection] Failed to get hardiness zone for ZIP ${zipCode}, status: ${response.status}`);
      
      // Retry once on failure
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getHardinessZoneByZip(zipCode, 1);
      }
      return null;
    }
    
    const data: HardinessZoneData = await response.json();
    
    // Return the full zone string (e.g., "6a") - phzmapi returns it correctly
    if (data.zone) {
      const cleanZone = data.zone.toLowerCase().trim();
      console.log('[Zone Detection] Hardiness zone from API:', cleanZone);
      return cleanZone;
    }
    
    return null;
  } catch (error) {
    console.error('[Zone Detection] Error getting hardiness zone:', error);
    
    // Retry once on network error
    if (retryCount === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getHardinessZoneByZip(zipCode, 1);
    }
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
    
    // Step 2: If we have a ZIP code (5 digits), attempt zone lookup
    // Don't strictly require US country name - territories and edge cases may vary
    if (location.zip && /^\d{5}$/.test(location.zip)) {
      const zone = await getHardinessZoneByZip(location.zip);
      
      if (zone) {
        console.log('[Zone Detection] Detected USDA zone:', zone);
        return zone;
      }
    }
    
    console.log('[Zone Detection] Could not determine hardiness zone (no valid ZIP code found)');
    return null;
  } catch (error) {
    console.error('[Zone Detection] Error in auto-detection:', error);
    return null;
  }
}
