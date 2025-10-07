export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getPlantSlug(plant: { name?: string; common_name?: string }): string {
  const nameToUse = plant.name || plant.common_name || 'unknown-plant';
  return createSlug(nameToUse);
}
