export function calculateCentroid(geoJson) {
    const centroids = {};
  
    geoJson.features.forEach(feature => {
      const stateName = feature.properties.name;
      const coordinates = feature.geometry.coordinates;
  
      let totalX = 0;
      let totalY = 0;
      let totalPoints = 0;
  
      coordinates.forEach(polygon => {
        polygon[0].forEach(coord => {
          totalX += coord[0];
          totalY += coord[1];
          totalPoints++;
        });
      });
  
      const centroidX = totalX / totalPoints;
      const centroidY = totalY / totalPoints;
  
      centroids[stateName] = [centroidX, centroidY];
    });
  
    return centroids;
  }