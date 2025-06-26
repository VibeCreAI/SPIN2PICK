// Curated 30-color palette for beautiful, distinct pie slices (arranged in rainbow order)
export const PASTEL_COLORS = [
  '#FFACAB', // Light red
  '#FFCEA2', // Light orange
  '#FFF29C', // Light yellow
  '#E4FEBD', // Light lime
  '#C2FFE1', // Mint
  '#ABFCFE', // Cyan
  '#C5E5FE', // Sky blue
  '#C4D1FE', // Periwinkle
  '#DDC4FC', // Light violet
  '#FEE0F3', // Light pink
  '#FFC7C6', // Coral
  '#FFD7B3', // Peach
  '#FFF6BA', // Pale yellow
  '#E9F8CF', // Pale green
  '#D1FFE9', // Light mint
  '#C7FDF7', // Light mint
  '#D4ECFF', // Light blue
  '#DAE1FE', // Light lavender
  '#EAD9FE', // Pale purple
  '#FDC6E6', // Pink
  '#FEDBD5', // Light coral
  '#FEFADC', // Cream yellow
  '#E9FFF3', // Very light mint
  '#E1FEFF', // Very light cyan
  '#E6F4FF', // Very light blue
  '#E5EAFF', // Lavender blue
  '#F4E9FF', // Light purple
  '#FFB7E1', // Bright pink
  '#FFF0E1', // Cream
  '#EFEADB', // Beige
];

export interface Activity {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

// Reassign colors optimally to all activities
export const reassignAllColors = (activities: Activity[]): Activity[] => {
  const numActivities = activities.length;
  const numColors = PASTEL_COLORS.length;

  if (numActivities === 0) {
    return [];
  }

  // Create a new array of activities to avoid modifying the original array directly.
  const result = activities.map(activity => ({ ...activity, color: '' }));

  for (let i = 0; i < numActivities; i++) {
    const forbidden = new Set<string>();

    // Add the previous slice's color to the forbidden set.
    if (i > 0) {
      forbidden.add(result[i - 1].color);
    }

    // For the last slice, it must also not conflict with the first slice's color
    // to ensure a seamless wrap-around on the wheel.
    if (i === numActivities - 1 && numActivities > 1) {
      forbidden.add(result[0].color);
    }

    let bestColor = '';
    
    // To make the color distribution visually appealing and not biased towards
    // the start of the palette, we begin our search from a different point
    // in the color list for each slice. Using `i % numColors` ensures we still
    // generally follow the beautiful rainbow sequence of the curated palette.
    const startIdx = i % numColors;

    for (let j = 0; j < numColors; j++) {
      const colorIdx = (startIdx + j) % numColors;
      const candidateColor = PASTEL_COLORS[colorIdx];
      if (!forbidden.has(candidateColor)) {
        bestColor = candidateColor;
        break; // Found a suitable color.
      }
    }

    // As a fallback (which should rarely, if ever, be needed with more than 2 colors),
    // if all colors are forbidden, we just pick the next in sequence and accept a conflict.
    if (bestColor === '') {
      bestColor = PASTEL_COLORS[startIdx];
    }

    result[i].color = bestColor;
  }

  return result;
}; 