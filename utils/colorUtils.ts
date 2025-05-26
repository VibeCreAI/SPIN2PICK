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
  console.log('🎨 reassignAllColors called with', activities.length, 'activities');
  console.log('🎨 Input activities:', activities.map(a => ({ name: a.name, color: a.color })));
  
  if (activities.length === 0) {
    console.log('🎨 No activities to color');
    return activities;
  }
  
  if (activities.length === 1) {
    const result = [{
      ...activities[0],
      color: PASTEL_COLORS[0]
    }];
    console.log('🎨 Single activity:', result[0]);
    return result;
  }
  
  const result = [...activities];
  const usedColors = new Set<string>();
  
  // Assign colors with proper circular conflict checking
  for (let i = 0; i < result.length; i++) {
    let bestColor = null;
    
    // Get adjacent activity indices (circular)
    const prevIndex = (i - 1 + result.length) % result.length;
    const nextIndex = (i + 1) % result.length;
    
    // Get colors of already assigned adjacent activities
    const prevColor = (i > 0) ? result[prevIndex].color : null;
    const nextColor = (i === result.length - 1 && result.length > 2) ? result[0].color : null;
    
    console.log(`🎨 Activity ${i} (${result[i].name}): checking against prev=${prevColor}, next=${nextColor}`);
    
    // FIRST PRIORITY: Try unused colors that don't conflict
    for (let colorIndex = 0; colorIndex < PASTEL_COLORS.length; colorIndex++) {
      const candidateColor = PASTEL_COLORS[colorIndex];
      
      // Skip if color is already used
      if (usedColors.has(candidateColor)) {
        continue;
      }
      
      // Check if this unused color conflicts with adjacent colors
      const conflictsWithPrev = prevColor && candidateColor === prevColor;
      const conflictsWithNext = nextColor && candidateColor === nextColor;
      
      if (!conflictsWithPrev && !conflictsWithNext) {
        bestColor = candidateColor;
        console.log(`🎨 Activity ${i}: Selected UNUSED color ${candidateColor} (index ${colorIndex})`);
        break;
      } else {
        console.log(`🎨 Activity ${i}: Skipped unused color ${candidateColor} (conflicts with adjacent)`);
      }
    }
    
    // SECOND PRIORITY: If no unused color works, reuse any non-conflicting color
    if (!bestColor) {
      console.log(`🎨 Activity ${i}: No unused colors available, trying reused colors`);
      for (let colorIndex = 0; colorIndex < PASTEL_COLORS.length; colorIndex++) {
        const candidateColor = PASTEL_COLORS[colorIndex];
        
        const conflictsWithPrev = prevColor && candidateColor === prevColor;
        const conflictsWithNext = nextColor && candidateColor === nextColor;
        
        if (!conflictsWithPrev && !conflictsWithNext) {
          bestColor = candidateColor;
          console.log(`🎨 Activity ${i}: Selected REUSED color ${candidateColor} (index ${colorIndex})`);
          break;
        }
      }
    }
    
    // Assign the best color (or fallback)
    const finalColor = bestColor || PASTEL_COLORS[i % PASTEL_COLORS.length];
    result[i] = {
      ...result[i],
      color: finalColor
    };
    
    // Track that this color is now used
    usedColors.add(finalColor);
  }
  
  console.log('🎨 Final output:', result.map(a => ({ name: a.name, color: a.color })));
  console.log('🎨 Used', usedColors.size, 'unique colors out of', PASTEL_COLORS.length, 'available');
  return result;
}; 