// Sound utilities using expo-audio (not expo-av)
let isAudioAvailable = false;
let createAudioPlayer: any = null;
let audioContextInitialized = false;

// Global mute state - will be updated by the app
let globalSoundMuted = false;

try {
  const audioModule = require('expo-audio');
  createAudioPlayer = audioModule.createAudioPlayer;
  isAudioAvailable = true;
  console.log('Expo Audio module loaded successfully');
} catch (error) {
  console.log('Expo Audio not available - sound will be disabled');
  isAudioAvailable = false;
}

// Audio player objects using expo-audio API
let clickPlayer: any = null;
let spinningPlayer: any = null;
let successPlayer: any = null;

// Initialize sounds
export const initSounds = async () => {
  if (!isAudioAvailable || !createAudioPlayer) {
    console.log('Audio not available - skipping sound initialization');
    return;
  }

  try {
    console.log('Loading sounds...');
    
    // Create audio players using expo-audio
    clickPlayer = createAudioPlayer(require('../assets/sounds/click.mp3'));
    spinningPlayer = createAudioPlayer(require('../assets/sounds/spinning.mp3'));
    successPlayer = createAudioPlayer(require('../assets/sounds/success.mp3'));

    console.log('Sounds loaded successfully');
  } catch (error) {
    console.error('Error loading sounds:', error);
  }
};

// Set global mute state
export const setSoundMuted = (muted: boolean) => {
  globalSoundMuted = muted;
  console.log(`🔊 Sound ${muted ? 'muted' : 'unmuted'}`);
};

// Play click sound
export const playClickSound = async () => {
  if (globalSoundMuted) return;
  
  try {
    if (clickPlayer) {
      clickPlayer.seekTo(0);
      clickPlayer.play();
    }
  } catch (error) {
    console.error('Error playing click sound:', error);
  }
};

// Play spinning sound
export const playSpinningSound = async () => {
  if (globalSoundMuted) return;
  
  try {
    if (spinningPlayer) {
      spinningPlayer.seekTo(0);
      spinningPlayer.play();
    }
  } catch (error) {
    console.error('Error playing spinning sound:', error);
  }
};

// Stop spinning sound
export const stopSpinningSound = async () => {
  try {
    if (spinningPlayer) {
      spinningPlayer.pause();
    }
  } catch (error) {
    console.error('Error stopping spinning sound:', error);
  }
};

// Initialize audio context on user interaction (required for mobile)
export const initializeAudioContext = async () => {
  if (!audioContextInitialized && isAudioAvailable) {
    try {
      console.log('🎵 Initializing audio context on user interaction...');
      audioContextInitialized = true;
      console.log('✅ Audio context initialized');
    } catch (error) {
      console.log('Audio context initialization failed:', error);
    }
  }
};

// Play success sound
export const playSuccessSound = async () => {
  if (globalSoundMuted) return;
  
  try {
    // Initialize audio context if not done yet
    if (!audioContextInitialized) {
      await initializeAudioContext();
    }
    
    if (successPlayer) {
      console.log('🔊 Playing success sound...');
      successPlayer.seekTo(0);
      successPlayer.play();
      console.log('✅ Success sound played');
    } else {
      console.log('❌ Success sound not available');
    }
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
};

// Clean up sounds when app closes
export const unloadSounds = async () => {
  try {
    if (clickPlayer) clickPlayer.remove();
    if (spinningPlayer) spinningPlayer.remove();
    if (successPlayer) successPlayer.remove();
  } catch (error) {
    console.error('Error unloading sounds:', error);
  }
}; 