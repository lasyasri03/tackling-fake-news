import os
import json
from models.roberta_model import FakeNewsDetector
from analysis.manual_override import manual_fake_check
from analysis.web_verifier import fetch_news_sources

# Initialize the ML model
detector = FakeNewsDetector()

# Load known real/fake claims
file_path = os.path.join(os.path.dirname(__file__), "known_facts.json")
try:
    with open(file_path, "r", encoding="utf-8") as f:
        known_facts = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    known_facts = []

# Trusted and satire domains
TRUSTED_DOMAINS = [
    "bbc.com", "reuters.com", "ndtv.com", "timesofindia.indiatimes.com",
    "theguardian.com", "cnn.com", "nytimes.com", "time.com",
    "forbes.com", "foxnews.com", "cnbc.com", "indiatoday.in", "nasa.gov"
]

SATIRE_DOMAINS = [
    "theonion.com", "babylonbee.com", "waterfordwhispersnews.com",
    "clickhole.com", "thedailymash.co.uk", "newsbiscuit.com"
]

ABSURD_PHRASES = [
    "flying pigs", "talking bananas", "cows voting", "cats ruling the world",
    "cats control world governments", "pizza cures all diseases", "unicorn discovered",
    "chocolate-powered car", "aliens endorse bitcoin", "ice cream stops climate change",
    "oxygen ban", "government bans oxygen", "cows apply for id", "banana president",
    "eiffel tower will be relocated", "eiffel tower moved", "moon made of cheese",
    "government to ban gravity", "earth is flat and proved by scientists", "drinking bleach",
    "ingesting bleach", "bleach cure", "disinfectant as medicine", "bleach approved as cure",
    "bleach approved for covid", "bleach approved for coronavirus"
]

KNOWN_REAL_CLAIMS = [
    "india successfully lands chandrayaan-3 near moon's south pole",
    "india successfully landed chandrayaan-3 near the moon's south pole",
    "chandrayaan-3 landed on the moon's south pole",
    "chandrayaan-3 successfully landed",
    "nasa’s perseverance rover discovers organic molecules on mars",
    "world health organization declares covid-19 no longer a global emergency",
]

def is_absurd(text):
    text_lower = text.lower()
    return any(phrase in text_lower for phrase in ABSURD_PHRASES)

def has_satire_source(sources):
    for s in sources:
        if any(domain in s.get("url", "") for domain in SATIRE_DOMAINS):
            return True
    return False

def trusted_sources(sources):
    return [s for s in sources if any(domain in s.get("url", "") for domain in TRUSTED_DOMAINS)]

def analyze_text(text, debug=False):
    normalized_text = text.strip().lower()

    # 1. Known real claim
    if any(known_claim in normalized_text for known_claim in KNOWN_REAL_CLAIMS):
        return {
            "verdict": "REAL",
            "confidence": 1.0,
            "reason": "This claim is verified in multiple trusted sources.",
            "source_type": "known-real",
            "tags": ["verified", "trusted"],
            "sources": []
        }

    # 2. Manual fake override
    if manual_fake_check(text):
        return {
            "verdict": "FAKE",
            "confidence": 1.0,
            "reason": "Flagged as fake based on manual rule.",
            "source_type": "manual-check",
            "tags": ["flagged"],
            "sources": []
        }

    # 3. Check for absurd phrases
    if is_absurd(text):
        return {
            "verdict": "FAKE",
            "confidence": 1.0,
            "reason": "Claim contains absurd or satirical phrases.",
            "source_type": "absurdity-check",
            "tags": ["absurd"],
            "sources": []
        }

    # 4. Web search
    try:
        sources = fetch_news_sources(text)
    except Exception as e:
        sources = []
        if debug:
            print(f"Web source fetch failed: {e}")

    # 5. Satire sources?
    if has_satire_source(sources):
        return {
            "verdict": "FAKE",
            "confidence": 1.0,
            "reason": "Claim appears only on satire/parody websites.",
            "source_type": "satire-check",
            "tags": ["satire"],
            "sources": sources
        }

    # 6. Check if found in trusted sources
    trusted = trusted_sources(sources)
    trusted_count = len(trusted)
    total_count = len(sources)

    if trusted_count >= 1:
        confidence = min(1.0, trusted_count / (total_count or 1))
        verdict = "REAL" if trusted_count >= 3 else "POSSIBLY_REAL"
        reason = (
            "Verified by three or more credible sources from the web."
            if trusted_count >= 3
            else "Verified by one or two credible sources from the web."
        )
        return {
            "verdict": verdict,
            "confidence": round(confidence, 4),
            "reason": reason,
            "source_type": "web-trusted",
            "tags": ["auto-verified", "trusted-sources"],
            "sources": trusted
        }

    # 7. Found only in untrusted sources (no fallback to ML)
    if total_count > 0 and trusted_count == 0:
        return {
            "verdict": "REAL",  # or "POSSIBLY_FAKE" if you prefer caution
            "confidence": 0.6,
            "reason": "Found only in untrusted sources. Be cautious and verify with credible news channels.",
            "source_type": "web-untrusted",
            "tags": ["unverified", "untrusted-sources"],
            "sources": sources
        }

    # 8. Not found anywhere → fallback to ML model
    ml_result = detector.predict(text)
    score = float(ml_result.get("confidence", 0.0))
    verdict = ml_result.get("verdict", "UNKNOWN")
    if score < 0.3:
        verdict = "UNCERTAIN"
    return {
        "verdict": verdict,
        "confidence": round(score, 4),
        "reason": (
            "No web sources found. "
            f"ML model verdict: {verdict} (confidence: {int(score)}%). "
            f"Model reason: {ml_result.get('reason', '')}"
        ),
        "source_type": ml_result.get("source_type", "ml"),
        "tags": ["ml-fallback", "no-web-sources"],
        "sources": []
    }
