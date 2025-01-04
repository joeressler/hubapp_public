class AudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      // Convert to 16-bit PCM and send
      const audioData = this.floatTo16BitPCM(input[0]);
      this.port.postMessage(audioData);
    }
    return true;
  }

  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return new Uint8Array(buffer);
  }
}

registerProcessor('audio-processor', AudioProcessor); 