/* ============================================================
   ATTRACTOR VOICE — Module voix drop-in
   Chemin LÉGER : reconnaissance vocale native du navigateur.
   Gratuit, temps réel, aucun backend. Se branche sur ton process existant.

   Usage minimal :
     const voix = new AttractorVoice({
       lang: "fr-FR",
       onInterim: (txt) => { ... },   // texte en cours (live)
       onFinal:   (txt) => { ... },   // texte final → à injecter dans ton flux
       onState:   (s)   => { ... },   // "listening" | "idle" | "error"
       onError:   (e)   => { ... },
     });
     boutonMicro.onclick = () => voix.toggle();

   Le point d'intégration = onFinal(texte). C'est LÀ que tu branches
   ta fonction d'envoi existante (ex: envoyerMessage(texte)).
   ============================================================ */

(function (global) {
  "use strict";

  const SR =
    global.SpeechRecognition ||
    global.webkitSpeechRecognition ||
    null;

  class AttractorVoice {
    constructor(opts = {}) {
      this.opts = Object.assign(
        {
          lang: "fr-FR",
          interim: true,        // afficher le texte en cours
          autoStopMs: 1800,     // silence avant arrêt auto (ms)
          onInterim: () => {},
          onFinal: () => {},
          onState: () => {},
          onError: () => {},
        },
        opts
      );
      this.supported = !!SR;
      this.listening = false;
      this._rec = null;
      this._silence = null;
      this._finalBuffer = "";
    }

    isSupported() {
      return this.supported;
    }

    toggle() {
      if (this.listening) this.stop();
      else this.start();
    }

    start() {
      if (!this.supported) {
        this.opts.onError({ type: "unsupported" });
        this.opts.onState("error");
        return;
      }
      if (this.listening) return;

      const rec = new SR();
      rec.lang = this.opts.lang;
      rec.continuous = true;
      rec.interimResults = this.opts.interim;
      rec.maxAlternatives = 1;

      this._finalBuffer = "";

      rec.onstart = () => {
        this.listening = true;
        this.opts.onState("listening");
      };

      rec.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            this._finalBuffer += res[0].transcript + " ";
          } else {
            interim += res[0].transcript;
          }
        }
        if (interim) this.opts.onInterim(interim.trim());
        // relance le minuteur de silence
        this._resetSilence();
      };

      rec.onerror = (e) => {
        // "no-speech", "not-allowed" (permission), "aborted", "network"…
        this.opts.onError({ type: e.error || "error", raw: e });
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          this.opts.onState("error");
        }
      };

      rec.onend = () => {
        this.listening = false;
        clearTimeout(this._silence);
        const finalTxt = this._finalBuffer.trim();
        if (finalTxt) this.opts.onFinal(finalTxt);
        this.opts.onState("idle");
      };

      this._rec = rec;
      try {
        rec.start();
      } catch (err) {
        this.opts.onError({ type: "start-failed", raw: err });
      }
    }

    stop() {
      if (this._rec && this.listening) {
        try {
          this._rec.stop();
        } catch (_) {}
      }
      clearTimeout(this._silence);
    }

    _resetSilence() {
      clearTimeout(this._silence);
      if (this.opts.autoStopMs > 0) {
        this._silence = setTimeout(() => this.stop(), this.opts.autoStopMs);
      }
    }
  }

  global.AttractorVoice = AttractorVoice;
})(window);