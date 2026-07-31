/* ============================================================
   ATTRACTOR VOICE — Client Whisper (chemin robuste)
   Enregistre l'audio dans le navigateur (MediaRecorder) et l'envoie
   à l'Edge Function Supabase "transcribe".

   Usage :
     const w = new AttractorWhisper({
       endpoint: "https://<PROJECT_REF>.supabase.co/functions/v1/transcribe",
       anonKey:  "<SUPABASE_ANON_KEY>",
       onState:  (s)   => {},   // "recording" | "transcribing" | "idle" | "error"
       onFinal:  (txt) => {},   // texte transcrit → branche ton envoi
       onError:  (e)   => {},
     });
     bouton.onclick = () => w.toggle();

   Même point d'intégration que le module léger : onFinal(texte).
   Tu peux donc garder le MÊME code d'envoi, peu importe le chemin choisi.
   ============================================================ */

(function (global) {
  "use strict";

  class AttractorWhisper {
    constructor(opts = {}) {
      this.opts = Object.assign(
        {
          endpoint: "",
          anonKey: "",
          maxMs: 60000, // sécurité : coupe à 60s
          onState: () => {},
          onFinal: () => {},
          onError: () => {},
        },
        opts
      );
      this.recording = false;
      this._rec = null;
      this._chunks = [];
      this._stream = null;
      this._timer = null;
    }

    isSupported() {
      return !!(navigator.mediaDevices && global.MediaRecorder);
    }

    toggle() {
      if (this.recording) this.stop();
      else this.start();
    }

    async start() {
      if (!this.isSupported()) {
        this.opts.onError({ type: "unsupported" });
        return;
      }
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        this.opts.onError({ type: "not-allowed", raw: e });
        this.opts.onState("error");
        return;
      }
      this._chunks = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      this._rec = new MediaRecorder(this._stream, mime ? { mimeType: mime } : undefined);

      this._rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this._chunks.push(e.data);
      };
      this._rec.onstop = () => this._upload();

      this._rec.start();
      this.recording = true;
      this.opts.onState("recording");
      this._timer = setTimeout(() => this.stop(), this.opts.maxMs);
    }

    stop() {
      clearTimeout(this._timer);
      if (this._rec && this.recording) {
        this.recording = false;
        try { this._rec.stop(); } catch (_) {}
        if (this._stream) this._stream.getTracks().forEach((t) => t.stop());
      }
    }

    async _upload() {
      this.opts.onState("transcribing");
      try {
        const blob = new Blob(this._chunks, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob, "audio.webm");

        const res = await fetch(this.opts.endpoint, {
          method: "POST",
          headers: this.opts.anonKey
            ? { Authorization: `Bearer ${this.opts.anonKey}` }
            : {},
          body: fd,
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          this.opts.onError({ type: "transcribe-failed", raw: data });
          this.opts.onState("error");
          return;
        }
        this.opts.onState("idle");
        if (data.texte) this.opts.onFinal(data.texte.trim());
      } catch (e) {
        this.opts.onError({ type: "network", raw: e });
        this.opts.onState("error");
      }
    }
  }

  global.AttractorWhisper = AttractorWhisper;
})(window);