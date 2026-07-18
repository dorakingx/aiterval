export interface ListeningVoice {
  name: string;
  locale: string;
  default: boolean;
}
export interface AudioRequest {
  text: string;
  locale: string;
  voiceName?: string;
  rate: number;
  volume: number;
}
export interface AudioProvider {
  isAvailable(): boolean;
  getVoices(): Promise<ListeningVoice[]>;
  play(request: AudioRequest): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
}

export class SpeechAudioProvider implements AudioProvider {
  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window
    );
  }
  async getVoices(): Promise<ListeningVoice[]> {
    if (!this.isAvailable()) return [];
    const load = () =>
      speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
        .map((voice) => ({
          name: voice.name,
          locale: voice.lang,
          default: voice.default,
        }));
    const ready = load();
    if (ready.length) return ready;
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => resolve(load()), 1_500);
      speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          window.clearTimeout(timeout);
          resolve(load());
        },
        { once: true },
      );
    });
  }
  async play(request: AudioRequest): Promise<void> {
    if (!this.isAvailable())
      throw new Error(
        "No English speech voice is available. Check your system speech settings.",
      );
    this.stop();
    const voices = await this.getVoices();
    const voice =
      voices.find((item) => item.name === request.voiceName) ??
      voices.find((item) => item.locale === request.locale) ??
      voices[0];
    if (!voice)
      throw new Error(
        "No English voice is installed. Add an English system voice, then try again.",
      );
    const utterance = new SpeechSynthesisUtterance(request.text);
    utterance.voice =
      speechSynthesis.getVoices().find((item) => item.name === voice.name) ??
      null;
    utterance.lang = voice.locale;
    utterance.rate = request.rate;
    utterance.volume = request.volume;
    await new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error("Speech playback failed."));
      speechSynthesis.speak(utterance);
    });
  }
  pause(): void {
    if (this.isAvailable()) speechSynthesis.pause();
  }
  resume(): void {
    if (this.isAvailable()) speechSynthesis.resume();
  }
  stop(): void {
    if (this.isAvailable()) speechSynthesis.cancel();
  }
}
